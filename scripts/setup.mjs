import { writeFile, mkdir, copyFile, access } from 'node:fs/promises'
import { dirname } from 'node:path'

const SOURCE_GIF_URL =
  process.env.SOURCE_GIF_URL ||
  'https://media1.tenor.com/m/CHW07v-9jvwAAAAd/fairlyoddparents-dinkleberg.gif'
const FONT_URL =
  process.env.FONT_URL ||
  'https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf'

const targets = [
  { url: SOURCE_GIF_URL, out: 'public/dinkleberg.gif', expect: 'image/gif' },
  { url: FONT_URL, out: 'public/fonts/Anton-Regular.ttf' },
]

async function download({ url, out, expect }) {
  process.stdout.write(`Fetching ${url}\n`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const type = res.headers.get('content-type') || ''
  if (expect && !type.includes('gif') && !type.includes('octet-stream')) {
    throw new Error(`Unexpected content-type "${type}" for ${url}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 1000) throw new Error(`Suspiciously small download (${buf.length} bytes) for ${url}`)
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, buf)
  process.stdout.write(`  -> wrote ${out} (${buf.length} bytes)\n`)
}

async function copyWorker() {
  const src = 'node_modules/gif.js/dist/gif.worker.js'
  const out = 'public/vendor/gif.worker.js'
  await access(src)
  await mkdir(dirname(out), { recursive: true })
  await copyFile(src, out)
  process.stdout.write(`  -> copied gif.worker.js to ${out}\n`)
}

for (const t of targets) await download(t)
await copyWorker()
process.stdout.write('Setup complete.\n')
