import fetch from 'isomorphic-unfetch'

export class ResponseError extends Error {
  public response: Response | globalThis.Response

  constructor(response: Response | globalThis.Response) {
    super(response.statusText)
    this.response = response
  }
}

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response: Response | globalThis.Response) {
  if (response.status === 204 || response.status === 205) {
    return null
  }
  return response.json()
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
export function checkStatus(response: Response | globalThis.Response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  const error = new ResponseError(response)
  error.response = response
  throw error
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export async function fetcher(url: RequestInfo, options?: RequestInit) {
  const fetchResponse = await fetch(url, options)
  const response = checkStatus(fetchResponse)
  return parseJSON(response)
}

export default fetcher
