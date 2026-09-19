import { isAbsolute, join, normalize, relative, resolve, sep } from 'node:path'

export function resolveAppRoot(appRoot: string): string {
  return isAbsolute(appRoot) ? normalize(appRoot) : resolve(process.cwd(), appRoot)
}

export function resolveAppConfigDir(appConfig: string): string {
  return isAbsolute(appConfig) ? normalize(appConfig) : resolve(process.cwd(), appConfig)
}

export function siteBaseDir(appRootAbs: string, sitePath: string): string {
  return join(appRootAbs, sitePath)
}

export function sitePublicDir(appRootAbs: string, sitePath: string): string {
  return join(appRootAbs, sitePath, 'public')
}

export function siteSubdomainsDir(appRootAbs: string, sitePath: string): string {
  return join(appRootAbs, sitePath, 'subdomains')
}

export function subdomainPublicDir(appRootAbs: string, sitePath: string, label: string): string {
  return join(appRootAbs, sitePath, 'subdomains', label, 'public')
}

/** Ensure candidate resolves inside root; returns absolute path or null. */
export function safeJoinUnder(rootAbs: string, ...parts: string[]): string | null {
  const root = resolve(rootAbs)
  const candidate = resolve(root, ...parts)
  const rel = relative(root, candidate)
  if (rel.startsWith('..') || isAbsolute(rel)) return null
  // Windows edge: relative can be empty for same path
  if (rel.includes(`..${sep}`)) return null
  return candidate
}
