import { NextApiRequest, NextApiResponse } from 'next'

import { mockMemberGenerator } from '@/lib/ClubMember'
import { createRegisterOfMemberEntry } from '@/lib/notion'
import { failWrapper } from '@/lib/utils'
import P from '@/lib/promises/helpers'

const mockData = [...mockMemberGenerator()]

const tasks = mockData.map((member) => ({
  member,
  task: async () => {
    console.log(`Creating ${member.fullName}...`)
    const response = await createRegisterOfMemberEntry(member)
    return response
  }
}))

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const fail = failWrapper(res)

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return fail('Method not allowed', 405)
  }

  if (process.env.NODE_ENV === 'production') {
    return fail('Not allowed', 405)
  }

  // Update Notion database with user entry
  try {
    console.log('<<< typeof body', typeof req.body)
    console.log('<<< lambda create-mock-entries', tasks.length)

    const responses = await P.map(
      tasks,
      P.pipe(({ member, task }) =>
        P.Settled.of(async () => ({
          member,
          task: await task()
        }))
      ),
      { concurrency: 1 }
    )

    // print report to console
    console.log(
      'mocked',
      responses.map(
        P.Settled.match(
          (error) => error,
          ({ member, task: { id } }) => ({
            status: 'fulfilled',
            id,
            member: member.fullName
          })
        )
      )
    )

    res.status(200).json({ ok: true })
  } catch (error: unknown) {
    return fail((error as Error).message)
  }
}
