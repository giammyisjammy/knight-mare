import { NextApiRequest, NextApiResponse } from 'next'
import { Effect, Stream, pipe, Exit, Cause } from 'effect'
import ProgressBar from 'progress'
import chalk from 'chalk'

import { ClubMember, mockMemberGenerator } from '@/lib/ClubMember'
import { createRegisterOfMemberEntry } from '@/lib/notion'
import { failWrapper } from '@/lib/utils'

const mockData = [...mockMemberGenerator()]

const updateDatabaseEntity = (member: ClubMember) =>
  Effect.tryPromise({
    try: () => createRegisterOfMemberEntry(member),
    catch: (unknown) => new Error(`${unknown}`)
  })

// type HttpMethod = 'GET' | 'POST' | 'PUT'
// const allowedMethod =
//   (methods: HttpMethod[]) =>
//   ({ req, res }: { req: NextApiRequest; res: NextApiResponse }) => {
//     const fail = failWrapper(res)
//     if (!methods.includes(req.method as HttpMethod)) {
//       res.setHeader('Allow', ['GET'])
//       return fail('Method not allowed', 405)
//     }
//   }
// const allowedEnv =
//   (envs: typeof process.env.NODE_ENV[]) =>
//   ({ req, res }: { req: NextApiRequest; res: NextApiResponse }) => {
//     const fail = failWrapper(res)
//     if (!envs.includes(process.env.NODE_ENV)) {
//       return fail('Not allowed', 405)
//     }
//   }

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const fail = failWrapper(res)

  console.log('<<< lambda create-mock-entries', typeof req.body)

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return fail('Method not allowed', 405)
  }

  if (process.env.NODE_ENV === 'production') {
    return fail('Not allowed', 405)
  }

  const bar = new ProgressBar(
    chalk.blue`  :current/:total [:bar] :percent :etas Creating :memberName...`,
    {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: mockData.length // total number of ticks to complete
    }
  )
  const tickBar = (member: ClubMember) =>
    Effect.sync(() => bar.tick(1, { memberName: member.fullName }))

  // Update Notion database with user entry
  const program = pipe(
    Effect.sync(() => mockData),
    Effect.tap((tasks) =>
      console.log('<<< lambda create-mock-entries', tasks.length)
    ),
    Stream.fromIterableEffect,
    Stream.tap(tickBar),
    Stream.flatMap(updateDatabaseEntity)
  )

  const collectedData = Stream.runCollect(program)
  await Effect.runPromiseExit(collectedData).then(
    Exit.match({
      onFailure: Cause.map((error) => fail((error as Error).message)),
      onSuccess: (chunk) => {
        console.log(`Finished!`, chunk)
        res.status(200).json({ ok: true })
      }
    })
  )
}
