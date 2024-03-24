import { auth } from '@googleapis/drive'

import { getEnv } from './get-config-value'

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET
 * and REDIRECT_URI.
 * To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
export const oauth2Client = new auth.OAuth2({
  clientId: getEnv('GOOGLE_CLIENT_ID', null),
  clientSecret: getEnv('GOOGLE_CLIENT_SECRET', null),
  redirectUri: getEnv('GOOGLE_REDIRECT_URL', null)
})

oauth2Client.setCredentials({
  refresh_token: getEnv('GOOGLE_REFRESH_TOKEN', null)
})

// export const jwtClient = auth.fromAPIKey(getEnv('GOOGLE_API_KEY', null))

// Generate a url that asks permissions for the activity scope
// const scopes = [
//   // drive
//   'https://www.googleapis.com/auth/drive',
//   'https://www.googleapis.com/auth/drive.appdata',
//   'https://www.googleapis.com/auth/drive.file',
//   'https://www.googleapis.com/auth/drive.metadata',
//   'https://www.googleapis.com/auth/drive.metadata.readonly',
//   'https://www.googleapis.com/auth/drive.photos.readonly',
//   'https://www.googleapis.com/auth/drive.readonly',
//   // gmail
//   'https://mail.google.com/',
//   'https://www.googleapis.com/auth/gmail.modify',
//   'https://www.googleapis.com/auth/gmail.compose',
//   'https://www.googleapis.com/auth/gmail.send'
// ]

// export const authorizationUrl = oauth2Client.generateAuthUrl({
//   // 'online' (default) or 'offline' (gets refresh_token)
//   access_type: 'offline',
//   /** Pass in the scopes array defined above.
//    * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
//   scope: scopes,
//   // Enable incremental authorization. Recommended as a best practice.
//   include_granted_scopes: true
// })
// console.log('authorizationUrl', authorizationUrl)
