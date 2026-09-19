export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  if (!pathname.startsWith('/api/')) return

  const file = await readSitesFile(event)
  const host = sanitizeHost(getRequestHeader(event, 'host'))
  if (!host || !isManagementHost(host, file)) {
    setResponseStatus(event, 403)
    return 'Forbidden'
  }
})
