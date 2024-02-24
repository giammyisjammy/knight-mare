import { ExtendedRecordMap, SearchParams, SearchResults } from 'notion-types'
import { mergeRecordMaps } from 'notion-utils'
import pMap from 'p-map'
import pMemoize from 'p-memoize'

import { ClubMember } from '@/lib/ClubMember'

import {
  isPreviewImageSupportEnabled,
  navigationLinks,
  navigationStyle,
  registerOfMembersDatabaseId
} from './config'
import { notion, notionClient } from './notion-api'
import { getPreviewImageMap } from './preview-images'

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

export async function createRegisterOfMemberEntry(newClubMember: ClubMember) {
  return await notionClient.pages.create({
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
      database_id: registerOfMembersDatabaseId
    },
    properties: {
      'Nome e Cognome': {
        title: [
          {
            text: {
              content: newClubMember.fullName
            }
          }
        ]
      },
      CAP: {
        // id: 'vjFZ',
        rich_text: [
          {
            text: { content: newClubMember.CAP }
          }
        ]
      },
      'Codice Fiscale': {
        // id: 'qve%3B',
        rich_text: [
          {
            text: { content: newClubMember.fiscalCode }
          }
        ]
      },
      'Consenso Privacy': {
        // id: 'UNGT',
        checkbox: newClubMember.privacyConsent
      },
      'Consenso Trattamento Immagini': {
        // id: 'yz%5Bs',
        checkbox: newClubMember.imagesConsent
      },
      'Data di Nascita': {
        // id: 'FkdU',
        date: { start: newClubMember.birthDate.toISOString() }
      },
      Email: {
        // id: 'Bbwe',
        email: newClubMember.email
      },
      Indirizzo: {
        // id: 'IFxf',
        rich_text: [
          {
            text: { content: newClubMember.address }
          }
        ]
      },
      'Nato/a a': {
        // id: 'js%7Dj',
        select: {
          name: newClubMember.birthPlace
        }
      },
      'Provincia di Residenza': {
        // id: '%3E%5E%3D%3C',
        select: { name: newClubMember.birthProvince }
      },
      'Provincia di Nascita': {
        // id: '%3Fehm',
        select: { name: newClubMember.cityProvince }
      },
      'Residente in': {
        // id: 'ATv%7D',
        select: {
          name: newClubMember.city
        }
      },
      Telefono: {
        // id: 'NNIC',
        phone_number: newClubMember.phoneNr
      },
      'Tipologia Affiliazione': {
        // id: '_%3Bj%3C',
        select: {
          // id: '_UJ`',
          name: newClubMember.membershipType
        }
      },
      'Stato Pagamenti': {
        // id: 'CohL',
        type: 'select',
        select: {
          name: 'Irregolare'
        }
      },
      'Stato Associativo': {
        // id: 'x%3EU%3E',
        select: {
          name: 'Nuovo'
        }
      }
    }
  })
}

export async function retrieveMembershipTypes() {
  const databaseId = registerOfMembersDatabaseId
  const response = await notionClient.databases.retrieve({
    database_id: databaseId
  })
  const membershipTypes = response.properties['Tipologia Affiliazione'][
    'select'
  ]['options'].filter((e) => e.description !== '!private')
  return membershipTypes
}

export async function retrieveNewMembers() {
  const databaseId = registerOfMembersDatabaseId
  return await notionClient.databases.query({
    database_id: databaseId,
    filter: {
      or: [
        {
          property: 'Stato Associativo',
          select: {
            equals: 'Nuovo'
          }
        },
        {
          property: 'Stato Associativo',
          select: {
            equals: 'Mandare mail'
          }
        }
      ]
    }
  })
}
