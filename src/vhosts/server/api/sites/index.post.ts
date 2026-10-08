import type { SiteInput } from '#shared/types/site'

export default defineEventHandler(async (event) => {
  const body = await readBody<SiteInput>(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }
  return await createSite(body, event)
})
