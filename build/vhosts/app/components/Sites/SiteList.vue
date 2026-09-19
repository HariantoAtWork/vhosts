<script setup lang="ts">
import type { Site } from '#shared/types/site'

defineProps<{
  sites: Site[]
}>()
</script>

<template>
  <div v-if="!sites.length" class="empty">
    No sites yet. <NuxtLink to="/sites/new">Create one</NuxtLink>.
  </div>
  <div v-else class="card" style="padding: 0; overflow: auto;">
    <table>
      <thead>
        <tr>
          <th>Hosts</th>
          <th>Path</th>
          <th>Flags</th>
          <th>uuid</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="site in sites" :key="site.uuid">
          <td>
            <NuxtLink :to="`/sites/${site.uuid}`">
              {{ site.hosts.join(', ') }}
            </NuxtLink>
          </td>
          <td><code>{{ site.path }}</code></td>
          <td>
            <span class="badge" :class="{ off: !site.enabled }">
              {{ site.enabled ? 'on' : 'off' }}
            </span>
            <span v-if="site.spa" class="badge">spa</span>
            <span v-if="site.autoSubdomains" class="badge">subs</span>
          </td>
          <td><code class="mono">{{ site.uuid }}</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
