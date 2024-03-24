export const PAYMENT_STATUS = {
  Ok: 'Regolare',
  NotOk: 'Irregolare'
} as const
export type PaymentStatusKeys = keyof typeof PAYMENT_STATUS
export type PaymentStatus = typeof PAYMENT_STATUS[PaymentStatusKeys]

export const MEMBERSHIP_STATUS = {
  New: 'Nuovo',
  SendMail: 'Mandare mail',
  Waiting: 'Ricevere documenti firmati',
  Active: 'Attivo',
  Expired: 'Scaduto',
  Suspended: 'Sospeso',
  Frozen: 'Congelato'
} as const
export type MembershipStatusKeys = keyof typeof MEMBERSHIP_STATUS
export type MembershipStatus = typeof MEMBERSHIP_STATUS[MembershipStatusKeys]

export const MEMBERSHIP_TYPE = {
  Ordinary: 'Socio adulto ordinario (25€)',
  Fsi: 'Socio FSI (50€)',
  FsiCompetitive: 'Socio FSI agonisti (70€)',
  U18: 'Socio Under18 (30€)',
  Supporter: 'Socio Sostenitore (molti €)',
  Benefactor: 'Socio Benemerito',
  Parent: 'Genitore'
} as const
export type MembershipTypeKeys = keyof typeof MEMBERSHIP_TYPE
export type MembershipType = typeof MEMBERSHIP_TYPE[MembershipTypeKeys]
