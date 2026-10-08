/** Shared edge/default HTML theme (matches management UI on :1080). */
const THEME_CSS = `
:root {
  --bg: #f6f4ef;
  --ink: #1c1917;
  --muted: #78716c;
  --line: #e7e5e4;
  --accent: #0f766e;
  --card: #fffcf7;
  --font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, monospace;
}
* { box-sizing: border-box; }
html, body { min-height: 100%; }
body {
  margin: 0;
  font-family: var(--font);
  background-color: var(--bg);
  background-image:
    radial-gradient(ellipse 1200px 500px at 10% -10%, #b8ebe3 0%, transparent 55%),
    radial-gradient(ellipse 900px 400px at 100% 0%, #f0d4b0 0%, transparent 50%);
  background-attachment: fixed;
  color: var(--ink);
}
.shell { max-width: 640px; margin: 0 auto; padding: 1.5rem; }
.top {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--line);
}
.brand {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--ink);
}
h1 {
  font-size: 1.75rem;
  margin: 0 0 0.35rem;
  letter-spacing: -0.02em;
}
.lede {
  color: var(--muted);
  margin: 0 0 1.5rem;
  line-height: 1.5;
}
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1.25rem;
}
.card p { margin: 0; line-height: 1.55; color: var(--ink); }
code {
  font-family: var(--mono);
  font-size: 0.85em;
  background: #fff;
  border: 1px solid var(--line);
  padding: 0.1em 0.4em;
  border-radius: 4px;
}
`.trim()

export function renderThemePage(options: {
  title: string
  brand?: string
  heading: string
  lede: string
  bodyHtml: string
}): string {
  const { title, heading, lede, bodyHtml } = options
  const brand = options.brand ?? title
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${THEME_CSS}</style>
</head>
<body>
  <div class="shell">
    <header class="top">
      <div class="brand">${escapeHtml(brand)}</div>
    </header>
    <h1>${escapeHtml(heading)}</h1>
    <p class="lede">${lede}</p>
    <div class="card">
      ${bodyHtml}
    </div>
  </div>
</body>
</html>
`
}

/** Resolve optional edge default-page title (NUXT_EDGE_TITLE). */
export function resolveEdgeTitle(raw: unknown): string {
  if (typeof raw !== 'string') return 'vhosts'
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : 'vhosts'
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** Default site `public/index.html` when a new site is created. */
export const SITE_PLACEHOLDER_HTML = renderThemePage({
  title: 'vhosts',
  heading: 'Site ready',
  lede: 'This host is mapped. Replace the files in <code>public/</code> with your site.',
  bodyHtml: `<p>
        Drop your static build into this folder (or add an <code>index.html</code>)
        and it will be served for this Host header on the edge port.
      </p>`,
})

export function edgeManagementHtml(controlPort: number, edgeTitle = 'vhosts'): string {
  return renderThemePage({
    title: edgeTitle,
    brand: edgeTitle,
    heading: 'Management UI',
    lede: `This edge listener serves static sites only.`,
    bodyHtml: `<p>
        Open the control UI on port <code>${controlPort}</code>
        (for example <code>http://localhost:${controlPort}</code>).
      </p>`,
  })
}

export function edgeUnknownHostHtml(edgeTitle = 'vhosts'): string {
  return renderThemePage({
    title: edgeTitle,
    brand: edgeTitle,
    heading: 'Unknown host',
    lede: 'No site is mapped to this Host header.',
    bodyHtml: `<p>
        Add a site in the management UI, or check that the request
        <code>Host</code> matches a configured domain.
      </p>`,
  })
}
