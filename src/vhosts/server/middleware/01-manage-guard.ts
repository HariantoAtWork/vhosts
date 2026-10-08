export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  if (!pathname.startsWith('/api/')) return

  // API only on control listener (:1080).
  if (!isControlListener(event)) {
    setResponseStatus(event, 403)
    return 'Forbidden — use control port'
  }
})
