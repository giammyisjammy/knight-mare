import * as React from 'react'

import { LoadingAnimation } from './animations'
import styles from './styles.module.css'

export const Loading: React.FC = () => (
  <div className={styles.container}>
    <LoadingAnimation />
  </div>
)
