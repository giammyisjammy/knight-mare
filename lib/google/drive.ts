import fs from 'fs'
import os from 'os'
import readline from 'readline'

import path from 'path'

import ExpiryMap from 'expiry-map'

import { v4 as uuidv4 } from 'uuid'
import { drive } from '@googleapis/drive'

import pMemoize from 'p-memoize'

import { oauth2Client as auth } from '../oauth2-client'

const service = drive({ version: 'v3', auth })

async function downloadImpl(fileId: string) {
  console.log('[download] fileId', fileId)
  // For converting document formats, and for downloading template
  // documents, see the method drive.files.export():
  // https://developers.google.com/drive/api/v3/manage-downloads
  const res = await service.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  )
  return new Promise<string>((resolve, reject) => {
    const filePath = path.join(os.tmpdir(), uuidv4())
    console.log(`writing to ${filePath}`)
    const readStream = fs.createWriteStream(filePath)
    let progress = 0

    res.data
      .on('end', () => {
        console.log('Done downloading file.')
        resolve(filePath)
      })
      .on('error', (err) => {
        console.error('Error downloading file.')
        reject(err)
      })
      .on('data', (chunk) => {
        progress += chunk.length
        if (process.stdout.isTTY) {
          readline.cursorTo(process.stdout, 0)
          process.stdout.write(`Downloaded ${progress} bytes`)
        }
      })
      .pipe(readStream)
  })
}

export const download = pMemoize(downloadImpl, {
  // cacheKey: ([fileId]) => fileId,
  cache: new ExpiryMap(10000)
})

type UploadParams = {
  /**
   * If defined, upload a file to the specified folder.
   */
  folderId?: string
  mimeType: string
  filePath: string
}

export async function upload({ filePath, mimeType, folderId }: UploadParams) {
  const fileMetadata = {
    name: path.basename(filePath),
    parents: folderId ? [folderId] : undefined
  }
  const media = {
    mimeType,
    body: fs.createReadStream(filePath)
  }

  const file = await service.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id'
  })
  console.log('File Id:', file.data.id)
  return file.data.id
}
