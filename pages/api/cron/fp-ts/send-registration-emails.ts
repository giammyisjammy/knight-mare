import { NextApiRequest, NextApiResponse } from 'next'

import { flow, pipe } from 'fp-ts/lib/function'
import * as A from 'fp-ts/lib/Array'
// import * as Console from 'fp-ts/lib/Console'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import * as T from 'fp-ts/lib/Task'
import * as IO from 'fp-ts/lib/IO'

import { sequenceT } from 'fp-ts/lib/Apply'

import {
  SubscriptionMailResult,
  batchRegistrationEmails
} from '@/lib/fp-ts/batch-registration-emails'
import { failWrapper } from '@/lib/utils'

const isRequestAuthorized = (req: NextApiRequest) =>
  !process.env.CRON_SECRET ||
  (process.env.NODE_ENV === 'production' &&
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    ? E.right(req)
    : E.left(RequestAuthorizedError.of('Unauthorized'))
class RequestAuthorizedError extends Error {
  public _tag = 'RequestAuthorizedError' as const

  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
  }

  public static of(message: string): RequestAuthorizedError {
    return new RequestAuthorizedError(message)
  }
}

const logErrors = (results: SubscriptionMailResult[]) =>
  pipe(
    results,
    A.map(
      TE.orElse((error) => console.log(`[failed] ${error.message}`))
      // TE.foldW(
      //   (error) => TE.right(console.log(`[failed] ${error.message}`)),
      //   ({ member }) =>
      //     TE.right(console.log(`[success] mail sent to ${member.id}`))
      // )
    )
  )

const terminateRequest =
  (res: NextApiResponse) => (results: SubscriptionMailResult[]) =>
    pipe(
      results,
      TE.sequenceArray,
      (x) => x,
      TE.fold(
        (lastError) =>
          TE.of(
            pipe(
              lastError,
              () => {},
              (x) => x
            )
          ),
        (arr) =>
          TE.of(
            pipe(
              arr,
              A.isEmpty, // maybe sent some mails,
              (isEmpty) =>
                isEmpty
                  ? E.left('No mails sent')
                  : E.right('Successfully sent registration emails'),
              E.fold(
                (message) => {
                  TE.right(console.warn(message))
                },
                (message) => {
                  res.status(200).end(message)
                }
              )
            )
          )
      )
    )

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const fail = failWrapper(res)

  await pipe(
    req,
    isRequestAuthorized,
    E.foldW(
      (error) => TE.left(fail(error.message, 401)), // request not authorized
      () =>
        pipe(
          batchRegistrationEmails,
          TE.foldW(
            (error) => TE.left(fail(error.message)), // failed to retrieve members from Notion
            (results) =>
              pipe(
                sequenceT(TE.ApplyPar)(
                  // log single request errors
                  pipe(
                    results,
                    A.map(
                      TE.foldW(
                        (error) =>
                          TE.right(console.log(`[failed] ${error.message}`)),
                        ({ member }) =>
                          TE.right(
                            console.log(`[success] mail sent to ${member.id}`)
                          )
                      )
                    )
                  ),
                  // terminate request
                  pipe(
                    results,
                    TE.sequenceArray,
                    (x) => x,
                    TE.fold(
                      (lastError) =>
                        TE.of(
                          pipe(
                            lastError,
                            () => {},
                            (x) => x
                          )
                        ),
                      (arr) =>
                        TE.of(
                          pipe(
                            arr,
                            A.isEmpty, // maybe sent some mails,
                            (isEmpty) =>
                              isEmpty
                                ? E.left('No mails sent')
                                : E.right(
                                    'Successfully sent registration emails'
                                  ),
                            E.fold(
                              (message) => {
                                TE.right(console.warn(message))
                              },
                              (message) => {
                                res.status(200).end(message)
                              }
                            )
                          )
                        )
                    )
                  )
                ),
                TE.map(([a, b]) => ({ ...a, c: b.c }))
              )
          )
        )
    )
  )()

  // // Original code:
  // if (
  //   !process.env.CRON_SECRET ||
  //   (process.env.NODE_ENV === 'production' &&
  //     req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
  // ) {
  //   return fail('Unauthorized', 401)
  // }

  // try {
  //   await batchRegistrationEmailsFP()

  //   res.status(200).end('Successfully sent registration emails')
  // } catch (error: unknown) {
  //   fail((error as Error).message)
  // }
}
