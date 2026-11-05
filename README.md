# PDF Thumbnails (Obsidian)

Render `![[file.pdf]]` embeds as a **lazy page-thumbnail grid** with an **in-note lightbox**.
Powered by [pdf.js](https://pdfjs.jsdelivr.net) via `@kbmjj123/pdf-thumbnails-core`.

> Note: during development the plugin links the core package through a local
> `file:` dependency (see `package.json`). Before an official release that
> dependency is switched to the published `^0.1.1` registry version — see the
> note in `.github/workflows/release.yml`.

## Features
- Overrides native PDF embeds in reading view with a virtualized thumbnail grid.
- Click a page to zoom in a lightbox (prev/next, Esc / click-outside to close).
- Lazily renders only visible pages — large PDFs stay smooth.
- Settings: toggle override, columns, thumbnail width, initial pages.
- zh / en i18n.

## Install
- BRAT: add `kbmjj123/obsidian-pdf-thumbnails` (repo id `pdf-thumbnails`).
- Or manually: copy `main.js`, `manifest.json`, `styles.css` into `PDF Thumbnails/`.

## Settings
- **Override PDF embeds**: on by default; off restores the native viewer.
- **Columns / Thumbnail width / Initial pages**: grid layout.

## Notes / limits
- All PDF decoding is local. The pdf.js decode worker is loaded from jsDelivr (needs network on first load).
- Overriding is done through Obsidian's public markdown post-processor API. If resolving or building the preview fails for an embed, the native embed is left intact automatically.
- The plugin targets Obsidian reading view; it does not change the default PDF viewer used for opening files directly.

## Development
```bash
pnpm install      # installs deps (local core via file: during dev)
pnpm dev          # watch build main.js
pnpm test         # vitest unit tests (jsdom + obsidian mock)
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm build        # production build -> main.js
```
