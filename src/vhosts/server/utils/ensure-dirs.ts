import { access, constants, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  siteBaseDir,
  sitePublicDir,
  siteSubdomainsDir,
  subdomainPublicDir,
} from './paths'
import { SITE_PLACEHOLDER_HTML } from './theme-page'

async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true })
}

async function ensurePlaceholder(publicDir: string): Promise<void> {
  await ensureDir(publicDir)
  const indexPath = join(publicDir, 'index.html')
  try {
    await access(indexPath, constants.F_OK)
    return
  } catch {
    // create
  }
  await writeFile(indexPath, SITE_PLACEHOLDER_HTML, 'utf8')
}

/** Create apex public/ + subdomains/ (and optional placeholder index). */
export async function ensureSiteDirs(
  appRootAbs: string,
  sitePath: string,
  options: { placeholder?: boolean } = {},
): Promise<void> {
  const base = siteBaseDir(appRootAbs, sitePath)
  const pub = sitePublicDir(appRootAbs, sitePath)
  const subs = siteSubdomainsDir(appRootAbs, sitePath)
  await ensureDir(base)
  await ensureDir(pub)
  await ensureDir(subs)
  if (options.placeholder) {
    await ensurePlaceholder(pub)
  }
}

export async function ensureSubdomainDirs(
  appRootAbs: string,
  sitePath: string,
  label: string,
  options: { placeholder?: boolean } = {},
): Promise<string> {
  const pub = subdomainPublicDir(appRootAbs, sitePath, label)
  await ensureDir(pub)
  if (options.placeholder) {
    await ensurePlaceholder(pub)
  }
  return pub
}
