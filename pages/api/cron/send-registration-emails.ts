import { NextApiRequest, NextApiResponse } from 'next'

// import { batchRegistrationEmails } from '@/lib/batch-registration-emails'
import { Cause, Effect, Either, Exit, ReadonlyArray, pipe } from 'effect'

import { batchRegistrationEmails } from '@/lib/batch-registration-emails'
import { failWrapper } from '@/lib/utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const authHeader = req.headers.authorization
  const fail = failWrapper(res)

  if (
    !process.env.CRON_SECRET ||
    (process.env.NODE_ENV === 'production' &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`)
  ) {
    return fail('Unauthorized', 401)
  }

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
          fail
        ),
      onSuccess: (results) => {
        const hasErrors = !ReadonlyArray.every(Either.isRight)(results)
        res
          .status(200)
          .end(
            hasErrors
              ? `Some emails weren't sent, check your logs`
              : 'Successfully sent all registration emails'
          )
      }
    })
  )
}
