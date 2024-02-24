import fs from 'fs/promises'

import { PDFDocument, PDFTextField, PDFRadioGroup } from 'pdf-lib'

import { ClubMember } from './ClubMember'

const TEMPLATE_FILE_IDS = {
  adult: '1yKdzWG2YzjgF0I1727LTzvBUfpFGTeOx',
  minor: 'TODO' // TODO
}

export function getTemplateId(member: ClubMember) {
  const isAdult = !member.membershipType.includes('Under18')
  const templatePath = isAdult
    ? TEMPLATE_FILE_IDS.adult
    : TEMPLATE_FILE_IDS.minor

  return templatePath
}

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

  const isAdult = !member.membershipType.includes('Under18')

  if (isAdult) {
    // Get all values to fill in the PDF form
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
  } else {
    // TODO modulo x minore
  }

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
