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
import { MembershipType } from './types'

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
  // force some values
  // newClubMember.paymentStatus = 'Irregolare'
  // newClubMember.membershipStatus = 'Nuovo'

  const { properties } = newClubMember.toNotionPage()
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
    properties: properties as any // HACK too hard to type because limited access to Notion internal types
  })
}

export async function retrievePublicMembershipTypes() {
  const databaseId = registerOfMembersDatabaseId
  const response = await notionClient.databases.retrieve({
    database_id: databaseId
  })
  const membershipTypes: MembershipType[] = response.properties[
    'Tipologia Affiliazione'
  ]['select']['options'].filter((e) => e.description !== '!private')
  return membershipTypes
}

export async function retrieveNewMembers() {
  const databaseId = registerOfMembersDatabaseId
  const membershipTypes = await retrievePublicMembershipTypes()
  return await notionClient.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          or: [
            {
              property: 'Stato Associativo',
              select: { equals: 'Nuovo' }
            },
            {
              property: 'Stato Associativo',
              select: { equals: 'Mandare mail' }
            }
          ]
        },
        {
          or: membershipTypes.map((x) => ({
            property: 'Tipologia Affiliazione',
            select: { equals: x.name }
          }))
        }
      ]
    }
  })
}

export async function updateMember(member: ClubMember) {
  return await notionClient.pages.update(member.toNotionPage() as any) // HACK too hard to type because limited access to Notion internal types
}
