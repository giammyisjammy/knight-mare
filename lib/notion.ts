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
import { IFormInput } from '@/components/MembershipForm'

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

export async function createDatabaseEntry(subscriber: IFormInput) {
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
      Name: {
        title: [
          {
            text: {
              content: subscriber.name
            }
          }
        ]
      },
      Gender: {
        select: {
          name: subscriber.gender
        }
      }
    }
    // children: [
    //   {
    //     object: 'block',
    //     heading_2: {
    //       rich_text: [
    //         {
    //           text: {
    //             content: 'Lacinato kale'
    //           }
    //         }
    //       ]
    //     }
    //   },
    //   {
    //     object: 'block',
    //     paragraph: {
    //       rich_text: [
    //         {
    //           text: {
    //             content:
    //               'Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.',
    //             link: {
    //               url: 'https://en.wikipedia.org/wiki/Lacinato_kale'
    //             }
    //           },
    //           href: 'https://en.wikipedia.org/wiki/Lacinato_kale'
    //         }
    //       ],
    //       color: 'default'
    //     }
    //   }
    // ]
  })
  console.log(response)
}
