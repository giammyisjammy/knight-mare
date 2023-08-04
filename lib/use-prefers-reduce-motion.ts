import React from 'react'

const QUERY = '(prefers-reduced-motion: no-preference)'

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    setPrefersReducedMotion(!window.matchMedia(QUERY).matches)

    const mediaQueryList = window.matchMedia(QUERY)

    const listener = (event) => {
      setPrefersReducedMotion(!event.matches)
    }

    mediaQueryList.addEventListener('change', listener)

    return () => {
      mediaQueryList.removeEventListener('change', listener)
    }
  }, [setPrefersReducedMotion])

  return prefersReducedMotion
}
