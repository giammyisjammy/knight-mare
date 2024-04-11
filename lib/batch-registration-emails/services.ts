import { Effect, pipe } from 'effect'

import { ClubMember } from '@/lib/ClubMember'

import * as drive from '@/lib/google/drive'
import * as notion from '@/lib/notion'
import { sendWelcomeMail } from '@/lib/send-welcome-mail'

import { getTemplateId, fillPdfForm } from '@/lib/populate-pdf-form'

// import { Dummy } from './testing'

export class RetrieveNewMembersError extends Error {
  readonly _tag = 'RetrieveNewMembersError'
}
export const retrieveNewMembers = () =>
  Effect.tryPromise({
    try: notion.retrieveNewMembers,
    catch: (unknown) => new RetrieveNewMembersError(`${unknown}`)
  })

export class DownloadTemplateError extends Error {
  readonly _tag = 'DownloadTemplateError'
}
export const downloadTemplate = ({ member }: { member: ClubMember }) =>
  Effect.tryPromise({
    try: () => pipe(member, getTemplateId, drive.download),
    catch: (unknown) => new DownloadTemplateError(`${member.id} ${unknown}`)
  })

export class PrepareAttachmentError extends Error {
  readonly _tag = 'PrepareAttachmentError'
}
export const prepareAttachment = ({
  pdfFilePath,
  member
}: {
  pdfFilePath: string
  member: ClubMember
}) =>
  Effect.tryPromise({
    try: () => fillPdfForm(pdfFilePath, member),
    catch: (unknown) => new PrepareAttachmentError(`${member.id} ${unknown}`)
  })

export class SendMailError extends Error {
  readonly _tag = 'SendMailError'
}
export const sendMail = ({
  pdfBytes,
  member
}: {
  pdfBytes: Uint8Array
  member: ClubMember
}) =>
  Effect.tryPromise({
    try: () => sendWelcomeMail(member, pdfBytes),
    // try: () => Dummy.sendWelcomeMail(member, pdfBytes),
    catch: (unknown) => new SendMailError(`${member.id} ${unknown}`)
  })

export class UpdateDatabaseEntityError extends Error {
  readonly _tag = 'UpdateDatabaseEntityError'
}

export const updateDatabaseEntity = (member: ClubMember) =>
  Effect.tryPromise({
    try: () => notion.updateMember(member),
    // try: () => Dummy.updateMember(member),
    catch: (unknown) => new UpdateDatabaseEntityError(`${member.id} ${unknown}`)
  })
