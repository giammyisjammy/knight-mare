import { IFormInput } from '@/components/MembershipForm'
import { createDatabaseEntry } from '@/lib/notion'
import { NextApiRequest, NextApiResponse } from 'next'

// import { search } from '../../lib/notion'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).send({ error: 'method not allowed' })
  }

  try {
    console.log('<<< typeof body', typeof req.body)
    const subscriber: IFormInput = JSON.parse(req.body)
    console.log('<<< lambda create-database-entry', subscriber)

    const results = await createDatabaseEntry(subscriber)
    console.log('>>> lambda create-database-entry', results)

    res.status(200).json({ ok: true })
  } catch (error) {
    console.log('>>> da error', error)
    return res.status(400).send({ error: 'something bad happened' })
  }
}
