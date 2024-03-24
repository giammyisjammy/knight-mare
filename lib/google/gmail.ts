import { gmail } from '@googleapis/gmail'
import type { Overwrite } from 'utility-types'

import { oauth2Client as auth } from '../oauth2-client'
import { getEnv } from '../get-config-value'

const service = gmail({ version: 'v1', auth })

type MailOptions = {
  /** The e-mail address of the sender. All e-mail addresses can be plain 'sender@server.com' or formatted 'Sender Name <sender@server.com>' */
  from?: string
  /** Comma separated list or an array of recipients e-mail addresses that will appear on the To: field */
  to?: string | Array<string>
  /** The subject of the e-mail */
  subject?: string
  /** The HTML version of the message */
  message?: string | Buffer
  attachments?: Attachment[]
}

type Attachment = {
  type: string
  filename: string
  content: Uint8Array
}

export async function send({
  from,
  to: _to,
  subject,
  message: userMessage,
  attachments
}: MailOptions) {
  const recipients = Array.isArray(_to) ? _to.join(', ') : _to
  const to =
    process.env.NODE_ENV === 'production'
      ? recipients
      : getEnv('TEST_EMAIL_ADDRESS', recipients)

  const message =
    process.env.NODE_ENV === 'production'
      ? userMessage
      : `<b>This message would've been delivered to: ${recipients}</b><br/><br/>${userMessage}`

  const body = makeBody({ from, to, subject, message }, attachments)

  // The body needs to be base64url encoded.
  const encodedMessage = Buffer.from(body)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const res = await service.users.messages.send({
    userId: 'me',
    uploadType: 'media', // TODO probably multipart?
    requestBody: {
      raw: encodedMessage
    }
  })
  return res.data
}

// I dunno if this is really necessary...
function utf8Encode(str: string) {
  return `=?utf-8?B?${Buffer.from(str).toString('base64')}?=`
}

type MakeBodyOptions = Overwrite<MailOptions, { to: string }>
function makeBody(mail: MakeBodyOptions, attachments?: Attachment[]) {
  const boundary = 'yourBoundary__' // TODO what is this? have to check RFC 2822 formatting

  // You can use UTF-8 encoding for the texts using the method below.
  // You can also just use a plain string if you don't need anything fancy.
  const messageParts = [
    'MIME-Version: 1.0',
    `From: ${mail.from}`,
    `To: ${mail.to}`,
    `Subject: ${utf8Encode(mail.subject)}`,
    'Content-Type: multipart/related; boundary=' + boundary + '\n',
    '--' + boundary,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit' + '\n', // TODO is this necessary?
    mail.message
  ]

  if (Array.isArray(attachments)) {
    for (let i = 0; i < attachments.length; i++) {
      if (i < attachments.length - 1) {
        messageParts[messageParts.length - 1] =
          messageParts[messageParts.length - 1] + '\n'
      }
      messageParts.push(
        '--' + boundary,
        '--' + boundary,
        'Content-Type: ' +
          attachments[i].type +
          '; name=' +
          attachments[i].filename,
        'Content-Disposition: attachment; filename=' + attachments[i].filename,
        'Content-Transfer-Encoding: base64' + '\n',
        `${Buffer.from(attachments[i].content).toString('base64')}`
      )
      if (i === attachments.length - 1) {
        messageParts.push('--' + boundary + '--')
      }
    }
  }
  return messageParts.join('\n')
}
