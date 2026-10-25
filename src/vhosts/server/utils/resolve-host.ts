import type { ResolvedVhost, Site, SitesFile } from '#shared/types/site'
import { sitePublicDir, subdomainPublicDir } from './paths'
import { sanitizeHost, sanitizeSubdomainLabel, wildcardHostApex } from './sanitize'
import { ensureSubdomainDirs } from './ensure-dirs'

export function isManagementHost(host: string, file: SitesFile): boolean {
  return file.managementHosts.includes(host)
}

/**
 * `foo.example.com` under apex `example.com` → `foo`.
 * Deeper labels (`a.b.example.com`) are rejected: a single-label wildcard is
 * what `*.example.com` DNS/TLS actually covers, and what `subdomains/<label>`
 * can address.
 */
function subdomainLabelFor(host: string, apex: string): string | null {
  const suffix = `.${apex}`
  if (!host.endsWith(suffix)) return null
  return sanitizeSubdomainLabel(host.slice(0, host.length - suffix.length))
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

  // 1. Exact host wins.
  for (const site of enabled) {
    if (site.hosts.includes(host)) {
      return {
        kind: 'apex',
        site,
        publicRoot: sitePublicDir(appRootAbs, site.path),
      }
    }
  }

  const asSubdomain = async (site: Site, label: string): Promise<ResolvedVhost> => {
    if (options.ensureSubdir) {
      await ensureSubdomainDirs(appRootAbs, site.path, label)
    }
    return {
      kind: 'sub',
      site,
      label,
      publicRoot: subdomainPublicDir(appRootAbs, site.path, label),
    }
  }

  // 2. Explicit `*.example.com` entries, before the blanket autoSubdomains rule.
  for (const site of enabled) {
    for (const entry of site.hosts) {
      const apex = wildcardHostApex(entry)
      if (!apex) continue
      const label = subdomainLabelFor(host, apex)
      if (!label) continue
      return await asSubdomain(site, label)
    }
  }

  // 3. `autoSubdomains`: any `{label}.{apex}` of a plain host entry.
  for (const site of enabled) {
    if (!site.autoSubdomains) continue
    for (const entry of site.hosts) {
      if (wildcardHostApex(entry)) continue
      const label = subdomainLabelFor(host, entry)
      if (!label) continue
      return await asSubdomain(site, label)
    }
  }

  return { kind: 'unknown' }
}
