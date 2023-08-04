import React from 'react'
import styles from './UnstyledButton.module.css'
import cs from 'classnames'

// Utility type to define css variables in style attribute
// see https://stackoverflow.com/a/65959390
type CustomCSS = React.CSSProperties & Record<`--${string}`, number | string>

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  display?: React.CSSProperties['display']
}
export const UnstyledButton = ({
  display,
  className,
  style,
  ...delegated
}: Props) => (
  <button
    className={cs(styles.button, className)}
    style={{ ...style, '--display': display } as CustomCSS}
    {...delegated}
  />
)

export default UnstyledButton
