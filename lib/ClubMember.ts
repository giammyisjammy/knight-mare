import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { match } from 'ts-pattern'

export interface IClubMemberDTO {
  id: string
  // Nome
  firstName: string
  // Cognome
  lastName: string
  // Stato pagamenti
  paymentStatus: string
  // CAP
  CAP: string
  // Codice Fiscale
  fiscalCode: string
  // Consenso privacy
  privacyConsent: boolean
  // Consenso trattamento immagini
  imagesConsent: boolean
  // Creato il
  creationDate: string
  // Data di Nascita
  birthDate: string
  // Email
  email: string
  // Indirizzo
  address: string
  // Nato/a a
  birthPlace: string
  // Provincia di Nascita
  birthProvince: string
  // Provincia residenza
  cityProvince: string
  // Residente in
  city: string
  // Stato associativo
  membershipStatus: string
  // Telefono
  phoneNr: string
  // Tipologia affiliazione
  membershipType: string
  // Ultima modifica
  lastEdit: string
}

export class ClubMember {
  id: string

  constructor(
    // Nome
    public firstName = '',
    // Cognome
    public lastName = '',
    // TODO Stato pagamenti
    public paymentStatus = '',
    // TODO CAP
    public CAP = '',
    // Codice Fiscale
    public fiscalCode = '',
    // Consenso privacy
    public privacyConsent = false,
    // Consenso trattamento immagini
    public imagesConsent = false,
    // Creato il
    public creationDate: Date = new Date(),
    // Data di Nascita
    public birthDate: Date = new Date(),
    // Email
    public email = '',
    // Indirizzo
    public address = '',
    // Nato/a a
    public birthPlace = '',
    // Provincia di Nascita
    public birthProvince = '',
    // Provincia residenza
    public cityProvince = '',
    // Residente in
    public city = '',
    // Stato associativo
    public membershipStatus = '',
    // Telefono
    public phoneNr = '',
    // Tipologia affiliazione
    public membershipType = '',
    // Ultima modifica
    public lastEdit: Date = new Date()
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  static deserialize(dto: IClubMemberDTO): ClubMember {
    const model = new ClubMember(
      // Nome
      dto.firstName,
      // Cognome
      dto.lastName,
      // Stato pagamenti
      dto.paymentStatus,
      // CAP
      dto.CAP,
      // Codice Fiscale
      dto.fiscalCode,
      // Consenso privacy
      dto.privacyConsent,
      // Consenso trattamento immagini
      dto.imagesConsent,
      // Creato il
      new Date(dto.creationDate),
      // Data di Nascita
      new Date(dto.birthDate),
      // Email
      dto.email,
      // Indirizzo
      dto.address,
      // Nato/a a
      dto.birthPlace,
      // Provincia di Nascita
      dto.birthProvince,
      // Provincia residenza
      dto.cityProvince,
      // Residente in
      dto.city,
      // Stato associativo
      dto.membershipStatus,
      // Telefono
      dto.phoneNr,
      // Tipologia affiliazione
      dto.membershipType,
      // Ultima modifica
      new Date(dto.lastEdit)
    )
    model.id = dto.id

    return model
  }

  static fromNotionPageEntry(entry: PageObjectResponse): ClubMember {
    const model = new ClubMember(
      // Nome
      propertyMatcher(entry.properties['Nome e Cognome']),
      // Cognome
      '', // HACK need to update Notion table with more granular fields
      // Stato pagamenti
      propertyMatcher(entry.properties['Stato Pagamenti']),
      // CAP
      propertyMatcher(entry.properties['CAP']),
      // Codice Fiscale
      propertyMatcher(entry.properties['Codice Fiscale']),
      // Consenso privacy
      propertyMatcher(entry.properties['Consenso Privacy']),
      // Consenso trattamento immagini
      propertyMatcher(entry.properties['Consenso Trattamento Immagini']),
      // Creato il
      propertyMatcher(entry.properties['Creato il']),
      // Data di Nascita
      propertyMatcher(entry.properties['Data di Nascita']),
      // Email
      propertyMatcher(entry.properties['Email']),
      // Indirizzo
      propertyMatcher(entry.properties['Indirizzo']),
      // Nato/a a
      propertyMatcher(entry.properties['Nato/a a']),
      // Provincia di Nascita
      propertyMatcher(entry.properties['Provincia di Nascita']),
      // Provincia residenza
      propertyMatcher(entry.properties['Provincia di Residenza']),
      // Residente in
      propertyMatcher(entry.properties['Residente in']),
      // Stato associativo
      propertyMatcher(entry.properties['Stato Associativo']),
      // Telefono
      propertyMatcher(entry.properties['Telefono']),
      // Tipologia affiliazione,
      propertyMatcher(entry.properties['Tipologia Affiliazione']),
      // Ultima modifica
      propertyMatcher(entry.properties['Ultima modifica'])
    )
    model.id = propertyMatcher(entry.properties['ID'])

    return model
  }

  serialize(): IClubMemberDTO {
    return {
      id: this.id,
      // Nome
      firstName: this.firstName,
      // Cognome
      lastName: this.lastName,
      // Stato pagamenti
      paymentStatus: this.paymentStatus,
      // CAP
      CAP: this.CAP,
      // Codice Fiscale
      fiscalCode: this.fiscalCode,
      // Consenso privacy
      privacyConsent: this.privacyConsent,
      // Consenso trattamento immagini
      imagesConsent: this.imagesConsent,
      // Creato il
      creationDate: this.creationDate.toISOString(),
      // Data di Nascita
      birthDate: this.birthDate.toISOString(),
      // Email
      email: this.email,
      // Indirizzo
      address: this.address,
      // Nato/a a
      birthPlace: this.birthPlace,
      // Provincia di Nascita
      birthProvince: this.birthProvince,
      // Provincia residenza
      cityProvince: this.cityProvince,
      // Residente in
      city: this.city,
      // Stato associativo
      membershipStatus: this.membershipStatus,
      // Telefono
      phoneNr: this.phoneNr,
      // Tipologia affiliazione
      membershipType: this.membershipType,
      // Ultima modifica
      lastEdit: this.lastEdit.toISOString()
    }
  }
}

type Property = PageObjectResponse['properties'][string]
const propertyMatcher = <TOutput extends string | boolean | Date | undefined>(
  property: Property
): TOutput =>
  match(property)
    .with({ type: 'title' }, ({ title }) =>
      title.map((value) => value.plain_text).join('')
    )
    .with({ type: 'unique_id' }, ({ unique_id }) =>
      [unique_id.prefix, unique_id.number].filter(Boolean).join('-')
    )
    .with({ type: 'rich_text' }, ({ rich_text }) =>
      rich_text.map((value) => value.plain_text).join(' ')
    )
    .with({ type: 'select' }, ({ select }) => select.name)
    .with({ type: 'checkbox' }, ({ checkbox }) => checkbox)
    .with({ type: 'date' }, ({ date }) => new Date(date.start))
    .with({ type: 'email' }, ({ email }) => email)
    .with({ type: 'phone_number' }, ({ phone_number }) => phone_number)
    .with(
      { type: 'created_time' },
      ({ created_time }) => new Date(created_time)
    )
    .with(
      { type: 'last_edited_time' },
      ({ last_edited_time }) => new Date(last_edited_time)
    )
    .otherwise(() => undefined) as any // HACK type
export const TEST_MEMBER = new ClubMember(
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
