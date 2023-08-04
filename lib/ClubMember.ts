export interface IClubMemberDTO {
  id: string
  fullName: string
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
    return `${this.firstName} ${this.lastName}`
  }

  static deserialize(dto: IClubMemberDTO): ClubMember {
    const [firstName, lastName] = dto.fullName.split(' ')
    const model = new ClubMember(
      firstName,
      lastName,
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

  serialize(): IClubMemberDTO {
    return {
      id: this.id,
      fullName: this.fullName,
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
