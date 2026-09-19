import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { v7 as uuid } from 'uuid'
import type { Site, SiteInput, SitesFile } from '#shared/types/site'
import { resolveAppConfigDir, resolveAppRoot } from './paths'
import { ensureSiteDirs } from './ensure-dirs'
import { normalizeHosts, sanitizeSitePath } from './sanitize'

let cache: SitesFile | null = null
let cachePath: string | null = null

const seedSitesPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../seed/sites.json',
)

function emptySitesFile(): SitesFile {
  return {
    version: 1,
    managementHosts: ['localhost', '127.0.0.1'],
    sites: [],
  }
}

function sitesFilePath(appConfigAbs: string): string {
  return join(appConfigAbs, 'sites.json')
}

export function invalidateSitesCache(): void {
  cache = null
  cachePath = null
}

function normalizeSite(raw: Partial<Site> & { uuid?: string }): Site | null {
  const path = sanitizeSitePath(raw.path)
  const hosts = normalizeHosts(raw.hosts)
  if (!path || !hosts) return null
  return {
    uuid: typeof raw.uuid === 'string' && raw.uuid.length > 0 ? raw.uuid : uuid(),
    path,
    hosts,
    spa: Boolean(raw.spa),
    autoSubdomains: raw.autoSubdomains !== false,
    enabled: raw.enabled !== false,
    engine: raw.engine === 'php' ? 'php' : 'static',
  }
}

function normalizeFile(raw: unknown): SitesFile {
  if (!raw || typeof raw !== 'object') return emptySitesFile()
  const obj = raw as Record<string, unknown>
  const managementHosts = Array.isArray(obj.managementHosts)
    ? obj.managementHosts.map(String).map(h => h.toLowerCase().trim()).filter(Boolean)
    : ['localhost', '127.0.0.1']
  const sitesRaw = Array.isArray(obj.sites) ? obj.sites : []
  const sites: Site[] = []
  for (const row of sitesRaw) {
    const site = normalizeSite(row as Partial<Site>)
    if (site) sites.push(site)
  }
  return {
    version: 1,
    managementHosts: managementHosts.length ? managementHosts : ['localhost', '127.0.0.1'],
    sites,
  }
}

async function seedIfMissing(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true })
  try {
    await copyFile(seedSitesPath, filePath)
  } catch {
    await writeFile(filePath, `${JSON.stringify(emptySitesFile(), null, 2)}\n`, 'utf8')
  }
}

export async function readSitesFile(event?: { context?: unknown }): Promise<SitesFile> {
  const config = useRuntimeConfig(event as never)
  const appConfigAbs = resolveAppConfigDir(String(config.appConfig || '.config'))
  const filePath = sitesFilePath(appConfigAbs)

  if (cache && cachePath === filePath) return cache

  let raw: string
  try {
    raw = await readFile(filePath, 'utf8')
  } catch {
    await seedIfMissing(filePath)
    raw = await readFile(filePath, 'utf8')
  }

  const parsed = normalizeFile(JSON.parse(raw) as unknown)
  cache = parsed
  cachePath = filePath
  return parsed
}

export async function writeSitesFile(data: SitesFile, event?: { context?: unknown }): Promise<SitesFile> {
  const config = useRuntimeConfig(event as never)
  const appConfigAbs = resolveAppConfigDir(String(config.appConfig || '.config'))
  const filePath = sitesFilePath(appConfigAbs)
  await mkdir(dirname(filePath), { recursive: true })

  const normalized = normalizeFile(data)
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tmp, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8')
  await rename(tmp, filePath)

  cache = normalized
  cachePath = filePath
  return normalized
}

export function getAppRoots(event?: { context?: unknown }): { appRootAbs: string, appConfigAbs: string } {
  const config = useRuntimeConfig(event as never)
  return {
    appRootAbs: resolveAppRoot(String(config.appRoot || '.data')),
    appConfigAbs: resolveAppConfigDir(String(config.appConfig || '.config')),
  }
}

export async function createSite(input: SiteInput, event?: { context?: unknown }): Promise<Site> {
  const path = sanitizeSitePath(input.path)
  const hosts = normalizeHosts(input.hosts)
  if (!path || !hosts) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path or hosts' })
  }

  const file = await readSitesFile(event)
  if (file.sites.some(s => s.path === path)) {
    throw createError({ statusCode: 409, statusMessage: 'Site path already exists' })
  }
  for (const host of hosts) {
    if (file.sites.some(s => s.hosts.includes(host))) {
      throw createError({ statusCode: 409, statusMessage: `Host already in use: ${host}` })
    }
  }

  const site: Site = {
    uuid: uuid(),
    path,
    hosts,
    spa: Boolean(input.spa),
    autoSubdomains: input.autoSubdomains !== false,
    enabled: input.enabled !== false,
    engine: input.engine === 'php' ? 'php' : 'static',
  }

  file.sites.push(site)
  await writeSitesFile(file, event)

  const { appRootAbs } = getAppRoots(event)
  await ensureSiteDirs(appRootAbs, site.path, { placeholder: true })

  return site
}

export async function updateSite(
  siteUuid: string,
  input: Partial<SiteInput>,
  event?: { context?: unknown },
): Promise<Site> {
  const file = await readSitesFile(event)
  const idx = file.sites.findIndex(s => s.uuid === siteUuid)
  if (idx < 0) {
    throw createError({ statusCode: 404, statusMessage: 'Site not found' })
  }

  const current = file.sites[idx]!
  const path = input.path !== undefined ? sanitizeSitePath(input.path) : current.path
  const hosts = input.hosts !== undefined ? normalizeHosts(input.hosts) : current.hosts
  if (!path || !hosts) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path or hosts' })
  }

  if (file.sites.some(s => s.uuid !== siteUuid && s.path === path)) {
    throw createError({ statusCode: 409, statusMessage: 'Site path already exists' })
  }
  for (const host of hosts) {
    if (file.sites.some(s => s.uuid !== siteUuid && s.hosts.includes(host))) {
      throw createError({ statusCode: 409, statusMessage: `Host already in use: ${host}` })
    }
  }

  const updated: Site = {
    uuid: current.uuid,
    path,
    hosts,
    spa: input.spa !== undefined ? Boolean(input.spa) : current.spa,
    autoSubdomains: input.autoSubdomains !== undefined ? Boolean(input.autoSubdomains) : current.autoSubdomains,
    enabled: input.enabled !== undefined ? Boolean(input.enabled) : current.enabled,
    engine: input.engine === 'php' ? 'php' : input.engine === 'static' ? 'static' : current.engine,
  }

  file.sites[idx] = updated
  await writeSitesFile(file, event)

  const { appRootAbs } = getAppRoots(event)
  await ensureSiteDirs(appRootAbs, updated.path)

  return updated
}

export async function deleteSite(siteUuid: string, event?: { context?: unknown }): Promise<void> {
  const file = await readSitesFile(event)
  const next = file.sites.filter(s => s.uuid !== siteUuid)
  if (next.length === file.sites.length) {
    throw createError({ statusCode: 404, statusMessage: 'Site not found' })
  }
  file.sites = next
  await writeSitesFile(file, event)
}

export async function getSite(siteUuid: string, event?: { context?: unknown }): Promise<Site> {
  const file = await readSitesFile(event)
  const site = file.sites.find(s => s.uuid === siteUuid)
  if (!site) {
    throw createError({ statusCode: 404, statusMessage: 'Site not found' })
  }
  return site
}
