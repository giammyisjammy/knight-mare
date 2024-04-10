import { Effect, Either, ReadonlyArray, pipe } from 'effect'

import { Schema } from '@effect/schema'

import { ClubMember } from '@/lib/ClubMember'
import * as drive from '@/lib/google/drive'
import * as notion from '@/lib/notion'
import { fillPdfForm, getTemplateId } from '@/lib/populate-pdf-form'
import { sendWelcomeMail } from '@/lib/send-welcome-mail'

import { MEMBERSHIP_STATUS } from '../constants'

// TODO code is completely unorganized, needs tidy up work

class RetrieveNewMembersError extends Error {
  readonly _tag = 'RetrieveNewMembersError'
}
const retrieveNewMembers = () =>
  Effect.tryPromise({
    try: notion.retrieveNewMembers,
    catch: (unknown) => new RetrieveNewMembersError(`${unknown}`)
  })

class DownloadTemplateError extends Error {
  readonly _tag = 'DownloadTemplateError'
}
const downloadTemplate = ({ member }: { member: ClubMember }) =>
  Effect.tryPromise({
    try: () => pipe(member, getTemplateId, drive.download),
    catch: (unknown) => new DownloadTemplateError(`${unknown}`)
  })

class PrepareAttachmentError extends Error {
  readonly _tag = 'PrepareAttachmentError'
}
const prepareAttachment = ({
  pdfFilePath,
  member
}: {
  pdfFilePath: string
  member: ClubMember
}) =>
  Effect.tryPromise({
    try: () => fillPdfForm(pdfFilePath, member),
    catch: (unknown) => new PrepareAttachmentError(`${unknown}`)
  })

class SendMailError extends Error {
  readonly _tag = 'SendMailError'
}
const sendMail = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pdfBytes,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  member
}: {
  pdfBytes: Uint8Array
  member: ClubMember
}) =>
  Effect.tryPromise({
    try: () => sendWelcomeMail(member, pdfBytes),
    catch: (unknown) => new SendMailError(`${unknown}`)
  })

class UpdateDatabaseEntityError extends Error {
  readonly _tag = 'UpdateDatabaseEntityError'
}
const updateDatabaseEntity = (member: ClubMember) =>
  Effect.tryPromise({
    try: () => notion.updateMember(member),
    catch: (unknown) => new UpdateDatabaseEntityError(`${unknown}`)
  })

const emailValidationRegex =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i
export const EmailBrand = pipe(
  Schema.string,
  Schema.filter((str) => emailValidationRegex.test(str)),
  Schema.brand('EmailBrand')
)
export type EmailBrand = Schema.Schema.Type<typeof EmailBrand>
const isValidEmail = (x: unknown) => Schema.decodeUnknownEither(EmailBrand)(x)

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
    const result = yield* _(updateDatabaseEntity(updatedMember))

    return result
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

  // Fails only if when every operation has failed
  const atLeastOneSuccess = ReadonlyArray.some(Either.isRight)(results)
  if (!atLeastOneSuccess) yield* _(Effect.fail(new NoMembersUpdatedError()))

  return results
})

// export function batchRegistrationEmails() {
//   const stream = pipe(
//     retrieveNewMembers(),
//     Effect.map(({ results }) => results),
//     Stream.fromIterableEffect,
//     Stream.map(ClubMember.fromNotionPageEntry),
//     Stream.filter(({ email }) => !!email),
//     Stream.flatMap((member) =>
//       Stream.Do.pipe(
//         Stream.let('member', () => member),
//         Stream.bind('pdfFilePath', downloadTemplate),
//         Stream.bind('pdfBytes', prepareAttachment),
//         Stream.bind('mailResult', sendMail)
//       )
//     ),
//     Stream.map(({ member }) =>
//       ClubMember.deserialize({
//         ...member.serialize(),
//         membershipStatus: MEMBERSHIP_STATUS.Waiting
//       })
//     ),
//     Stream.flatMap(updateDatabaseEntity)
//   )

//   const collectedData = Stream.runCollect(stream)

//   return collectedData
// }
