import type { Site, SiteInput, SitesFile } from '#shared/types/site'

export type SitesPayload = SitesFile & {
  roots: { appRootAbs: string, appConfigAbs: string }
}

function errMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>
    const data = o.data as Record<string, unknown> | undefined
    if (data?.statusMessage && typeof data.statusMessage === 'string') return data.statusMessage
    if (typeof o.statusMessage === 'string') return o.statusMessage
    if (typeof o.message === 'string') return o.message
  }
  if (e instanceof Error) return e.message
  return fallback
}

export function useSites() {
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function list(): Promise<SitesPayload> {
    pending.value = true
    error.value = null
    try {
      return await $fetch<SitesPayload>('/api/sites')
    } catch (e: unknown) {
      error.value = errMessage(e, 'Failed to load sites')
      throw e
    } finally {
      pending.value = false
    }
  }

  async function get(uuid: string): Promise<Site> {
    return await $fetch<Site>(`/api/sites/${uuid}`)
  }

  async function create(input: SiteInput): Promise<Site> {
    return await $fetch<Site>('/api/sites', { method: 'POST', body: input })
  }

  async function update(uuid: string, input: Partial<SiteInput>): Promise<Site> {
    return await $fetch<Site>(`/api/sites/${uuid}`, { method: 'PUT', body: input })
  }

  async function remove(uuid: string): Promise<void> {
    await $fetch(`/api/sites/${uuid}`, { method: 'DELETE' })
  }

  async function ensure(uuid: string): Promise<void> {
    await $fetch(`/api/sites/${uuid}/ensure`, { method: 'POST' })
  }

  return { pending, error, list, get, create, update, remove, ensure, errMessage }
}
