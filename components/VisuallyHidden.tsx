import React from 'react'

import styles from './styles.module.css'

const VisuallyHidden = ({ children, ...delegated }) => {
  const [forceShow, setForceShow] = React.useState(false)

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const handleKeyDown = (ev) => {
        if (ev.key === 'Alt') {
          setForceShow(true)
        }
      }

      const handleKeyUp = () => {
        setForceShow(false)
      }

      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keydown', handleKeyUp)
      }
    }
  }, [])

  if (forceShow) {
    return children
  }

  return (
    <div className={styles.visuallyHidden} {...delegated}>
      {children}
    </div>
  )
}

export default VisuallyHidden
