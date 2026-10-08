import { createServer } from 'node:http'
import { toNodeListener } from 'h3'
import { controlPort, controlTlsPort, edgePort } from '../utils/listen'

/**
 * Nitro already binds NITRO_PORT (edge :80).
 * Open a second HTTP listener for the management UI (:1080).
 * HTTPS control (:1443) is reserved for later — env is validated only.
 */
export default defineNitroPlugin((nitroApp) => {
  if (import.meta.prerender) return

  const host = process.env.NITRO_HOST || process.env.HOST || '0.0.0.0'
  const edge = edgePort()
  const control = controlPort()
  const controlTls = controlTlsPort()

  if (control === edge) {
    console.warn(`[vhosts] VHOSTS_CONTROL_PORT ${control} equals edge port — UI shares the edge listener`)
    return
  }
  if (controlTls === edge || controlTls === control) {
    console.warn(
      `[vhosts] VHOSTS_CONTROL_TLS_PORT ${controlTls} collides with another port (HTTPS control not started yet)`,
    )
  }

  const h3App = nitroApp.h3App
  if (!h3App) {
    console.error('[vhosts] nitroApp.h3App missing — control listener not started')
    return
  }

  const server = createServer(toNodeListener(h3App))
  server.listen(control, host, () => {
    console.log(`[vhosts] Control HTTP on http://${host}:${control}`)
  })
  server.on('error', (err) => {
    console.error(`[vhosts] Control HTTP listen failed on ${host}:${control}`, err)
  })

  console.log(`[vhosts] Edge HTTP on port ${edge} (NITRO_PORT); control TLS reserved :${controlTls}`)
})
