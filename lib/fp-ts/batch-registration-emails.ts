import { pipe } from 'fp-ts/lib/function'

import * as A from 'fp-ts/lib/Array'
// import * as C from 'fp-ts/lib/Compactable'
// import * as Console from 'fp-ts/lib/Console'
// import type { Either } from 'fp-ts/lib/Either'
// import * as R from 'fp-ts/Reader'
// import * as RTE from 'fp-ts/lib/ReaderTaskEither'
// import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'

import { sequenceT } from 'fp-ts/lib/Apply'

import { ClubMember } from '@/lib/ClubMember'
import { MEMBERSHIP_STATUS, MembershipStatus } from '@/lib/constants'
import * as drive from '@/lib/google/drive'
import * as gmail from '@/lib/google/gmail'
import * as notion from '@/lib/notion'
import { fillPdfForm, getTemplateId } from '@/lib/populate-pdf-form'

type Attachment = {
  filename: string
  content?: Uint8Array
}

declare function begin(): Promise<void>
declare function commit(): Promise<void>
declare function rollback(): Promise<void>
/**
 * In this example, we try to rollback if the begin or commit operations fail
 * and return the original error. If rollback also fails, we return the rollback
 * error.
 */
export const playground = () =>
  pipe(
    TE.tryCatch(
      () => begin(),
      (err) => new Error(`begin txn failed: ${err}`)
    ),
    TE.chain(() =>
      TE.tryCatch(
        () => commit(),
        (err) => new Error(`commit txn failed: ${err}`)
      )
    ),
    TE.orElse((originalError) =>
      pipe(
        TE.tryCatch(
          () => rollback(),
          (err) => new Error(`rollback txn failed: ${err}`)
        ),
        TE.fold(TE.left, () => TE.left(originalError))
      )
    )
  )

// -----------------------------------------------------------------------------

/**
 * A little helper for pipe logging.
 * `pipe(x, foo, logPipe, bla)`
 */
export const logPipe = <T>(arg: T): T => {
  // eslint-disable-next-line no-console
  console.log(arg)
  return arg
}
class RetrieveMembersError extends Error {
  public _tag = 'RetrieveMembersError' as const

  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
  }

  public static of(message: string): RetrieveMembersError {
    return new RetrieveMembersError(message)
  }
}
class AttachmentError extends Error {
  public _tag = 'AttachmentError' as const
  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
  }

  public static of(message: string): AttachmentError {
    return new AttachmentError(message)
  }
}
class MailError extends Error {
  public _tag = 'MailError' as const
  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
  }

  public static of(message: string): MailError {
    return new MailError(message)
  }
}
class NotionUpdateError extends Error {
  public _tag = 'NotionUpdateError' as const
  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
  }

  public static of(message: string): NotionUpdateError {
    return new NotionUpdateError(message)
  }
}

const retrieveNewMembers = pipe(
  TE.tryCatch(() => notion.retrieveNewMembers(), RetrieveMembersError.of),
  TE.map((response) => response.results),
  TE.chain((results) =>
    TE.of(
      pipe(
        results,
        A.map(ClubMember.fromNotionPageEntry),
        A.filter(({ email }) => !!email)
      )
    )
  )
)

const makeAttachment = (member: ClubMember) =>
  pipe(
    TE.of(member),
    TE.bindTo('member'),
    TE.apSW(
      'filePath',
      pipe(getTemplateId(member), (templateId) =>
        TE.tryCatch(() => drive.download(templateId), AttachmentError.of)
      )
    ),
    TE.chainW(({ filePath, member }) =>
      pipe(
        sequenceT(TE.ApplyPar)(
          TE.tryCatch(() => fillPdfForm(filePath, member), AttachmentError.of),
          TE.right(`Domanda di iscrizione ${member.fullName}.pdf`)
        ),
        TE.map(([content, filename]) => ({ content, filename }))
      )
    )
  )

const sendMail = ({
  member,
  attachment
}: {
  member: ClubMember
  attachment: Attachment
}) =>
  TE.tryCatch(
    () =>
      gmail.send({
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
            filename: attachment.filename,
            content: attachment.content
          }
        ]
      }),
    MailError.of
  )
const updateMembershipStatus =
  (status: MembershipStatus) => (member: ClubMember) =>
    pipe(
      ClubMember.deserialize({
        ...member.serialize(),
        membershipStatus: status
      }),
      (newMember) =>
        TE.tryCatch(() => notion.updateMember(newMember), NotionUpdateError.of)
    )
const makeSubscriptionMail = (member: ClubMember) =>
  pipe(
    TE.of(member),
    TE.bindTo('member'),
    TE.apSW(
      'mailResponse',
      pipe(
        TE.of(member),
        TE.bindTo('member'),
        // TODO queue template fetching to leverage drive.download() caching
        // in alternative, memoize function
        TE.apSW('attachment', makeAttachment(member)),
        TE.chainW(sendMail)
      )
    ),
    TE.apSW(
      'updateMemberResponse',
      pipe(member, updateMembershipStatus(MEMBERSHIP_STATUS.Waiting))
    )
  )
export type SubscriptionMailResult = ReturnType<typeof makeSubscriptionMail>

export const batchRegistrationEmails = pipe(
  retrieveNewMembers,
  TE.chainW((arr) =>
    TE.of(
      pipe(
        arr,
        // How to collect left values from an array of TaskEither when using fp-ts
        // https://stackoverflow.com/q/76763522
        // Get the TaskEither[]
        A.map(makeSubscriptionMail),
        // Natural transform to the type expected by separate
        (x) => x, // Task<Either<Error, Whatever>>[]
        // A.map(split),
        // TE.sequenceArray,
        // (x) => x, // Task<Either<Error, Whatever>[]>
        // // Now we can use separate
        // separate,
        // // Finally, force the task and use the error values.
        // async ({ right, left }) => {
        //   // TODO non va bene, ri-fattorizzare
        //   const results = await right()
        //   const errors = await left()
        //   console.log(results)
        //   console.log(errors)
        // },
        logPipe,
        (x) => x
      )
    )
  ),
  (x) => x,
  // TE.flattenW,
  // error handler
  logPipe,
  // TE.orElse(retrieveNewMembersError=>),
  (x) => x
)

/**
 * This is a helper to un-flatten the TaskEither
 */
// function split<E, A>(either: TE.TaskEither<E, A>): T.Task<Either<E, A>> {
//   return async () => {
//     return await either()
//   }
// }

/**
 * Create something like `A.separate` but for `Task<Either<A,B>[]>`
 *
 * The bit that calls C.separate deserves some further explanation.
 * That section of the library defines separation in very abstract terms.
 * In order to get a separate function for arbitrary functors, you must pass
 * into it type classes for the wrapper (in this case Task),
 * a Compactable instance to inform separate how to collect up left values
 * (in this case A.Compactable) and a functor for containing the right values
 * (in this case again an array).
 */
// const separate = C.separate(T.Functor, A.Compactable, A.Functor)

// https://stackoverflow.com/a/70378307
// type A = { a: number; b: number; c: number }
// type B = { c: number }
//
// const a = (): TE.TaskEither<Error, A> => TE.right({ a: 123, b: 456, c: 0 })
// const b = (): TE.TaskEither<Error, B> => TE.right({ c: 789 })
// const c = (): TE.TaskEither<Error, A> =>
//   pipe(
//     a(),
//     TE.chain((a) =>
//       pipe(
//         b(),
//         TE.map((b) => ({
//           ...a,
//           c: b.c
//         }))
//       )
//     )
//   )
//
// pipe(
//   sequenceT(TE.ApplyPar)(a(), b()),
//   TE.map(([a, b]) => ({ ...a, c: b.c }))
// )
