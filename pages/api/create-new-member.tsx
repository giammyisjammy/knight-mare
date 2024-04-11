import { NextApiRequest, NextApiResponse } from 'next'

import { Effect, Exit, pipe, Cause, ReadonlyArray, Either } from 'effect'

import { ClubMember } from '@/lib/ClubMember'
import { createRegisterOfMemberEntry } from '@/lib/notion'
import { notificationMessages } from '@/lib/get-notification-messages'
import { bot } from '@/lib/telegram-bot'
import { failWrapper } from '@/lib/utils'

import * as config from '@/lib/config'

import { batchRegistrationEmails } from '@/lib/batch-registration-emails'

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
  console.log('<<< lambda invoke-cron')

  await Effect.runPromiseExit(batchRegistrationEmails).then(
    Exit.match({
      onFailure: (cause) =>
        pipe(
          cause,
          Cause.match({
            onEmpty: '(empty)',
            onFail: (error) => `(error: ${error.message})`,
            onDie: (defect) => `(defect: ${defect})`,
            onInterrupt: (fiberId) => `(fiberId: ${fiberId})`,
            onSequential: (left, right) =>
              `(onSequential (left: ${left}) (right: ${right}))`,
            onParallel: (left, right) =>
              `(onParallel (left: ${left}) (right: ${right})`
          }),
          (message) => console.log('>>> Failed to invoke cron job', message)
        ),
      onSuccess: (results) => {
        const hasErrors = !ReadonlyArray.every(Either.isRight)(results)
        const message = hasErrors
          ? `Some emails weren't sent, check your logs`
          : 'Successfully sent all registration emails'
        console.log('>>> lambda invoke-cron', { message })
        res.status(200).end()
      }
    })
  )
}
