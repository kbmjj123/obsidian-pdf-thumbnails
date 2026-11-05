# PDF Thumbnails

> Full online PDF toolkit: https://minopdf.com

Render `![[file.pdf]]` embeds in Obsidian as a **lazy page-thumbnail grid** with an **in-note lightbox**. Powered by pdf.js via `@kbmjj123/pdf-thumbnails-core`.

## Features

- **Reading-view auto-render**: `![[file.pdf]]` embeds become a paginated thumbnail grid; click any page to open it in a lightbox.
- **In-note lightbox**: prev/next navigation, Esc or click-outside to close — no need to open the PDF separately.
- **Lazy rendering**: only visible pages are decoded; large PDFs stay smooth while scrolling.
- **4 settings**: toggle the override, grid columns, thumbnail width, and initial page count.
- **Fully local**: PDF decoding runs inside your vault. No telemetry, no accounts, no cloud sync.
- **zh / en i18n**: the UI follows your Obsidian interface language.

## Example

Drop a PDF into your vault and embed it in a note:

```markdown
![[report.pdf]]
```

In reading view the embed is replaced by a thumbnail grid; click a page to zoom into the lightbox.

## Screenshots

> Place images in `assets/screenshots/` using the exact filenames below (broken images before they are added are expected placeholders).

<p align="center">
  <img src="assets/screenshots/grid.png" width="360" alt="Thumbnail grid in reading view"/>
  <img src="assets/screenshots/lightbox.png" width="360" alt="In-note lightbox"/>
</p>
<p align="center">
  <img src="assets/screenshots/settings.png" width="360" alt="Settings tab"/>
</p>

## Settings

The settings tab offers 4 options:

1. Override PDF embeds — on by default; off restores the native viewer.
2. Columns — number of thumbnail columns in the grid.
3. Thumbnail width — width of each thumbnail in pixels.
4. Initial pages — pages rendered on first load; the rest lazy-load on scroll.

## Privacy

All PDF decoding happens locally inside your vault — no telemetry, no accounts, no cloud sync.

One exception: the **pdf.js decode worker** is loaded from jsDelivr (a public CDN) on first use, so the very first render needs network access. Nothing is uploaded — only the local file is decoded.

## Install

### From the community store (recommended)

1. Settings → Community plugins → Browse, search for **PDF Thumbnails**
2. Install and enable

### Manual / BRAT

Download `main.js`, `manifest.json`, `styles.css` from the GitHub Release into `<vault>/.obsidian/plugins/pdf-thumbnails/`.

To beta-test via BRAT, add the repository `kbmjj123/obsidian-pdf-thumbnails`.

## Support

If this tool helps you, you can buy me a coffee on Ko-fi: https://ko-fi.com/kbmjj123

## License

MIT
