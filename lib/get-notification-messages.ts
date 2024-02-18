import { ClubMember } from './ClubMember'

function getAge(birthDate: Date) {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export const notificationMessages = {
  newSubscription: ({
    member,
    isSuccessfullyRegistered = false,
    isMailSent = false,
    isPaymentStatusOk = false
  }: {
    member: ClubMember
    isSuccessfullyRegistered?: boolean
    isMailSent?: boolean
    isPaymentStatusOk?: boolean
  }) => `Ue! Abbiamo un nuovo iscritto!

🧑 ${member.fullName} (età ${getAge(member.birthDate)})
🪪 ${member.membershipType}

${isSuccessfullyRegistered ? '✅' : '❌'} Registrato su libro soci
${isMailSent ? '✅' : '❌'} Mail con documenti
${isPaymentStatusOk ? '✅' : '❌'} Pagamento

Per contattarlo:
📧 <a href="mailto:${member.email}">${member.email}</a>
📞 <a href="tel:${member.phoneNr}">${member.phoneNr}</a>
`
}
