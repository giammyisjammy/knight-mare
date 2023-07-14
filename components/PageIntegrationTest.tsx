import * as React from 'react'

import { IoMoonSharp } from '@react-icons/all-files/io5/IoMoonSharp'
import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline'

import { ThemedEmbed } from '@/components/ThemedEmbed'
import { examples } from '@/lib/get-themed-lichess-url'
import * as types from '@/lib/types'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

export default function IntegrationTestPage() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const onToggleDarkMode = React.useCallback(
    (e) => {
      e.preventDefault()
      toggleDarkMode()
    },
    [toggleDarkMode]
  )

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <div className='notion notion-app'>
      <header>
        <div className={styles.settings}>
          {hasMounted && (
            <a
              className={styles.toggleDarkMode}
              href='#'
              role='button'
              onClick={onToggleDarkMode}
              title='Toggle dark mode'
            >
              {isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
            </a>
          )}
        </div>
      </header>
      <div
        className='cazzate'
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))',
          // gridTemplateRows: 'repeat(auto-fill, minmax(444px, 1fr))',
          gap: '1rem'
        }}
      >
        {examples.map((block, key) => (
          <div key={key}>
            <ThemedEmbed block={block as any as types.Block} blockId='nope' />
          </div>
        ))}
      </div>
    </div>
  )
}
