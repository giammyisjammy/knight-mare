import { ClubMember } from '@/lib/ClubMember'
import * as drive from '@/lib/google/drive'
import * as notion from '@/lib/notion'
import { fillPdfForm, getTemplateId } from '@/lib/populate-pdf-form'
import P from '@/lib/promises/helpers'
import * as Settled from '@/lib/promises/Settled'
import { sendWelcomeMail } from '@/lib/send-welcome-mail'

import { MEMBERSHIP_STATUS } from './constants'

export async function batchRegistrationEmails() {
  await P.pipe(
    notion.retrieveNewMembers,
    // Prepare data for pdf attachments
    ({ results }) =>
      results
        .map(ClubMember.fromNotionPageEntry)
        .filter(({ email }) => !!email),
    // Fetch documents from Drive in sequence instead of parallel to take
    // advantage of download caching
    P.map(
      (member) =>
        Settled.of(async () => ({
          member,
          pdfFilePath: await drive.download(getTemplateId(member))
        })),
      { concurrency: 1 }
    ),
    // Prepare attachments with members data
    P.map(
      Settled.flatMap(async ({ pdfFilePath, member }) => ({
        pdfFilePath,
        member,
        pdfBytes: await fillPdfForm(pdfFilePath, member)
      })),
      { concurrency: 5 }
    ),
    P.map(
      P.pipe(
        // Send emails
        Settled.flatMap(async ({ pdfBytes, member }) => {
          const mailResult = await sendWelcomeMail(member, pdfBytes)
          return {
            member,
            mailResult
          }
        }),
        // Update membership status in Notion
        Settled.flatMap(async (value) => {
          value.member.membershipStatus = MEMBERSHIP_STATUS.Waiting
          const updateResult = await notion.updateMember(value.member)
          return {
            ...value,
            updateResult
          }
        })
      ),
      { concurrency: 2 }
    ),
    // print report to console
    P.map(
      Settled.match(
        (reason) => console.error(reason),
        (value) => console.log(value)
      )
    )
  )()
}
