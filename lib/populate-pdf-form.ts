import fs from 'fs/promises'

import { PDFDocument, PDFTextField, PDFRadioGroup } from 'pdf-lib'

import { match } from 'ts-pattern'

import { ClubMember } from './ClubMember'
import { MEMBERSHIP_TYPE } from './constants'
import { pdfTemplateId } from './config'

export const getTemplateId = (member: ClubMember) =>
  match(member.membershipType)
    .with(MEMBERSHIP_TYPE.U18, () => pdfTemplateId.U18)
    .otherwise(() => pdfTemplateId.default)

const fieldSelectors = {
  fullName: (member: ClubMember) => member.fullName,
  birthPlace: (member: ClubMember) => member.birthPlace,
  birthDate: (member: ClubMember) => member.birthDate.toLocaleDateString('it'),
  city: (member: ClubMember) => member.city,
  address: (member: ClubMember) => member.address,
  CAP: (member: ClubMember) => member.CAP,
  phoneNr: (member: ClubMember) => member.phoneNr,
  fiscalCode: (member: ClubMember) => member.fiscalCode,
  email: (member: ClubMember) => member.email,
  date: () => new Date().toLocaleDateString('it'),
  membershipType: (member: ClubMember) => {
    const charsBetweenParenthesisRegEx = /\s*\(.*?\)\s*/g
    return member.membershipType
      .replace(charsBetweenParenthesisRegEx, '')
      .trim()
  }
} as const

export async function fillPdfForm(filePath: string, member: ClubMember) {
  const formPdfBytes = await fs.readFile(filePath)
  const pdfDoc = await PDFDocument.load(formPdfBytes)
  const fields = pdfDoc.getForm().getFields()

  // Compute values
  const values = Object.fromEntries(
    Object.entries(fieldSelectors).map(([fieldName, selectorFn]) => [
      fieldName,
      selectorFn(member)
    ])
  ) as Record<keyof typeof fieldSelectors, string>

  // Fill in the fields
  fields.forEach((field) => {
    const value = values[field.getName()]
    if (value !== undefined) {
      if (field instanceof PDFTextField) {
        field.setText(value)
      } else if (field instanceof PDFRadioGroup) {
        field.select(value)
      }
    }
  })

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
