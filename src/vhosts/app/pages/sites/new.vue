<script setup lang="ts">
import type { SiteInput } from '#shared/types/site'

const { create, errMessage } = useSites()
const router = useRouter()
const error = ref<string | null>(null)
const saving = ref(false)

const form = ref<SiteInput>({
  path: '',
  hosts: [],
  spa: false,
  autoSubdomains: true,
  enabled: true,
  engine: 'static',
})

async function onSubmit() {
  error.value = null
  saving.value = true
  try {
    const site = await create(form.value)
    await router.push(`/sites/${site.uuid}`)
  } catch (e: unknown) {
    error.value = errMessage(e, 'Create failed')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h1>New site</h1>
    <p class="lede">Creates config entry (uuid v7) and <code>{path}/public</code> folders.</p>
    <p v-if="error" class="error">{{ error }}</p>
    <SitesSiteForm
      v-model="form"
      :submit-label="saving ? 'Creating…' : 'Create site'"
      @submit="onSubmit"
    />
  </div>
</template>
