import { fakerIT as faker } from '@faker-js/faker'

import { ClubMember } from '../ClubMember'
import {
  PAYMENT_STATUS,
  MEMBERSHIP_STATUS,
  MEMBERSHIP_TYPE
} from '../constants'

export const mockMemberGenerator = function* () {
  for (const payment of Object.values(PAYMENT_STATUS)) {
    for (const membership of Object.values(MEMBERSHIP_STATUS)) {
      for (const memberType of Object.values(MEMBERSHIP_TYPE)) {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const email = faker.internet
          .email({
            firstName,
            lastName,
            provider: 'fakemail.dev'
          })
          .toLowerCase()

        yield new ClubMember(
          firstName,
          lastName,
          payment,
          faker.location.zipCode(),
          'XXXXXX00X00X000X',
          true,
          true,
          new Date(),
          faker.date.birthdate(),
          email,
          faker.location.streetAddress(),
          faker.location.city(),
          faker.location.state({ abbreviated: true }),
          faker.location.state({ abbreviated: true }),
          faker.location.city(),
          membership,
          faker.phone.number(),
          memberType
        )
      }
    }
  }
}
