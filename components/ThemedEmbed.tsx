import * as React from 'react'

import { AssetWrapper } from 'react-notion-x'

import {
  getThemedLichessUrl,
  isLichessDomain
} from '@/lib/get-themed-lichess-url'
import { useDarkMode } from '@/lib/use-dark-mode'

export const ThemedEmbed = ({
  blockId,
  block
}: React.ComponentProps<typeof AssetWrapper>) => {
  const { isDarkMode } = useDarkMode()

  if (!block) {
    return null
  }

  let patchedBlock = block

  if (block.type === 'embed') {
    const src = block.format?.display_source || block.properties.source
    if (src) {
      if (
        typeof src === 'string'
          ? isLichessDomain(src)
          : isLichessDomain(src[0][0])
      ) {
        // patch block.format.display_source to match block.properties.source
        patchedBlock = {
          ...block,
          properties: {
            ...block.properties,
            source: [
              [getThemedLichessUrl(block.properties.source[0][0], isDarkMode)]
            ]
          },
          format: {
            ...block.format,
            display_source: getThemedLichessUrl(
              block.properties.source[0][0],
              isDarkMode
            )
          }
        }
      }
    }
  }
  //

  console.log({
    original: {
      display_source: block.format?.display_source,
      source: block.properties.source[0][0]
    },
    patched: {
      display_source: patchedBlock.format.display_source,
      source: patchedBlock.properties.source[0][0]
    }
  })
  return <AssetWrapper blockId={blockId} block={patchedBlock} />
}
