import { gmail_v1 } from '@googleapis/gmail'
import { UpdatePageResponse } from '@notionhq/client/build/src/api-endpoints'
import chalk from 'chalk'

import { ClubMember } from '@/lib/ClubMember'

export abstract class Dummy {
  private static UpdatePageResponse(): UpdatePageResponse {
    return {
      object: 'page',
      id: '123'
    }
  }
  private static gmail_v1Schema$Message(): gmail_v1.Schema$Message {
    return { id: '123' }
  }
  private static failingDelay(
    probability: number,
    duration: number,
    tag?: string
  ) {
    return new Promise<void>((resolve, reject) =>
      setTimeout(() => {
        const random = Math.random()
        console.log(
          random > probability
            ? chalk.blue(`${tag} succeeds`)
            : chalk.red(`${tag} throws`)
        )
        if (random > probability) {
          return resolve()
        } else {
          reject(new Error(`failing by design =) (${tag})`))
        }
      }, duration)
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async updateMember(member: ClubMember) {
    await this.failingDelay(0.8, 0, `updateMember`)
    return this.UpdatePageResponse()
  }
  public static async sendWelcomeMail(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _member: ClubMember,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _pdfBytes: Uint8Array
  ) {
    await this.failingDelay(0.2, 0, `sendWelcomeMail`)
    return this.gmail_v1Schema$Message()
  }
}
