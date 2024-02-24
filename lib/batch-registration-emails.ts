import { match } from 'ts-pattern'

import { ClubMember } from '@/lib/ClubMember'
import * as drive from '@/lib/google/drive'
import * as gmail from '@/lib/google/gmail'
import * as notion from '@/lib/notion'
import { fillPdfForm, getTemplateId } from '@/lib/populate-pdf-form'

export async function batchRegistrationEmails() {
  const { results } = await notion.retrieveNewMembers()

  // Prepare data for pdf attachments
  const newMembersData = results
    .map(ClubMember.fromNotionPageEntry)
    .filter(({ email }) => !!email)
    .map((member) => ({
      member,
      humanReadableFileName: `Domanda di iscrizione ${member.fullName}.pdf`,
      templateId: getTemplateId(member)
    }))

  // Fetch documents from Drive in sequence instead of parallel to take
  // advantage of download caching
  const afterAttachmentFetched = await pMapSeries(
    newMembersData,
    async (current) => {
      const pdfFilePath = await drive.download(current.templateId)
      return {
        ...current,
        pdfFilePath
      }
    }
  )

  const afterAttachmentPrepared = await pMapParallel(
    afterAttachmentFetched,
    async (value) => ({
      ...value,
      pdfBytes: await fillPdfForm(value.pdfFilePath, value.member)
    })
  )

  // Send email
  const afterMailSent = await pMapParallel(
    afterAttachmentPrepared,
    async ({ member, humanReadableFileName, pdfBytes, ...rest }) => {
      const mailResult = await gmail.send({
        from: '"Circolo Scacchi Cantù" <scacchi.cantu@gmail.com>',
        to: member.email,
        subject: `Modulo di iscrizione ${member.firstName}`,
        message: `Buonasera ${member.firstName} 👋<br/>
        <br/>
        Ti alleghiamo il modulo di iscrizione da firmare e:
        <ul>
        <li>allegarlo in risposta a questa mail; oppure</li>
        <li>consegnarlo a mano in sede</li>
        </ul>
        Ricordati che l’iscrizione diventerà effettiva solo in a seguito al pagamento della quota associativa da effettuare di persona in sede.<br/>
        <br/>
        Ti aspettiamo tutti i mercoledì sera dalle 21:00 alle 23:00
        <br/>
        <br/>
        <i><h4>Trattamento dei dati e delle immagini</h4><br/>
        Ai sensi del D. Lgs. n. 163/2003 i dati riportati nel modulo sono prescritti dalle disposizioni vigenti ai fini del procedimento per il quale sono richiesti e verranno utilizzati unicamente a tale scopo.<br/>
        Saranno conservati dalla ns. Associazione e pubblicati sul sito www.circoloscacchicantu.com.<br/>
        La sottoscrizione del presente modulo vale anche come <b>consenso ad utilizzare fotografie ed immagini</b> che mi ritraggano solo ed esclusivamente ai fini promozionali e di comunicazione, in contesti collegati alle attività e agli eventi scacchistici della nostra Associazione (canali Facebook, Instagram e Whatsapp).</i><br/>
        -- <br/>
        <i>Email auto-generata al momento dell'iscrizione</i> <br/>
        `,
        attachments: [
          {
            type: 'application/pdf',
            filename: humanReadableFileName,
            content: pdfBytes
          }
        ]
      })
      return {
        ...rest,
        member,
        humanReadableFileName,
        pdfBytes,
        mailResult
      }
    }
  )

  console.log(
    'afterMailSent',
    afterMailSent.map((x) =>
      match(x)
        .with(
          { status: 'fulfilled' },
          ({ value: { mailResult } }) => mailResult
        )
        .with({ status: 'rejected' }, ({ reason }) => reason)
        .exhaustive()
    )
  )
  // TODO on successful send, update status in notion
}

// helpers

const passthroughError = async ({ reason }) => Promise.reject(reason)
/**
 * Process promises in parallel, keeping failed ones
 */
const pMapParallel = <T, R>(
  array: PromiseSettledResult<T>[],
  callback: (value: T) => R
) =>
  Promise.allSettled(
    array.map(async (promise) =>
      match(promise)
        .with(
          { status: 'fulfilled' },
          async ({ value }) => await callback(value)
        )
        .with({ status: 'rejected' }, passthroughError) // ignore
        .exhaustive()
    )
  )

/**
 * Process promises in sequence, keeping failed ones
 */
const pMapSeries = <T, R>(array: T[], callback: (current: T) => Promise<R>) =>
  array.reduce(async (previousPromise, current) => {
    const settledArray = await previousPromise

    try {
      const result = await callback(current)
      return settledArray.concat(new promiseHelpers.Fulfilled(result))
    } catch (error: unknown) {
      return settledArray.concat(
        new promiseHelpers.Rejected((error as Error).message)
      )
    }
  }, Promise.resolve([] as PromiseSettledResult<R>[]))

class Fulfilled<T> implements PromiseFulfilledResult<T> {
  public status = 'fulfilled' as const
  constructor(public value: T) {}
}
class Rejected implements PromiseRejectedResult {
  public status = 'rejected' as const
  constructor(public reason: any) {}
}
const promiseHelpers = {
  Fulfilled,
  Rejected
}
