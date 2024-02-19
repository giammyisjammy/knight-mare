import fs from 'fs/promises'

import { PDFDocument, PDFTextField, PDFRadioGroup } from 'pdf-lib'

import { ClubMember } from './ClubMember'

const TEMPLATES = {
  adult: './lib/pdf/template-adulto.pdf',
  minor: './lib/pdf/template-minorenni.pdf'
}

export async function getPdfDoc(member: ClubMember) {
  const isAdult = !member.membershipType.includes('Under18')
  const templatePath = isAdult ? TEMPLATES.adult : TEMPLATES.minor
  const formPdfBytes = await fs.readFile(templatePath)
  const pdfDoc = await PDFDocument.load(formPdfBytes)
  return pdfDoc
}

const FIELDS = {
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

export default async function fillPdfForm(
  pdfDoc: PDFDocument,
  member: ClubMember
) {
  const isAdult = !member.membershipType.includes('Under18')
  const fields = pdfDoc.getForm().getFields()

  if (isAdult) {
    // Get all values to fill in the PDF form
    const values = Object.fromEntries(
      Object.entries(FIELDS).map(([fieldName, selectorFn]) => [
        fieldName,
        selectorFn(member)
      ])
    ) as Record<keyof typeof FIELDS, string>

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

    console.log('[fillPdfForm] it worked!', values)
  } else {
    // TODO modulo x minore
  }

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
