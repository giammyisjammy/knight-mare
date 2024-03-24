import type { NextApiResponse } from 'next'

export const failWrapper =
  (response: NextApiResponse) =>
  (error: string, status = 500): void => {
    console.error('Error:', error)
    response.status(status).json({ ok: false, error })
  }
