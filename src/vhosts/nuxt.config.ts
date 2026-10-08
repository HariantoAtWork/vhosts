// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    // Overridable via NUXT_APP_ROOT
    appRoot: '.data',
    // Overridable via NUXT_APP_CONFIG
    appConfig: '.config',
    // Edge default page brand/title (localhost:80); via NUXT_EDGE_TITLE
    edgeTitle: 'vhosts',
  },
})
