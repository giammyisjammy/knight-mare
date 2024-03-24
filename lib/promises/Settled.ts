import { match } from 'ts-pattern'

export class Fulfilled<T> implements PromiseFulfilledResult<T> {
  public status = 'fulfilled' as const
  constructor(public value: T) {}
}
export class Rejected implements PromiseRejectedResult {
  public status = 'rejected' as const
  constructor(public reason: any) {}
}
export type Settled<T> = Fulfilled<T> | Rejected

// constructor
export const of = async <R>(
  callback: () => Promise<R>
): Promise<Settled<R>> => {
  try {
    const result = await callback()
    return new Fulfilled(result)
  } catch (error: unknown) {
    return new Rejected((error as Error).message)
  }
}

// remove one level of monadic structure, projecting its bound argument into the outer level
export const flatMap: {
  <A, B>(onFulfilled: (a: A) => Promise<B>): (
    ma: Settled<A>
  ) => Promise<Settled<B>>
} = (onFulfilled) => async (ma) =>
  match(ma)
    .with({ status: 'rejected' }, (ma) => ma)
    .with(
      { status: 'fulfilled' },
      async ({ value }) => await of(async () => await onFulfilled(value))
    )
    .exhaustive()

// Unwraps Settled<T> with handlers provided
const settledMatch =
  <T, A, B>(onRejected: (r: unknown) => A, onFulfilled: (v: T) => B) =>
  (result: Settled<T>) =>
    match(result)
      .with({ status: 'rejected' }, ({ reason }) => onRejected(reason))
      .with({ status: 'fulfilled' }, ({ value }) => onFulfilled(value))
      .exhaustive()
export { settledMatch as match }

// Convert Settled<T> with a default value
export const getOrElse =
  <T, R>(fn: () => R) =>
  (result: Settled<T>) =>
    settledMatch(fn, (value) => value)(result)

export const map =
  <A, B>(onFulfilled: (a: A) => B) =>
  (ma: Settled<A>): Settled<B> =>
    match(ma)
      .with({ status: 'rejected' }, (ma) => ma)
      .with(
        { status: 'fulfilled' },
        ({ value }) => new Fulfilled(onFulfilled(value))
      )
      .exhaustive()
