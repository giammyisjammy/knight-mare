import { Schema } from '@effect/schema'
import { pipe } from 'effect'

const emailValidationRegex =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i

export const EmailBrand = pipe(
  Schema.string,
  Schema.filter((str) => emailValidationRegex.test(str)),
  Schema.brand('EmailBrand')
)

export type EmailBrand = Schema.Schema.Type<typeof EmailBrand>

export const isValidEmail = (x: unknown) =>
  Schema.decodeUnknownEither(EmailBrand)(x)
