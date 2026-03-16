// src/common/parseFormUrlEncoded.ts
// Utility to parse x-www-form-urlencoded body into an object

export function parseFormUrlEncoded(body: string): Record<string, string> {
  return body.split('&').reduce((acc, pair) => {
    const [key, value] = pair.split('=')
    acc[decodeURIComponent(key)] = decodeURIComponent(value || '')
    return acc
  }, {} as Record<string, string>)
}
