export interface IClubMemberDTO {
  id: string
  fullName: string
  // TODO Stato pagamenti
  // TODO CAP
  // Codice Fiscale
  fiscalCode: string
  // Consenso privacy
  privacyConsent: boolean
  // Consenso trattamento immagini
  imagesConsent: boolean
  // Creato il
  creationDate: Date
  // Data di Nascita
  birthDate: Date
  // Email
  email: string
  // Indirizzo
  address: string
  // Nato/a a
  birthPlace: string
  // TODO Provincia di Nascita
  // TODO Provincia residenza
  // Residente in
  city: string
  // TODO Stato associativo
  // Telefono
  phoneNr: string
  // TODO Tipologia affiliazione
  // Ultima modifica
  lastEdit: Date
}

export class ClubMember {
  id: string

  constructor(
    // Nome
    public firstName = '',
    // Cognome
    public lastName = '',
    // TODO Stato pagamenti
    // TODO CAP
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
    // TODO Provincia di Nascita
    // TODO Provincia residenza
    // Residente in
    public city = '',
    // TODO Stato associativo
    // Telefono
    public phoneNr = '',
    // TODO Tipologia affiliazione
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
      // TODO Stato pagamenti
      // TODO CAP
      // Codice Fiscale
      dto.fiscalCode,
      // Consenso privacy
      dto.privacyConsent,
      // Consenso trattamento immagini
      dto.imagesConsent,
      // Creato il
      dto.creationDate,
      // Data di Nascita
      dto.birthDate,
      // Email
      dto.email,
      // Indirizzo
      dto.address,
      // Nato/a a
      dto.birthPlace,
      // TODO Provincia di Nascita
      // TODO Provincia residenza
      // Residente in
      dto.city,
      // TODO Stato associativo
      // Telefono
      dto.phoneNr,
      // TODO Tipologia affiliazione
      // Ultima modifica
      dto.lastEdit
    )
    model.id = dto.id

    return model
  }

  serialize(): IClubMemberDTO {
    return {
      id: this.id,
      fullName: this.fullName,
      // TODO Stato pagamenti
      // TODO CAP
      // Codice Fiscale
      fiscalCode: this.fiscalCode,
      // Consenso privacy
      privacyConsent: this.privacyConsent,
      // Consenso trattamento immagini
      imagesConsent: this.imagesConsent,
      // Creato il
      creationDate: this.creationDate,
      // Data di Nascita
      birthDate: this.birthDate,
      // Email
      email: this.email,
      // Indirizzo
      address: this.address,
      // Nato/a a
      birthPlace: this.birthPlace,
      // TODO Provincia di Nascita
      // TODO Provincia residenza
      // Residente in
      city: this.city,
      // TODO Stato associativo
      // Telefono
      phoneNr: this.phoneNr,
      // TODO Tipologia affiliazione
      // Ultima modifica
      lastEdit: this.lastEdit
    }
  }
}
