import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { sendStream, setHeader, setResponseStatus } from 'h3'
import type { H3Event } from 'h3'
import { safeJoinUnder } from './paths'

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf',
}

const ASSET_EXT = new Set(Object.keys(MIME).filter(e => e !== '.html' && e !== '.htm'))

function mimeFor(filePath: string): string {
  return MIME[extname(filePath).toLowerCase()] || 'application/octet-stream'
}

function isAssetPath(urlPath: string): boolean {
  const ext = extname(urlPath).toLowerCase()
  return Boolean(ext) && ASSET_EXT.has(ext)
}

export async function serveStaticFromRoot(
  event: H3Event,
  publicRoot: string,
  urlPath: string,
  spa: boolean,
): Promise<string | undefined> {
  let decoded: string
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0] || '/')
  } catch {
    setResponseStatus(event, 400)
    return 'Bad request'
  }

  if (!decoded.startsWith('/')) decoded = `/${decoded}`
  const relative = decoded.replace(/^\/+/, '')

  let filePath = safeJoinUnder(publicRoot, relative || '.')
  if (!filePath) {
    setResponseStatus(event, 400)
    return 'Bad request'
  }

  try {
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = join(filePath, 'index.html')
    } else if (decoded.endsWith('/') || relative === '') {
      const idx = safeJoinUnder(publicRoot, relative, 'index.html')
        || safeJoinUnder(publicRoot, 'index.html')
      if (idx) filePath = idx
    }
  } catch {
    setResponseStatus(event, 404)
    return 'Not found'
  }

  if (filePath && existsSync(filePath) && statSync(filePath).isFile()) {
    setHeader(event, 'Content-Type', mimeFor(filePath))
    setHeader(event, 'X-Content-Type-Options', 'nosniff')
    await sendStream(event, createReadStream(filePath))
    return undefined
  }

  if (spa && !isAssetPath(decoded)) {
    const indexPath = safeJoinUnder(publicRoot, 'index.html')
    if (indexPath && existsSync(indexPath) && statSync(indexPath).isFile()) {
      setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
      setHeader(event, 'X-Content-Type-Options', 'nosniff')
      await sendStream(event, createReadStream(indexPath))
      return undefined
    }
  }

  setResponseStatus(event, 404)
  return 'Not found'
}
