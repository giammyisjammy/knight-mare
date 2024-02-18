import * as React from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { LazyAnimationProps } from '@/lib/lazyAnimation'

import { HorsieAnimation, CheckmateAnimation } from './animations'

import styles from './styles.module.css'

type Status = 'success' | 'error'

type Props = {
  title: string
  description?: React.ReactNode
  action?: { label: string; onPress: () => void }
  size: 'medium' | 'large'
  className?: string
  status: Status
}

type FeedbackConfig = {
  positiveIcon: React.ComponentType<LazyAnimationProps>
  negativeIcon: React.ComponentType<LazyAnimationProps>
}

const feedbackConfig: FeedbackConfig = {
  positiveIcon: (props: LazyAnimationProps) => (
    <HorsieAnimation loop={false} {...props} />
  ),
  negativeIcon: CheckmateAnimation
}

/**
 * Feedback can render a predefined feedback status (when using the `status` prop) or render a custom icon
 * (when using the `icon` prop).
 */
export const Feedback = ({
  title,
  description,
  action,
  status,
  size,
  className
}: Props) => {
  const IconComponent = iconForStatus(status, feedbackConfig)

  return (
    <Box className={className} /* style={{ width: config.maxWidth[size] }} */>
      <Stack
        spacing={size === 'large' ? 24 : 16}
        alignItems='center'
        justifyContent='center'
      >
        <Box
          className={styles.iconContainer}
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          {IconComponent && <IconComponent />}
        </Box>

        <Stack
          spacing={size === 'large' ? 8 : 4}
          alignItems='center'
          sx={{ marginTop: '0 !important' }} // HACK: useful only for submission form
        >
          <Typography variant='h5'>{title}</Typography>
          {description && (
            <Typography variant='body2'>{description}</Typography>
          )}
        </Stack>
        {action && (
          <Button variant='contained' onClick={action.onPress}>
            {action.label}
          </Button>
        )}
      </Stack>
    </Box>
  )
}

function iconForStatus(status: Status, config: FeedbackConfig) {
  switch (status) {
    case 'success':
      return config.positiveIcon
    case 'error':
      return config.negativeIcon
  }
}
