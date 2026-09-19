export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  if (
    pathname.startsWith('/_nuxt')
    || pathname.startsWith('/__nuxt')
    || pathname.startsWith('/api/')
  ) {
    return
  }

  const file = await readSitesFile(event)
  const { appRootAbs } = getAppRoots(event)
  const hostHeader = getRequestHeader(event, 'host')
  const resolved = await resolveVhost(hostHeader, file, appRootAbs, {
    ensureSubdir: true,
  })

  if (resolved.kind === 'management') {
    return
  }

  if (resolved.kind === 'unknown' || !resolved.publicRoot || !resolved.site) {
    setResponseStatus(event, 404)
    return 'Unknown host'
  }

  const spa = Boolean(resolved.site.spa)
  return await serveStaticFromRoot(event, resolved.publicRoot, pathname, spa)
})
