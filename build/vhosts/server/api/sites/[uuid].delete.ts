export default defineEventHandler(async (event) => {
  const uuid = getRouterParam(event, 'uuid')
  if (!uuid) {
    throw createError({ statusCode: 400, statusMessage: 'Missing uuid' })
  }
  await deleteSite(uuid, event)
  return { ok: true }
})
