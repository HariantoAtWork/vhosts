import type { ResolvedVhost, SitesFile } from '#shared/types/site'
import { sitePublicDir, subdomainPublicDir } from './paths'
import { sanitizeHost, sanitizeSubdomainLabel } from './sanitize'
import { ensureSubdomainDirs } from './ensure-dirs'

export function isManagementHost(host: string, file: SitesFile): boolean {
  return file.managementHosts.includes(host)
}

export async function resolveVhost(
  rawHost: string | undefined,
  file: SitesFile,
  appRootAbs: string,
  options: { ensureSubdir?: boolean } = {},
): Promise<ResolvedVhost> {
  const host = sanitizeHost(rawHost)
  if (!host) {
    return { kind: 'unknown' }
  }

  if (isManagementHost(host, file)) {
    return { kind: 'management' }
  }

  const enabled = file.sites.filter(s => s.enabled)

  for (const site of enabled) {
    if (site.hosts.includes(host)) {
      return {
        kind: 'apex',
        site,
        publicRoot: sitePublicDir(appRootAbs, site.path),
      }
    }
  }

  for (const site of enabled) {
    if (!site.autoSubdomains) continue
    for (const apex of site.hosts) {
      const suffix = `.${apex}`
      if (!host.endsWith(suffix)) continue
      const label = host.slice(0, host.length - suffix.length)
      const safeLabel = sanitizeSubdomainLabel(label)
      if (!safeLabel) continue

      if (options.ensureSubdir) {
        await ensureSubdomainDirs(appRootAbs, site.path, safeLabel)
      }

      return {
        kind: 'sub',
        site,
        label: safeLabel,
        publicRoot: subdomainPublicDir(appRootAbs, site.path, safeLabel),
      }
    }
  }

  return { kind: 'unknown' }
}
