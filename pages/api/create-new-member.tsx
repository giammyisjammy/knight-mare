import { NextApiRequest, NextApiResponse } from 'next'

import { ClubMember } from '@/lib/ClubMember'
import { createRegisterOfMemberEntry } from '@/lib/notion'

// import { search } from '../../lib/notion'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).send({ error: 'method not allowed' })
  }

  try {
    console.log('<<< typeof body', typeof req.body)
    const newClubMember = ClubMember.deserialize(JSON.parse(req.body))
    console.log('<<< lambda create-database-entry', newClubMember)

    const results = await createRegisterOfMemberEntry(newClubMember)
    console.log('>>> lambda create-database-entry', results)

    res.status(200).json({ ok: true })
  } catch (error) {
    console.log('>>> da error', error)
    return res.status(400).send({ error: 'something bad happened' })
  }
}