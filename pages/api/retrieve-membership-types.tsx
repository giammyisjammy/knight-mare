import { NextApiRequest, NextApiResponse } from 'next'

import { retrieveMembershipTypes } from '@/lib/notion'

// import { search } from '../../lib/notion'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).send({ error: 'method not allowed' })
  }

  try {
    console.log('<<< typeof body', typeof req.body)

    const results = await retrieveMembershipTypes()
    console.log('>>> lambda retrieveMembershipTypes', results)

    res.status(200).json({ ok: true, membershipTypes: results })
  } catch (error) {
    console.log('>>> da error', error)
    return res.status(400).send({ error: 'something bad happened' })
  }
}
