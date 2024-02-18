import * as React from 'react'
import dynamic from 'next/dynamic'

// import type { DynamicOptions } from 'next/dynamic'
import type { LottieComponentProps } from 'lottie-react'

import type { Optional } from './types'

export type LazyAnimationProps = Optional<LottieComponentProps, 'animationData'>

// type Unpromisify<T> = T extends Promise<infer P> ? P : never

const Lottie = dynamic(() => import('lottie-react'))

const makeLazyAnimation = <P extends LazyAnimationProps>({
  default: animationData
}) => {
  return function LazyAnimation(props: P) {
    return <Lottie {...props} animationData={animationData} />
  }
}

export const lazyAnimation = <
  T extends Promise<any>,
  U extends React.ComponentType<any>,
  P extends LazyAnimationProps
>(
  importFunc: () => T
  // selectorFunc?: (s: Unpromisify<T>) => U,
  // opts?: DynamicOptions<P>
) => {
  const lazyFactory: () => Promise<{ default: U }> = importFunc

  // if (selectorFunc) {
  //   lazyFactory = () =>
  //     importFunc().then((module) => ({ default: selectorFunc(module) }))
  // }

  const LazyComponent = dynamic<P>(lazyFactory().then(makeLazyAnimation), {
    ssr: false
  })

  return LazyComponent
}
