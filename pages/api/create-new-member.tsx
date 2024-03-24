import { NextApiRequest, NextApiResponse } from 'next'

import { ClubMember } from '@/lib/ClubMember'
import { createRegisterOfMemberEntry } from '@/lib/notion'
import { notificationMessages } from '@/lib/get-notification-messages'
import { bot } from '@/lib/telegram-bot'
import { failWrapper } from '@/lib/utils'
import { batchRegistrationEmails } from '@/lib/batch-registration-emails'

import * as config from '@/lib/config'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const fail = failWrapper(res)

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return fail('Method not allowed', 405)
  }

  let isSuccessfullyRegistered = false

  // Parse user input
  let newClubMember: ClubMember
  try {
    newClubMember = ClubMember.deserialize(JSON.parse(req.body))
  } catch (error) {
    return fail('Failed to parse user input', 400)
  }

  // Update Notion database with user entry
  try {
    console.log('<<< typeof body', typeof req.body)
    console.log('<<< lambda create-database-entry', newClubMember)

    const results = await createRegisterOfMemberEntry(newClubMember)
    console.log('>>> lambda create-database-entry', results.id)

    isSuccessfullyRegistered = !!results.id

    res.status(200).json({ ok: !!results.id })
  } catch (error: unknown) {
    return fail((error as Error).message)
  }

  // Send telegram notification
  try {
    const { message_thread_id, chatId } = config.telegram
    const message = notificationMessages.newSubscription({
      member: newClubMember,
      isSuccessfullyRegistered
    })
    const options = { message_thread_id, parse_mode: 'HTML' } as const
    console.log('<<< lambda send-notification', { chatId, message, options })
    const telegramResult = await bot.api.sendMessage(chatId, message, options)
    // TODO store telegramResult to later update the message with cron mail outcome
    console.log('>>> lambda send-notification', telegramResult)
  } catch (error: unknown) {
    console.log('>>> Telegram bot error', error)
  }

  // Invoke cron to send email
  try {
    console.log('<<< lambda invoke-cron')

    await batchRegistrationEmails()

    console.log('>>> lambda invoke-cron', { ok: true })
  } catch (error: unknown) {
    console.log('>>> Failed to invoke cron job', error)
  }
}
