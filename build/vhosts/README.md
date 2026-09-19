# vhosts

Nginx-style static virtual hosts with a Nuxt management UI.

## Ports (same idea as acmedns-stack)

| Port | Role | Env |
| --- | --- | --- |
| **80** | Edge — static sites by `Host` | `NITRO_PORT` |
| **1080** | Control — management UI + `/api` | `VHOSTS_CONTROL_PORT` |
| **1443** | Control HTTPS (reserved, not bound yet) | `VHOSTS_CONTROL_TLS_PORT` |

Public domains → edge `:80`. Operator UI → `:1080` (do not share edge with the dashboard).

## What it does

- Serves files from `appRoot` based on the HTTP `Host` header (edge only)
- Optional SPA fallback per site
- Auto-maps `{label}.{apex}` → `{path}/subdomains/{label}/public/`
- TLS/DNS stay outside — typically [acmedns-stack](../../acmedns-stack) Proxy Hosts → `http://vhosts:80`

## Layout

**Data** (`NUXT_APP_ROOT`, default `.data`):

```
mdstn.com/
  public/
  subdomains/
    sub1/public/
harianto.dev/
  public/
```

**Config** (`NUXT_APP_CONFIG`, default `.config`): `sites.json`

```json
{
  "version": 1,
  "managementHosts": ["localhost", "127.0.0.1"],
  "sites": [
    {
      "uuid": "…",
      "path": "mdstn.com",
      "hosts": ["mdstn.com", "otherhost.com"],
      "spa": false,
      "autoSubdomains": true,
      "enabled": true,
      "engine": "static"
    }
  ]
}
```

Every site list item uses field `uuid` (UUID v7). `engine: "php"` is reserved for later.

## Local development

```bash
bun install
bun run dev
```

- Management UI: `http://localhost:1080`
- Edge / static smoke tests: Nuxt’s `:3000` with `Host:` headers (static only; UI is not on the edge)

## Docker

```bash
cp docker-compose.yml.example docker-compose.yml
cp docker-compose.override.yml.example docker-compose.override.yml
```

- Publishes `80:80` and `1080:1080`
- Volumes: `./data/vhosts` → data, `./config/vhosts` → config
- Override joins external networks `cloudflared` and `dns` so acmedns-stack can use `forwardHost: "vhosts"`

## Point a domain (via acmedns-stack)

1. Put both stacks on the shared `dns` Docker network (or forward to `host.docker.internal:80`).
2. Issue a cert for the apex / wildcard in acmedns-stack.
3. Proxy Host: domains = site hosts; forward `http` → `vhosts:80`; bind certificate; Force SSL as needed.
4. Public DNS to the acmedns edge (`:443`), not directly to this container, when using edge TLS.
5. Open the vhosts UI at `http://<host>:1080` (or tunnel to `:1080` only for operators).

No auth on the management UI in this version — keep `:1080` private, or protect at the edge (bearer / access lists).

## Scripts

```bash
bun run dev
bun run build
bun run preview
```
