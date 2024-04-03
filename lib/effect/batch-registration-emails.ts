import { Effect, Stream, pipe } from 'effect'

import { ClubMember } from '@/lib/ClubMember'
import * as drive from '@/lib/google/drive'
import * as notion from '@/lib/notion'
import { fillPdfForm, getTemplateId } from '@/lib/populate-pdf-form'
import { sendWelcomeMail } from '@/lib/send-welcome-mail'

import { MEMBERSHIP_STATUS } from '../constants'

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
  pdfBytes,
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

export async function batchRegistrationEmails() {
  const program = pipe(
    retrieveNewMembers(),
    Effect.map(({ results }) => results),
    Stream.fromIterableEffect,
    Stream.map(ClubMember.fromNotionPageEntry),
    Stream.filter(({ email }) => !!email),
    Stream.flatMap((member) =>
      Stream.Do.pipe(
        Stream.let('member', () => member),
        Stream.bind('pdfFilePath', downloadTemplate),
        Stream.bind('pdfBytes', prepareAttachment),
        Stream.bind('mailResult', sendMail)
      )
    ),
    Stream.map(({ member }) =>
      ClubMember.deserialize({
        ...member.serialize(),
        membershipStatus: MEMBERSHIP_STATUS.Waiting
      })
    ),
    Stream.flatMap(updateDatabaseEntity)
  )

  const collectedData = Stream.runCollect(program)
  Effect.runPromiseExit(collectedData).then(console.log)
}
