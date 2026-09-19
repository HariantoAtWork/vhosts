export default defineEventHandler(async (event) => {
  const uuid = getRouterParam(event, 'uuid')
  if (!uuid) {
    throw createError({ statusCode: 400, statusMessage: 'Missing uuid' })
  }
  const site = await getSite(uuid, event)
  const { appRootAbs } = getAppRoots(event)
  await ensureSiteDirs(appRootAbs, site.path, { placeholder: true })
  return {
    ok: true,
    path: site.path,
    public: `${site.path}/public`,
    subdomains: `${site.path}/subdomains`,
  }
})
