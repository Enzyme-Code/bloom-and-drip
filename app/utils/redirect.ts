/** Only allow same-origin paths from the ?redirect= query to avoid open redirects. */
export function safeRedirect(r: unknown): string {
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/'
}
