import { NextApiRequest, NextApiResponse } from 'next'

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

  try {
    await batchRegistrationEmails()

    res.status(200).end('Successfully sent registration emails')
  } catch (error: unknown) {
    fail((error as Error).message)
  }
}
