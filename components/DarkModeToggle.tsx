import React from 'react'
import { animated, useSpring, useTrail } from 'react-spring'
// import useSound from 'use-sound'

import { usePrefersReducedMotion } from '@/lib/use-prefers-reduce-motion'
import { useDarkMode } from '@/lib/use-dark-mode'

import { UnstyledButton } from './UnstyledButton'
import styles from './DarkModeToggle.module.css'

type DarkModeToggleProps = React.ComponentProps<typeof UnstyledButton> & {
  isDark: boolean
  toggleColorMode: React.MouseEventHandler<HTMLButtonElement>
  size?: number
}
export const DarkModeToggle = ({
  isDark,
  toggleColorMode,
  size = 32,
  id = 'main-nav',
  ...delegated
}: DarkModeToggleProps) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  const svgSpring = useSpring({
    transform: isDark ? 'rotate(40deg)' : 'rotate(90deg)',
    immediate: prefersReducedMotion
  })
  const maskSpring = useSpring({
    cx: isDark ? 10 : 25,
    cy: isDark ? 2 : 0,
    config: {
      mass: 3.1,
      friction: 21
    },
    immediate: prefersReducedMotion
  })
  const sunMoonSpring = useSpring({
    r: isDark ? 8 : 5,
    immediate: prefersReducedMotion
  })

  const sunDotAngles = [0, 60, 120, 180, 240, 300]

  const sunDotTrail = useTrail(sunDotAngles.length, {
    transform: isDark ? 0 : 1,
    transformOrigin: 'center center',
    immediate: isDark || prefersReducedMotion,
    config: {
      tension: 210,
      friction: 20
    }
  })

  return (
    <UnstyledButton
      className={styles.iconWrapper}
      onClick={toggleColorMode}
      aria-label={isDark ? 'Activate light mode' : 'Activate dark mode'}
      title={isDark ? 'Activate light mode' : 'Activate dark mode'}
      {...delegated}
    >
      <animated.svg
        className={styles.moonOrSun}
        width={size}
        height={size}
        viewBox='0 0 18 18'
        style={svgSpring}
      >
        <mask id={`moon-mask-${id}`}>
          <rect x='0' y='0' width='18' height='18' fill='#FFF' />
          <animated.circle {...maskSpring} r='8' fill='black' />
        </mask>

        <animated.circle
          cx='9'
          cy='9'
          fill='var(--fg-color)'
          mask={`url(#moon-mask-${id})`}
          {...sunMoonSpring}
        />

        {/* Sun dots */}
        <g>
          {sunDotTrail.map(({ transform, ...props }, index) => {
            const angle = sunDotAngles[index]
            const centerX = 9
            const centerY = 9

            const angleInRads = (angle / 180) * Math.PI

            const c = 8 // hypothenuse
            const a = centerX + c * Math.cos(angleInRads)
            const b = centerY + c * Math.sin(angleInRads)

            return (
              <animated.circle
                key={angle}
                cx={a}
                cy={b}
                r={1.5}
                fill='var(--fg-color)'
                style={{
                  ...props,
                  transform: transform.interpolate((t) => `scale(${t})`)
                }}
              />
            )
          })}
        </g>
      </animated.svg>
    </UnstyledButton>
  )
}

type ContainerProps = Omit<DarkModeToggleProps, 'isDark' | 'toggleColorMode'>
export const DarkModeToggleContainer = (props: ContainerProps) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  // const [playOn] = useSound('/sounds/switch-on.mp3')
  // const [playOff] = useSound('/sounds/switch-off.mp3')

  const onToggleDarkMode = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      toggleDarkMode()

      if (isDarkMode) {
        // playOn()
      } else {
        // playOff()
      }
    },
    [isDarkMode, toggleDarkMode]
  )

  return (
    <DarkModeToggle
      isDark={isDarkMode}
      toggleColorMode={onToggleDarkMode}
      {...props}
    />
  )
}

export default DarkModeToggleContainer
