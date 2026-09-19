<script setup lang="ts">
import type { SiteInput } from '#shared/types/site'

const props = defineProps<{
  modelValue: SiteInput
  submitLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [SiteInput]
  submit: []
}>()

const hostsText = computed({
  get: () => props.modelValue.hosts.join('\n'),
  set: (value: string) => {
    const hosts = value
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean)
    emit('update:modelValue', { ...props.modelValue, hosts })
  },
})

function patch<K extends keyof SiteInput>(key: K, value: SiteInput[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <form class="card" @submit.prevent="emit('submit')">
    <label for="path">Path (folder under appRoot)</label>
    <input
      id="path"
      type="text"
      required
      :value="modelValue.path"
      placeholder="mdstn.com"
      @input="patch('path', ($event.target as HTMLInputElement).value)"
    >

    <label for="hosts">Hosts (one per line)</label>
    <textarea
      id="hosts"
      v-model="hostsText"
      rows="4"
      required
      placeholder="mdstn.com&#10;otherhost.com"
    />

    <div class="checks">
      <label>
        <input
          type="checkbox"
          :checked="modelValue.spa"
          @change="patch('spa', ($event.target as HTMLInputElement).checked)"
        >
        SPA fallback
      </label>
      <label>
        <input
          type="checkbox"
          :checked="modelValue.autoSubdomains !== false"
          @change="patch('autoSubdomains', ($event.target as HTMLInputElement).checked)"
        >
        Auto subdomains
      </label>
      <label>
        <input
          type="checkbox"
          :checked="modelValue.enabled !== false"
          @change="patch('enabled', ($event.target as HTMLInputElement).checked)"
        >
        Enabled
      </label>
    </div>

    <div class="row-actions">
      <button type="submit" class="primary">
        {{ submitLabel || 'Save' }}
      </button>
      <slot name="actions" />
    </div>
  </form>
</template>
