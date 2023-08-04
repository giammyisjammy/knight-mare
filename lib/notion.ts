import { ExtendedRecordMap, SearchParams, SearchResults } from 'notion-types'
import { mergeRecordMaps } from 'notion-utils'
import pMap from 'p-map'
import pMemoize from 'p-memoize'

import {
  isPreviewImageSupportEnabled,
  navigationLinks,
  navigationStyle
} from './config'
import { notion, notionClient } from './notion-api'
import { getPreviewImageMap } from './preview-images'
import { IClubMemberDTO } from '@/lib/ClubMember'

const getNavigationLinkPages = pMemoize(
  async (): Promise<ExtendedRecordMap[]> => {
    const navigationLinkPageIds = (navigationLinks || [])
      .map((link) => link.pageId)
      .filter(Boolean)

    if (navigationStyle !== 'default' && navigationLinkPageIds.length) {
      return pMap(
        navigationLinkPageIds,
        async (navigationLinkPageId) =>
          notion.getPage(navigationLinkPageId, {
            chunkLimit: 1,
            fetchMissingBlocks: false,
            fetchCollections: false,
            signFileUrls: false
          }),
        {
          concurrency: 4
        }
      )
    }

    return []
  }
)

export async function getPage(pageId: string): Promise<ExtendedRecordMap> {
  let recordMap = await notion.getPage(pageId)

  if (navigationStyle !== 'default') {
    // ensure that any pages linked to in the custom navigation header have
    // their block info fully resolved in the page record map so we know
    // the page title, slug, etc.
    const navigationLinkRecordMaps = await getNavigationLinkPages()

    if (navigationLinkRecordMaps?.length) {
      recordMap = navigationLinkRecordMaps.reduce(
        (map, navigationLinkRecordMap) =>
          mergeRecordMaps(map, navigationLinkRecordMap),
        recordMap
      )
    }
  }

  if (isPreviewImageSupportEnabled) {
    const previewImageMap = await getPreviewImageMap(recordMap)
    ;(recordMap as any).preview_images = previewImageMap
  }

  return recordMap
}

export async function search(params: SearchParams): Promise<SearchResults> {
  return notion.search(params)
}

export async function createDatabaseEntry(subscriber: IClubMemberDTO) {
  // If the new page is a child of an existing database, the keys of the properties object body param must match the parent database's properties.
  const database_id = process.env.NOTION_DATABASE_ID
  const response = await notionClient.pages.create({
    // cover: {
    //   type: 'external',
    //   external: {
    //     url: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg'
    //   }
    // },
    // icon: {
    //   type: 'emoji',
    //   emoji: '🥬'
    // },
    parent: {
      type: 'database_id',
      database_id
    },
    properties: {
      // ID: {
      //   id: 'tqqd',
      //   type: 'unique_id',
      //   unique_id: {
      //     number: subscriber.id,
      //     prefix: 'LS'
      //   }
      // },
      'Nome e Cognome': {
        title: [
          {
            text: {
              content: subscriber.fullName
            }
          }
        ]
      },
      // 'Stato pagamenti': {"select": {
      //   "name": "Marketing"
      // }},
      // CAP: { number: subscriber.cap },
      'Codice Fiscale': {
        title: [
          {
            text: {
              content: subscriber.fiscalCode
            }
          }
        ]
      },
      'Consenso privacy': { checkbox: subscriber.privacyConsent },
      'Consenso trattamento immagini': { checkbox: subscriber.imagesConsent },
      'Data di Nascita': {
        date: { start: JSON.stringify(subscriber.birthDate) }
      },
      Email: { email: subscriber.email },
      // Indirizzo: { text: { content: subscriber.address } },
      'Nato/a a': { select: { name: subscriber.birthPlace } },
      // 'Provincia di Nascita': { select: { name: subscriber.birthProvince } },
      // 'Provincia residenza': { select: { name: subscriber.cityProvince } },
      'Residente in': { select: { name: subscriber.city } },
      // 'Stato associativo': { select: { name: subscriber.statoAssociativo } },
      Telefono: { phone_number: subscriber.phoneNr }
      // 'Tipologia affiliazione': { select: { name: subscriber.tipologiaAffiliazione } },
    }
  })
  console.log(response)
}
