import { getClientSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  let normalizedUrl = url.trim()
  normalizedUrl = normalizedUrl.replace(/^(https?:\/\/)(?=https?:\/\/)/i, '')

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  const separator = normalizedUrl.includes('?') ? '&' : '?'
  const hasProtocol = /^https?:\/\//i.test(normalizedUrl)
  const isProtocolRelative = normalizedUrl.startsWith('//')
  const isRootRelative = normalizedUrl.startsWith('/')

  // Check if URL already has http/https protocol
  if (hasProtocol || isProtocolRelative) {
    const absoluteUrl = isProtocolRelative ? `https:${normalizedUrl}` : normalizedUrl
    return cacheTag ? `${absoluteUrl}${separator}${cacheTag}` : absoluteUrl
  }

  if (isRootRelative) {
    return cacheTag ? `${normalizedUrl}${separator}${cacheTag}` : normalizedUrl
  }

  // Otherwise prepend client-side URL
  const baseUrl = getClientSideURL()
  return cacheTag ? `${baseUrl}${normalizedUrl}${separator}${cacheTag}` : `${baseUrl}${normalizedUrl}`
}
