import { NextApiRequest, NextApiResponse } from 'next'
import { Bot } from 'grammy'

import { ClubMember } from '@/lib/ClubMember'
import { createRegisterOfMemberEntry } from '@/lib/notion'
import { getEnv } from '@/lib/get-config-value'
import { notificationMessages } from '@/lib/get-notification-messages'

// Create a new bot instance
const bot = new Bot(getEnv('NEXT_TELEGRAM_TOKEN'))
bot.start()

const chat_id = Number(getEnv('NEXT_TELEGRAM_CHAT_ID'))
const message_thread_id = Number(getEnv('NEXT_TELEGRAM_MESSAGE_THREAD_ID'))

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).send({ error: 'method not allowed' })
  }

  try {
    console.log('<<< typeof body', typeof req.body)
    const newClubMember = ClubMember.deserialize(JSON.parse(req.body))
    console.log('<<< lambda create-database-entry', newClubMember)

    const registrationResults = await createRegisterOfMemberEntry(newClubMember)
    console.log('>>> lambda create-database-entry', registrationResults)

    // send telegram notification
    const message = notificationMessages.newSubscription({
      member: newClubMember,
      isSuccesfullyRegistered: !!registrationResults.id,
      isMailSent: false
    })
    await bot.api.sendMessage(chat_id, message, {
      message_thread_id,
      parse_mode: 'HTML'
    })

    res.status(200).json({ ok: true })
  } catch (error) {
    console.log('>>> da error', error)
    return res.status(400).send({ error: 'something bad happened' })
  }
}
