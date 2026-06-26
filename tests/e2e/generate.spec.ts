import { test, expect } from '@playwright/test'

test('generates a multi-frame animated GIF with the caption', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('name-input').fill('Smith')
  await page.getByTestId('generate-btn').click()

  // Download link appears once baking finishes.
  const download = page.getByTestId('download')
  await expect(download).toBeVisible({ timeout: 45_000 })

  // Filename reflects the name.
  await expect(download).toHaveAttribute('download', 'smithberg.gif')

  // Fetch the generated blob in-page and assert it is a real, multi-frame GIF.
  const result = await page.evaluate(async () => {
    const a = document.querySelector('[data-testid="download"]') as HTMLAnchorElement
    const res = await fetch(a.href)
    const buf = new Uint8Array(await res.arrayBuffer())
    const sig = String.fromCharCode(...buf.slice(0, 6))
    // Count Graphic Control Extension blocks (0x21 0xF9) as a frame proxy.
    let frames = 0
    for (let i = 0; i < buf.length - 1; i++) {
      if (buf[i] === 0x21 && buf[i + 1] === 0xf9) frames++
    }
    return { sig, frames, bytes: buf.length }
  })

  expect(result.sig).toMatch(/^GIF8(7|9)a$/)
  expect(result.bytes).toBeGreaterThan(1000)
  expect(result.frames).toBeGreaterThan(1) // animation preserved
})
