# SigmaCX site

A plain Vite + React site. No server runtime required — `npm run build` outputs
static files in `dist/` that can be deployed to any static host.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

## Included Shape

- `index.html` is the page entry point
- `src/main.tsx` mounts the app
- `src/SigmaExperience.tsx` is the site content and animations
- `src/globals.css` is global styling (Tailwind + custom CSS)
- static assets live in `public/`

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: build static output into `dist/`
- `npm run preview`: preview the production build locally
- `npm run lint`: run ESLint

## Deploying

`npm run build` produces `dist/` — a folder of plain HTML/CSS/JS/media files.
Upload it as-is to any static host (shared hosting via FTP, Netlify, Cloudflare
Pages, S3, etc.). No Node.js server is needed to serve it.
