import { NextApiRequest, NextApiResponse } from 'next'

import { ClubMember } from '@/lib/ClubMember'
import { createRegisterOfMemberEntry } from '@/lib/notion'
import { notificationMessages } from '@/lib/get-notification-messages'
import { bot, CHAT_ID, MESSAGE_THREAD_ID } from '@/lib/telegram-bot'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).send({ error: 'method not allowed' })
  }

  const newClubMember = ClubMember.deserialize(JSON.parse(req.body))

  let isSuccessfullyRegistered = false
  try {
    console.log('<<< typeof body', typeof req.body)
    console.log('<<< lambda create-database-entry', newClubMember)

    const results = await createRegisterOfMemberEntry(newClubMember)
    console.log('>>> lambda create-database-entry', results.id)

    isSuccessfullyRegistered = !!results.id

    res.status(200).json({ ok: true })
  } catch (error) {
    console.log('>>> da error', error)
    return res.status(400).send({ error: 'something bad happened' })
  }

  try {
    // send telegram notification
    const message = notificationMessages.newSubscription({
      member: newClubMember,
      isSuccessfullyRegistered
    })
    console.log('<<< lambda send-notification', {
      CHAT_ID,
      message,
      message_thread_id: MESSAGE_THREAD_ID,
      parse_mode: 'HTML'
    })
    const telegramResult = await bot.api.sendMessage(CHAT_ID, message, {
      message_thread_id: MESSAGE_THREAD_ID,
      parse_mode: 'HTML'
    })
    console.log('>>> lambda send-notification', telegramResult)
  } catch (error) {
    console.log('>>> da error', error)
  }
}
