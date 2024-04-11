import url from 'url'

import { NextApiRequest, NextApiResponse } from 'next'

import { oauth2Client as auth } from '@/lib/oauth2-client'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).send({ error: 'method not allowed' })
  }

  try {
    console.log('<<< typeof body', typeof req.body)

    console.log('>>> lambda oauth2callback', req.body)

    // Receive the callback from Google's OAuth 2.0 server.
    if (req.url.startsWith('/api/oauth2callback')) {
      // Handle the OAuth 2.0 server response
      const q = url.parse(req.url, true).query

      if (q.error) {
        // An error response e.g. error=access_denied
        console.log('Error:' + q.error)
      } else {
        // Get access and refresh tokens (if access_type is offline)
        console.log('CODE', q.code)
        const { tokens } = await auth.getToken(q.code as string) // HACK
        console.log('TOKENS', tokens)
        auth.setCredentials(tokens)

        /** Save credential to the global variable in case access token was refreshed.
         * ACTION ITEM: In a production app, you likely want to save the refresh token
         *              in a secure persistent database instead. */
      }
    }

    res.status(200).json({ ok: true })
  } catch (error) {
    console.log('>>> da error', error)
    return res.status(400).send({ error: 'something bad happened' })
  }
}
