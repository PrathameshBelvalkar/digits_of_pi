# Find Your Number in π

Search a 3–8 digit number and watch the canvas fly to its first appearance in π.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind v4 + shadcn/ui
- Canvas concentric-ring visualization
- Client-only lookup (no search API)

## Scripts

```bash
npm run dev
npm run build
npm run generate-lookup
npm run test:lookup
```

## Privacy

Lookup runs entirely in the browser against `public/pi-digits.txt` (1,000,000 digits). No network request is made when you search.
