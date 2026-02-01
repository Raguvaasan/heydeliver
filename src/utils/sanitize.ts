import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for any user-generated content that will be rendered as HTML
 */

/**
 * Sanitize basic text input (no HTML tags allowed)
 * @param dirty - Raw input string
 * @returns Sanitized string safe for display
 */
export const sanitizeText = (dirty: string): string => {
  if (!dirty) return ''
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    KEEP_CONTENT: true, // Keep text content even if tags are removed
  })
}

/**
 * Sanitize HTML with basic formatting (bold, italic, links)
 * @param dirty - Raw HTML string
 * @returns Sanitized HTML safe for display
 */
export const sanitizeBasicHTML = (dirty: string): string => {
  if (!dirty) return ''
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })
}

/**
 * Sanitize rich text content from editors (TipTap, Quill)
 * @param dirty - Raw HTML from rich text editor
 * @returns Sanitized HTML safe for display
 */
export const sanitizeRichText = (dirty: string): string => {
  if (!dirty) return ''
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      // Text formatting
      'p', 'br', 'span', 'div',
      'b', 'i', 'u', 'strong', 'em', 'strike', 's', 'del',
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Lists
      'ul', 'ol', 'li',
      // Links
      'a',
      // Code
      'code', 'pre',
      // Quotes
      'blockquote',
      // Tables (if needed)
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel',
      'class', 'id',
      'style', // For inline styles from editor
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param url - URL string to sanitize
 * @returns Safe URL or empty string if invalid
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return ''
  
  // Remove whitespace
  url = url.trim()
  
  // Check for dangerous protocols
  const dangerousProtocols = /^(?:javascript|data|vbscript|file|about):/i
  if (dangerousProtocols.test(url)) {
    console.warn('Blocked dangerous URL:', url)
    return ''
  }
  
  // Allow only http, https, mailto
  const safeProtocols = /^(?:https?|mailto):/i
  if (url.includes(':') && !safeProtocols.test(url)) {
    console.warn('Blocked non-standard URL protocol:', url)
    return ''
  }
  
  return url
}

/**
 * Sanitize filename to prevent directory traversal
 * @param filename - Original filename
 * @returns Safe filename
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return ''
  
  // Remove path traversal attempts
  filename = filename.replace(/\.\./g, '')
  filename = filename.replace(/[/\\]/g, '')
  
  // Remove potentially dangerous characters
  filename = filename.replace(/[<>:"|?*\x00-\x1f]/g, '')
  
  // Limit length
  if (filename.length > 255) {
    const ext = filename.split('.').pop() || ''
    filename = filename.substring(0, 255 - ext.length - 1) + '.' + ext
  }
  
  return filename
}

/**
 * Sanitize user input for search queries
 * @param query - Search query string
 * @returns Sanitized query
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query) return ''
  
  // Remove HTML tags
  query = sanitizeText(query)
  
  // Remove special characters that could cause issues
  query = query.replace(/[<>'"]/g, '')
  
  // Limit length
  if (query.length > 200) {
    query = query.substring(0, 200)
  }
  
  return query.trim()
}

/**
 * Hook to use in components for sanitizing input onChange
 * @example
 * const handleChange = useSanitizedInput((value) => setFormData({...formData, name: value}))
 */
export const createSanitizedInputHandler = (
  callback: (value: string) => void,
  sanitizer: (value: string) => string = sanitizeText
) => {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const sanitized = sanitizer(e.target.value)
    callback(sanitized)
  }
}

// Export DOMPurify instance for advanced usage
export { DOMPurify }

// Export a default sanitizer for general use
export default {
  text: sanitizeText,
  basicHTML: sanitizeBasicHTML,
  richText: sanitizeRichText,
  url: sanitizeURL,
  filename: sanitizeFilename,
  searchQuery: sanitizeSearchQuery,
  createInputHandler: createSanitizedInputHandler,
}
