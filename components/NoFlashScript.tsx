import React from 'react'

function noFlash() {
  const storageKey = 'darkMode'
  const classNameDark = 'dark-mode'
  const classNameLight = 'light-mode'
  function setClassOnDocumentBody(darkMode) {
    document.body.classList.add(darkMode ? classNameDark : classNameLight)
    document.body.classList.remove(darkMode ? classNameLight : classNameDark)
  }
  const preferDarkQuery = '(prefers-color-scheme: dark)'

  const mql = window.matchMedia(preferDarkQuery)
  const supportsColorSchemeQuery = mql.media === preferDarkQuery

  let localStorageTheme = null
  try {
    localStorageTheme = localStorage.getItem(storageKey)
  } catch (err) {
    /* empty */
  }

  const localStorageExists = localStorageTheme !== null

  if (localStorageExists) {
    localStorageTheme = JSON.parse(localStorageTheme)
  }

  // Determine the source of truth
  if (localStorageExists) {
    // source of truth from localStorage
    setClassOnDocumentBody(localStorageTheme)
  } else if (supportsColorSchemeQuery) {
    // source of truth from system
    setClassOnDocumentBody(mql.matches)
    localStorage.setItem(storageKey, String(mql.matches))
  } else {
    // source of truth from document.body
    const isDarkMode = document.body.classList.contains(classNameDark)
    localStorage.setItem(storageKey, JSON.stringify(isDarkMode))
  }
}

export const NoFlashScript = () => {
  const boundFn = String(noFlash)
  // .replace("'🌈'", JSON.stringify(COLORS))
  // .replace('🔑', COLOR_MODE_KEY)
  // .replace('⚡️', INITIAL_COLOR_MODE_CSS_PROP)

  const calledFunction = `
/** Inlined version of noflash.js from use-dark-mode */
;(${boundFn})();
`

  // calledFunction = Terser.minify(calledFunction).code

  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: calledFunction }} />
}
