import fs from 'fs/promises'

import { NextApiRequest, NextApiResponse } from 'next'

import fillPdfForm, { getPdfDoc } from '@/lib/populate-pdf-form'
import { ClubMember } from '@/lib/ClubMember'

const TEST_MEMBER = new ClubMember(
  'Mariolone',
  'Bubbarello',
  '',
  '123456',
  'XXXXXX00X00X000X',
  true,
  true,
  new Date(),
  new Date(),
  'stocazzo@mamm.et',
  'via Dalle Palle 42',
  'asdf',
  'SC',
  'SC',
  'stocazzo',
  '',
  '1234567890',
  'Socio adulto ordinario (25€)'
)

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).send({ error: 'method not allowed' })
  }

  try {
    console.log('<<< typeof body', typeof req.body)

    const pdfDoc = await getPdfDoc(TEST_MEMBER)
    const results = await fillPdfForm(pdfDoc, TEST_MEMBER)
    await fs.writeFile('./lib/result/output.pdf', results)

    console.log('>>> lambda populate-pdf-form', { ok: true })

    res.status(200).json({ ok: true })
  } catch (error) {
    console.log('>>> da error', error)
    return res.status(400).send({ error: 'something bad happened' })
  }
}
