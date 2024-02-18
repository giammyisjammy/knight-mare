import { lazyAnimation } from '@/lib/lazyAnimation'

export const CheckmateAnimation = lazyAnimation(
  () => import('./checkmate.json')
)
export const ErrorAnimation = lazyAnimation(() => import('./error.json'))
export const HorsieAnimation = lazyAnimation(() => import('./horsie.json'))
export const LoadingAnimation = lazyAnimation(() => import('./loading.json'))
export const SuccessAnimation = lazyAnimation(() => import('./success.json'))
