import * as React from 'react'

import { Block } from 'notion-types'

import {
  getThemedLichessUrl,
  isLichessDomain
} from '@/lib/get-themed-lichess-url'
import { useDarkMode } from '@/lib/use-dark-mode'

// TODO replace with import AssetWrapper component from react-notion-x
const DummyNotionAssetWrapper: React.FC<{
  blockId: string
  block: Block
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ blockId, block }) => {
  const assetsStyle: React.CSSProperties = {
    width: '100%',

    height: '100%',

    borderRadius: '1px'
  }
  return (
    <div className='notion-asset-wrapper'>
      <h2>{(block as any).__title}</h2>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignSelf: 'center',
          width: '100%',
          minWidth: '440px',
          minHeight: '444px',
          maxWidth: '100%',
          flexDirection: 'column',
          height: '595px'
        }}
      >
        <iframe
          className='notion-asset-object-fit'
          style={assetsStyle}
          src={block.format?.display_source || block.properties.source}
          title={`iframe ${block.type}`}
          frameBorder='0'
          // TODO: is this sandbox necessary?
          // sandbox='allow-scripts allow-popups allow-top-navigation-by-user-activation allow-forms allow-same-origin'
          // allowFullScreen
          // this is important for perf but react's TS definitions don't seem to like it
          loading='lazy'
          scrolling='auto'
        />
      </div>
    </div>
  )
}

export const ThemedEmbed: React.FC<
  React.ComponentProps<typeof DummyNotionAssetWrapper>
> = ({ blockId, block }) => {
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
    blockDisplay_source: block.format?.display_source,
    blockSource: block.properties.source[0][0],

    patchedDisplay_source: patchedBlock.format.display_source,
    patchedSource: patchedBlock.properties.source[0][0]
  })
  return <DummyNotionAssetWrapper {...{ blockId, block: patchedBlock }} />
}
