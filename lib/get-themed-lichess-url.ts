/*
It looks like display_source does two things:
- adds the query string `?theme=auto&bg=auto&pieceSet=auto`
- adds the pathname `embed`
 */

import { Block } from 'notion-types'

const lichessDomains = new Set(['lichess.org'])
export const isLichessDomain = (url: string): boolean => {
  try {
    const u = new URL(url)
    const { hostname } = u
    return lichessDomains.has(hostname)
  } catch {
    // ignore invalid urls
  }

  return false
}

/**
 * Monkey patches the URL, matching the theme preferences.
 *
 * @param url
 * @param isDarkMode
 * @returns
 */
export const getThemedLichessUrl = (
  url: string,
  isDarkMode = false
): string | null => {
  try {
    const u = new URL(url)
    if (!lichessDomains.has(u.hostname)) {
      return null
    }

    // const bg = u.searchParams.get('bg')
    // if (bg) {
    u.searchParams.set('bg', isDarkMode ? 'dark' : 'light')
    return u.toString()
    // }

    // return url
  } catch {
    // ignore invalid urls
  }

  return null
}

const format: Block['format'] = {
  block_alignment: 'center',
  block_width: 440,
  block_height: 444,
  display_source: 'string',
  block_full_width: false,
  block_page_width: false,
  block_aspect_ratio: 0.54,
  block_preserve_scale: true
}

export const examples = [
  // Chess games
  {
    __title: '✅ GAME',
    type: 'embed',
    format: {
      ...format,
      display_source:
        'https://lichess.org/embed/D4Ov7od6?theme=auto&bg=auto&pieceSet=auto'
    },
    properties: {
      source: [['https://lichess.org/embed/D4Ov7od6']]
    }
  },
  {
    __title: '✅ ANOTHER GAME',
    type: 'embed',
    format: {
      ...format,
      display_source:
        'https://lichess.org/embed/embed/game/MPJcy1JW?theme=auto&bg=auto?theme=auto&bg=auto&pieceSet=auto'
    },
    properties: {
      source: [['https://lichess.org/embed/game/MPJcy1JW?theme=auto&bg=auto']]
    }
  },

  // Chess analysis
  // ✅ should be in the form of /study/embed
  {
    __title: '✅ STUDY',
    type: 'embed',
    format: {
      ...format,
      display_source:
        'https://lichess.org/study/embed/SD9mieGr/4XDS1TQ0?theme=auto&bg=auto&pieceSet=auto'
    },
    properties: {
      source: [['https://lichess.org/study/embed/SD9mieGr/4XDS1TQ0']]
    }
  },

  // Daily puzzle
  {
    __title: '✅ Daily puzzle (external)',
    type: 'embed',
    format: {
      ...format,
      display_source:
        'https://lichess.org/embed/training/frame?theme=auto&bg=auto&pieceSet=auto'
    },
    properties: { source: [['https://lichess.org/training/frame']] }
  },

  // Lichess TV
  {
    __title: '🚧 Lichess TV (no 3rd party cookies = broken)',
    type: 'embed',
    format: {
      ...format,
      display_source:
        'https://lichess.org/embed/tv/frame?theme=brown&bg=dark?theme=auto&bg=auto&pieceSet=auto'
    },
    properties: {
      source: [['https://lichess.org/tv/frame?theme=brown&bg=dark']]
    }
  }

  // Bad examples
  // {
  //   __title: '💥 BAD GAME',
  //   type: 'embed',
  //   format: {
  //     ...format,
  //     display_source:
  //       'https://lichess.org/embed/D4Ov7od6?theme=auto&bg=auto&pieceSet=auto'
  //   },
  //   properties: {
  //     source: [['https://lichess.org/D4Ov7od6']]
  //   }
  // },
  // {
  //   __title: '💥 ANOTHER BAD GAME',
  //   type: 'embed',
  //   format: {
  //     ...format,
  //     display_source:
  //       'https://lichess.org/embed/game/MPJcy1JW?theme=auto&bg=auto?theme=auto&bg=auto&pieceSet=auto'
  //   },
  //   properties: {
  //     source: [['https://lichess.org/game/MPJcy1JW?theme=auto&bg=auto']]
  //   }
  // },
  // {
  //   __title: '💥 BAD STUDY',
  //   type: 'embed',
  //   format: {
  //     ...format,
  //     display_source:
  //       'https://lichess.org/study/embed/SD9mieGr/4XDS1TQ0?theme=auto&bg=auto&pieceSet=auto'
  //   },
  //   properties: { source: [['https://lichess.org/study/SD9mieGr/4XDS1TQ0']] }
  // },

  // // test con YouTube url
  // {
  //   __title: '💥 YouTube test',
  //   type: 'embed',
  //   format: {
  //     ...format,
  //     display_source: 'https://www.youtube.com/watch?v=YFoByIzKGUk&bg=stocazzo'
  //   },
  //   properties: {
  //     source: [['https://www.youtube.com/watch?v=YFoByIzKGUk']]
  //   }
  // }
]
