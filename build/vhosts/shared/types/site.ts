export type SiteEngine = 'static' | 'php'

export interface Site {
  uuid: string
  path: string
  hosts: string[]
  spa: boolean
  autoSubdomains: boolean
  enabled: boolean
  engine: SiteEngine
}

export interface SitesFile {
  version: 1
  managementHosts: string[]
  sites: Site[]
}

export type SiteInput = {
  path: string
  hosts: string[]
  spa?: boolean
  autoSubdomains?: boolean
  enabled?: boolean
  engine?: SiteEngine
}

export type VhostKind = 'apex' | 'sub' | 'management' | 'unknown'

export interface ResolvedVhost {
  kind: VhostKind
  site?: Site
  publicRoot?: string
  label?: string
}
