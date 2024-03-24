import map from 'p-map'
import pipe from 'p-pipe'

import { match } from 'ts-pattern'

import { Fulfilled, Rejected } from './Settled'

// types not exported from p-map, have to hack our own here :P
type Mapper<Element, NewElement> = Parameters<
  typeof map<Element, NewElement>
>[1]
type Options = Parameters<typeof map>[2]

//

/**
 * Lazy version of p-map, useful for pipelines
 *
 * @param input - Synchronous or asynchronous iterable that is iterated over concurrently, calling the `mapper` function for each element. Each iterated item is `await`'d before the `mapper` is invoked so the iterable may return a `Promise` that resolves to an item. Asynchronous iterables (different from synchronous iterables that return `Promise` that resolves to an item) can be used when the next item may not be ready without waiting for an asynchronous process to complete and/or the end of the iterable may be reached after the asynchronous process completes. For example, reading from a remote queue when the queue has reached empty, or reading lines from a stream.
 * @param mapper - Function which is called for every item in `input`. Expected to return a `Promise` or value.
 * @returns A `Promise` that is fulfilled when all promises in `input` and ones returned from `mapper` are fulfilled, or rejects if any of the promises reject. The fulfilled value is an `Array` of the fulfilled values returned from `mapper` in `input` order.
 *
 * @example
 * ```
 * import pipe from 'p-pipe'
 * import got from 'got';
 *
 * const sites = [
 * 	getWebsiteFromUsername('sindresorhus'), //=> Promise
 * 	'https://avajs.dev',
 * 	'https://github.com'
 * ];
 *
 * const mapper = async site => {
 * 	const {requestUrl} = await got.head(site);
 * 	return requestUrl;
 * };
 *
 * const result = await pipe(() => sites, map(mapper, {concurrency: 2}));
 *
 * console.log(result);
 * //=> ['https://sindresorhus.com/', 'https://avajs.dev/', 'https://github.com/']
 * ```
 */
const lazyMap =
  <Element, NewElement>(
    mapper: Mapper<Element, NewElement>,
    options?: Options
  ) =>
  (
    input:
      | AsyncIterable<Element | Promise<Element>>
      | Iterable<Element | Promise<Element>>
  ) =>
    map(input, mapper, options)

export default {
  map: lazyMap,
  pipe
}

//
// old helpers, kept here for reference
//

const passthroughError = async ({ reason }) => Promise.reject(reason)
/**
 * Process promises in parallel, keeping failed ones
 */
export const pMapParallel = <T, R>(
  array: PromiseSettledResult<T>[],
  callback: (value: T) => R
) =>
  Promise.allSettled(
    array.map(async (promise) =>
      match(promise)
        .with(
          { status: 'fulfilled' },
          async ({ value }) => await callback(value)
        )
        .with({ status: 'rejected' }, passthroughError) // ignore
        .exhaustive()
    )
  )

/**
 * Process promises in sequence, keeping failed ones
 */
export const pMapSeries = <T, R>(
  array: T[],
  callback: (current: T) => Promise<R>
) =>
  array.reduce(async (previousPromise, current) => {
    const settledArray = await previousPromise

    try {
      const result = await callback(current)
      return settledArray.concat(new Fulfilled(result))
    } catch (error: unknown) {
      return settledArray.concat(new Rejected((error as Error).message))
    }
  }, Promise.resolve([] as PromiseSettledResult<R>[]))
