# Wellage Praana — Landing Page

Static HTML + Sass landing page for **Wellage Praana by Varma** (Nedumbassery, near CIAL).
Built to the *HTML Phase – Master Development & QA Checklist* (see `QA-CHECKLIST.md`).

## Run / build

```bash
npm install        # installs sass (only dev dependency)
npm run build      # scss -> css/main.css + css/main.min.css, js/* -> js/bundle.js, tools/src/index.src.html -> index.html
npm run serve      # http://localhost:4173 (sends the 4 security headers, for local verification)
```

> **Primary page:** `index.html` is now the former "version 2" (hand-edited; `v2.html` redirects to it). The earlier design is kept as `v1.html`. The build note below describes the old generated page and no longer applies to `index.html`.
>
> `index.html` was generated: edit `tools/src/index.src.html` (it contains `{{img …}}` / `{{gal …}}`
> tokens that expand to responsive `srcset` markup), then run `npm run build`.

## Structure

```
index.html                  built page (privacy-policy.html, terms.html are static)
assets/{images,fonts,icons,videos,documents}
scss/{abstracts,base,components,layout,pages,vendors} + main.scss
css/main.css, main.min.css  compiled output (the HTML loads main.min.css)
js/config.js                integration settings (brochure, form endpoint, phone)
js/components/*.js, main.js concatenated into js/bundle.js
tools/                      build.mjs, serve.mjs, src/index.src.html
deploy/                     security headers (Apache + nginx)
robots.txt                  STAGING: Disallow all
```

## Integration points (nothing is faked)

| Item | Where | Status |
| --- | --- | --- |
| Lead / visit form backend | `js/config.js` → `formEndpoint` | **Not connected.** Forms validate, then show an honest "not sent yet" state with WhatsApp / call fallbacks. Set the endpoint (JSON POST, 2xx = success) and add its origin to CSP `connect-src`. |
| Brochure PDF | `js/config.js` → `brochureUrl` | **No brochure supplied.** CTAs scroll to the enquiry form with a pre-filled "send me the brochure" message. Drop the PDF in `assets/documents/` and set the path. |
| Floor-plan drawings | `#plans-dialog` in `tools/src/index.src.html` | **No drawings supplied.** Dialog shows the approved area specs and a "request floor plans" action. |
| WhatsApp number | `js/config.js`, header/footer links | Assumed to be the same as the phone number (+91 9048 857777). Confirm. |

## Staging → production

1. Remove `<meta name="robots" content="noindex, nofollow, noarchive">` from `tools/src/index.src.html` (and the legal pages) and rebuild.
2. Replace `robots.txt` with production rules + add `sitemap.xml`.
3. Add `<link rel="canonical">` and absolute `og:image` once the production URL is known.
4. Apply `deploy/security-headers.*` on the real server and re-verify with a header scanner.
5. Run PageSpeed Insights (mobile + desktop) on the deployed URL.
