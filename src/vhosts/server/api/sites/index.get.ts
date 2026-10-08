export default defineEventHandler(async (event) => {
  const file = await readSitesFile(event)
  const roots = getAppRoots(event)
  return {
    ...file,
    roots,
  }
})
