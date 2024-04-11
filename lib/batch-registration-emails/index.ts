import { Effect, Either, ReadonlyArray, pipe } from 'effect'

import chalk from 'chalk'

import { ClubMember } from '@/lib/ClubMember'
import { MEMBERSHIP_STATUS } from '@/lib/constants'

import { isValidEmail } from './schema'
import {
  retrieveNewMembers,
  downloadTemplate,
  prepareAttachment,
  sendMail,
  updateDatabaseEntity
} from './services'

const registrationFlow = (member: ClubMember) =>
  Effect.gen(function* (_) {
    yield* _(isValidEmail(member.email))

    const pdfFilePath = yield* _(downloadTemplate({ member }))
    const pdfBytes = yield* _(prepareAttachment({ member, pdfFilePath }))
    yield* _(sendMail({ member, pdfBytes }))

    const updatedMember = ClubMember.deserialize({
      ...member.serialize(),
      membershipStatus: MEMBERSHIP_STATUS.Waiting
    })
    yield* _(updateDatabaseEntity(updatedMember))

    return member.id
  })

class NoMembersUpdatedError extends Error {
  readonly _tag = 'NoMembersUpdatedError'
}
export const batchRegistrationEmails = Effect.gen(function* (_) {
  const { results: notionMembers } = yield* _(retrieveNewMembers())

  const members = notionMembers.map(ClubMember.fromNotionPageEntry)
  const iterable = members.map(registrationFlow)
  const combinedEffect = Effect.all(iterable, { mode: 'either' })
  const results = yield* _(combinedEffect)

  // Fails only if list is not empty and every effect has failed
  const atLeastOneSuccess = ReadonlyArray.some(Either.isRight)(results)
  const isBatchSuccessful =
    notionMembers.length === 0 ||
    Boolean(notionMembers.length > 0 && atLeastOneSuccess)

  // logging
  // TODO move elsewhere(?)
  const hasErrors = !ReadonlyArray.every(Either.isRight)(results)
  const badge = isBatchSuccessful
    ? hasErrors
      ? chalk.yellow(`warning`)
      : chalk.blue(`success`)
    : chalk.red('failure')
  console.log(`--- ${badge} batchRegistrationEmails ---`)
  console.log('retrieved', notionMembers.length, 'entries')
  results.forEach((entry, i) =>
    pipe(
      entry,
      Either.match({
        onLeft: (error) => console.log(chalk.red(error.message)),
        onRight: () => console.log(chalk.blue(`${members[i].id} Ok`))
      })
    )
  )
  console.log(`--- ${badge} batchRegistrationEmails END ---`)

  if (!isBatchSuccessful)
    yield* _(
      Effect.fail(
        new NoMembersUpdatedError("couldn't update any members, check logs")
      )
    )

  return results
})
