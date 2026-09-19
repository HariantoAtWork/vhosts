<script setup lang="ts">
import type { SiteInput } from '#shared/types/site'

const route = useRoute()
const router = useRouter()
const { get, update, remove, ensure, errMessage } = useSites()

const uuid = computed(() => String(route.params.uuid || ''))
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const saving = ref(false)

const site = await get(uuid.value).catch((e: unknown) => {
  error.value = errMessage(e, 'Not found')
  return null
})

const form = ref<SiteInput>({
  path: site?.path || '',
  hosts: site?.hosts ? [...site.hosts] : [],
  spa: site?.spa || false,
  autoSubdomains: site?.autoSubdomains !== false,
  enabled: site?.enabled !== false,
  engine: site?.engine || 'static',
})

async function onSubmit() {
  if (!site) return
  error.value = null
  notice.value = null
  saving.value = true
  try {
    const updated = await update(site.uuid, form.value)
    form.value = {
      path: updated.path,
      hosts: [...updated.hosts],
      spa: updated.spa,
      autoSubdomains: updated.autoSubdomains,
      enabled: updated.enabled,
      engine: updated.engine,
    }
    notice.value = 'Saved.'
  } catch (e: unknown) {
    error.value = errMessage(e, 'Save failed')
  } finally {
    saving.value = false
  }
}

async function onEnsure() {
  if (!site) return
  error.value = null
  notice.value = null
  try {
    await ensure(site.uuid)
    notice.value = 'Folders ensured.'
  } catch (e: unknown) {
    error.value = errMessage(e, 'Ensure failed')
  }
}

async function onDelete() {
  if (!site) return
  if (!confirm('Remove this site from config? Files on disk are kept.')) return
  try {
    await remove(site.uuid)
    await router.push('/')
  } catch (e: unknown) {
    error.value = errMessage(e, 'Delete failed')
  }
}
</script>

<template>
  <div>
    <h1>Edit site</h1>
    <p v-if="site" class="lede">
      uuid <code>{{ site.uuid }}</code>
      · disk <code>{{ form.path }}/public</code>
      · subdomains <code>{{ form.path }}/subdomains/{label}/public</code>
    </p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="notice" class="badge">{{ notice }}</p>

    <SitesSiteForm
      v-if="site"
      v-model="form"
      :submit-label="saving ? 'Saving…' : 'Save'"
      @submit="onSubmit"
    >
      <template #actions>
        <button type="button" @click="onEnsure">
          Ensure folders
        </button>
        <button type="button" class="danger" @click="onDelete">
          Delete
        </button>
      </template>
    </SitesSiteForm>
  </div>
</template>
