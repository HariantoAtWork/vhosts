export default defineEventHandler(async (event) => {
  // Management UI + API live on the control listener (:1080).
  if (isControlListener(event)) {
    return
  }

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

  const edgeTitle = resolveEdgeTitle(useRuntimeConfig(event).edgeTitle)

  // Never serve Nuxt on the edge — even for managementHosts.
  if (resolved.kind === 'management') {
    setResponseStatus(event, 404)
    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    return edgeManagementHtml(controlPort(), edgeTitle)
  }

  if (resolved.kind === 'unknown' || !resolved.publicRoot || !resolved.site) {
    setResponseStatus(event, 404)
    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    return edgeUnknownHostHtml(edgeTitle)
  }

  const spa = Boolean(resolved.site.spa)
  return await serveStaticFromRoot(event, resolved.publicRoot, pathname, spa)
})
