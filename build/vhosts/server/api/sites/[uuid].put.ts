import type { SiteInput } from '#shared/types/site'

export default defineEventHandler(async (event) => {
  const uuid = getRouterParam(event, 'uuid')
  if (!uuid) {
    throw createError({ statusCode: 400, statusMessage: 'Missing uuid' })
  }
  const body = await readBody<Partial<SiteInput>>(event)
  return await updateSite(uuid, body || {}, event)
})
