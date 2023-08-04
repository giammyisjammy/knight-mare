import * as React from 'react'

import { ThemedEmbed } from '@/components/ThemedEmbed'
import { examples } from '@/lib/get-themed-lichess-url'
import * as types from '@/lib/types'

import styles from './styles.module.css'
import DarkModeToggle from './DarkModeToggle'

export default function IntegrationTestPage() {
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <div className='notion notion-app'>
      <header>
        <div className={styles.settings}>
          {hasMounted && <DarkModeToggle />}
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
