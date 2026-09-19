function parsePort(value: string | undefined, fallback: string): number {
  const raw = value ?? fallback
  const port = Number(raw)
  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    throw new Error(`invalid listen port: ${raw}`)
  }
  return port
}

/** Edge (static sites) listen port — NITRO_PORT / PORT, default 80. */
export function edgePort(): number {
  return parsePort(process.env.NITRO_PORT || process.env.PORT, '80')
}

/** Control (management UI + /api) HTTP port — default 1080. */
export function controlPort(): number {
  return parsePort(process.env.VHOSTS_CONTROL_PORT, '1080')
}

/** Reserved for future control HTTPS — default 1443. */
export function controlTlsPort(): number {
  return parsePort(process.env.VHOSTS_CONTROL_TLS_PORT, '1443')
}

export type ListenerRole = 'edge' | 'control'

export function listenerRole(event: { node?: { req?: { socket?: { localPort?: number } } } }): ListenerRole {
  const local = event.node?.req?.socket?.localPort
  if (local != null && local === controlPort()) return 'control'
  return 'edge'
}

export function isControlListener(event: { node?: { req?: { socket?: { localPort?: number } } } }): boolean {
  return listenerRole(event) === 'control'
}
