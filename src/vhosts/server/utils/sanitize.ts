const HOST_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/
const PATH_RE = /^[a-z0-9][a-z0-9._-]*$/i
const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i

export function sanitizeHost(raw: string | undefined | null): string | null {
  if (!raw) return null
  let host = String(raw).trim().toLowerCase()
  if (host.startsWith('[') && host.includes(']')) {
    // Strip IPv6 brackets + optional port: [::1]:80
    const end = host.indexOf(']')
    host = host.slice(1, end)
  } else {
    const colon = host.lastIndexOf(':')
    if (colon > 0 && host.indexOf(':') === colon) {
      host = host.slice(0, colon)
    }
  }
  if (!host || host.length > 253) return null
  if (host.includes('..') || host.includes('/') || host.includes('\\') || host.includes(' ')) {
    return null
  }
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return host
  if (!HOST_RE.test(host)) return null
  return host
}

export function sanitizeSitePath(raw: string | undefined | null): string | null {
  if (!raw) return null
  const path = String(raw).trim()
  if (!path || path.includes('/') || path.includes('\\') || path.includes('..')) return null
  if (!PATH_RE.test(path)) return null
  return path
}

export function sanitizeSubdomainLabel(raw: string | undefined | null): string | null {
  if (!raw) return null
  const label = String(raw).trim().toLowerCase()
  if (!label || label.includes('.') || !LABEL_RE.test(label)) return null
  return label
}

export function normalizeHosts(hosts: unknown): string[] | null {
  if (!Array.isArray(hosts)) return null
  const out: string[] = []
  const seen = new Set<string>()
  for (const item of hosts) {
    const host = sanitizeHost(String(item))
    if (!host) return null
    if (seen.has(host)) continue
    seen.add(host)
    out.push(host)
  }
  if (out.length === 0) return null
  return out
}
