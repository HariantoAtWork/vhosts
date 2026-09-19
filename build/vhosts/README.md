# vhosts

Nginx-style static virtual hosts with a Nuxt management UI.

## What it does

- Serves files from `appRoot` based on the HTTP `Host` header
- Optional SPA fallback per site
- Auto-maps `{label}.{apex}` → `{path}/subdomains/{label}/public/`
- Management UI + `/api` on `managementHosts` (default `localhost`, `127.0.0.1`)
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

UI on `http://localhost:3000` (Nuxt default). Production / Docker listens on **port 80**.

## Docker

Copy compose examples from the repo root:

```bash
cp docker-compose.yml.example docker-compose.yml
cp docker-compose.override.yml.example docker-compose.override.yml
```

- Publishes `80:80`, `NITRO_PORT=80`
- Volumes: `./data/vhosts` → data, `./config/vhosts` → config
- Override joins external networks `cloudflared` and `dns` so acmedns-stack can use `forwardHost: "vhosts"`

## Point a domain (via acmedns-stack)

1. Put both stacks on the shared `dns` Docker network (or forward to `host.docker.internal:80`).
2. Issue a cert for the apex / wildcard in acmedns-stack.
3. Proxy Host: domains = site hosts; forward `http` → `vhosts:80`; bind certificate; Force SSL as needed.
4. Public DNS to the acmedns edge (`:443`), not directly to this container, when using edge TLS.

No auth on the management UI in this version — keep it on management hosts / private network, or protect at the edge (bearer / access lists).

## Scripts

```bash
bun run dev
bun run build
bun run preview
```
