# Dinkleberg Maker

Type a name, get a downloadable Dinkleberg meme GIF — `{NAME}BERG...` baked onto
the classic *Fairly OddParents* GIF, entirely in the browser.

## Setup

```bash
npm install
npm run setup   # one-time: fetches the GIF, font, and gif.js worker into public/
npm run dev     # http://localhost:3000
```

## How it works

- `utils/caption.ts` — turns a name into the caption (`Smith` → `SMITHBERG...`).
- `utils/layout.ts` — picks font size / line wrapping to fit the GIF width.
- `utils/gif-baker.ts` — decodes the GIF (`gifuct-js`), draws each frame + caption
  on a canvas, re-encodes (`gif.js`) — all client-side.
- `pages/index.vue` — the UI.

## Tests

```bash
npm test         # unit (Vitest)
npm run test:e2e # browser smoke test (Playwright)
```

## Notes

Source GIF and font are fetched once by `npm run setup` and committed under
`public/`. Override sources with `SOURCE_GIF_URL` / `FONT_URL` env vars.
