<script setup lang="ts">
const { list, pending, error } = useSites()
const data = ref(await list().catch(() => null))

async function refresh() {
  data.value = await list()
}
</script>

<template>
  <div>
    <h1>Sites</h1>
    <p class="lede">
      Host-header static vhosts. Point domains here via acmedns-stack Proxy Hosts
      (<code>http://vhosts:80</code>).
    </p>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="pending && !data">Loading…</p>

    <SitesSiteList v-if="data" :sites="data.sites" />

    <p v-if="data" class="lede" style="margin-top: 1.5rem;">
      Config: <code>{{ data.roots.appConfigAbs }}</code><br>
      Data: <code>{{ data.roots.appRootAbs }}</code>
      <button type="button" style="margin-left: 0.75rem;" :disabled="pending" @click="refresh">
        Refresh
      </button>
    </p>
  </div>
</template>
