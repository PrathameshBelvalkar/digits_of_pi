# Find Your Number in π

Search a 3–8 digit number and watch the canvas fly to its first appearance in π.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind v4 + shadcn/ui
- Canvas concentric-ring visualization
- Local lookup in the browser, with optional deep search via independent third-party services

## Scripts

```bash
npm run dev
npm run build
npm run generate-lookup
npm run test:lookup
```

## Privacy

The first 1,000,000 digits (`public/pi-digits.txt`) are searched in the browser. If a 5–8 digit query is not found locally, the app may call `POST /api/pi-search`, which looks up independent third-party π search services (angio.net, then PiSearch). Digits of π is not affiliated with those projects. See `/privacy` and `/terms` on the site for details.

## SEO

Set `NEXT_PUBLIC_SITE_URL` to your production origin (see `.env.example`).
