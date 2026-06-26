<script setup lang="ts">
import { toCaption } from '~/utils/caption'
import { bakeGif } from '~/utils/gif-baker'

const name = ref('')
const error = ref('')
const busy = ref(false)
const previewUrl = ref('/dinkleberg.gif')
const downloadUrl = ref('')
const downloadName = ref('dinkleberg.gif')

let sourceBytes: ArrayBuffer | null = null

onMounted(async () => {
  try {
    const res = await fetch('/dinkleberg.gif')
    if (!res.ok) throw new Error(`asset ${res.status}`)
    sourceBytes = await res.arrayBuffer()
  } catch {
    error.value = 'Dinkleberg asset missing — run `npm run setup`.'
  }
})

async function generate() {
  error.value = ''
  let caption: string
  try {
    caption = toCaption(name.value)
  } catch {
    error.value = 'Please enter a name.'
    return
  }
  if (!sourceBytes) {
    error.value = 'Dinkleberg asset not loaded yet.'
    return
  }
  busy.value = true
  try {
    const blob = await bakeGif(sourceBytes.slice(0), caption)
    if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
    const url = URL.createObjectURL(blob)
    previewUrl.value = url
    downloadUrl.value = url
    downloadName.value = `${name.value.trim().toLowerCase()}berg.gif`
  } catch (e) {
    console.error(e)
    error.value = 'Something went wrong generating the GIF.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="wrap">
    <h1>Dinkleberg Maker</h1>
    <p class="sub">Type a name. Get a Dinkleberg.</p>

    <form class="controls" @submit.prevent="generate">
      <input
        v-model="name"
        data-testid="name-input"
        placeholder="e.g. Smith"
        :disabled="busy"
        aria-label="Name"
      />
      <button data-testid="generate-btn" type="submit" :disabled="busy">
        {{ busy ? 'Generating…' : 'Generate' }}
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <img data-testid="preview" class="preview" :src="previewUrl" alt="Dinkleberg meme preview" />

    <a
      v-if="downloadUrl"
      data-testid="download"
      class="download"
      :href="downloadUrl"
      :download="downloadName"
    >Download GIF</a>
  </main>
</template>

<style scoped>
.wrap { max-width: 640px; margin: 0 auto; padding: 2rem 1rem; text-align: center; }
h1 { font-family: 'Anton', system-ui, sans-serif; font-size: 3rem; margin: 0; }
.sub { opacity: 0.7; margin-top: 0.25rem; }
.controls { display: flex; gap: 0.5rem; justify-content: center; margin: 1.5rem 0; }
input { flex: 1; max-width: 320px; padding: 0.6rem 0.8rem; font-size: 1rem; }
button { padding: 0.6rem 1.2rem; font-size: 1rem; cursor: pointer; }
button:disabled { cursor: progress; opacity: 0.6; }
.error { color: #c0392b; font-weight: 600; }
.preview { max-width: 100%; border-radius: 8px; margin-top: 0.5rem; }
.download {
  display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem;
  background: #2d8a4e; color: white; text-decoration: none; border-radius: 6px;
}
</style>
