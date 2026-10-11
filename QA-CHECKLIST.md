# QA Checklist — Wellage Praana (HTML Phase, sections 1–39)

Source of truth: *HTML Phase – Master Development & QA Checklist.pdf* (25 pp., sections 1–39).
Legend: **PASS** verified · **FAIL** verified failing · **BLOCKED** needs deployed server / missing client asset / external service · **N/A**.
Environment used: Windows, Chrome (Playwright-driven, `localhost:4173`), Lighthouse CLI (local, simulated throttling), Nu HTML Checker (vnu) 
and axe-core. The Claude-in-Chrome extension was not connected, so Playwright + local Chrome was used instead.

| # | Section | Status | Evidence / what remains |
|---|---|---|---|
| 1 | Section heading structure | PASS | Every section uses `.section-heading` (`__eyebrow`/`__title`); look is class-driven, tag levels follow outline (one `h1`, `h2` sections, `h3` items). |
| 2 | Section height | PASS | No fixed heights on content sections; `padding-block: clamp(3.5rem,7vw,7rem)`. No fixed-height blocks remain after the redesign. |
| 3 | Responsive section spacing | PASS | clamp()-based spacing; page height stable ≥1600 px (17 283 px at 1600/1800/1920/2560 = no growth on wide screens). |
| 4 | Browser zoom 75–150% | PASS (emulated) | Zoom ≡ CSS-viewport width: 75%→1920, 80%→1800, 90%→1600, 100%→1440, 110%→1309, 125%→1152, 150%→960 all measured: no horizontal overflow, 0 console errors. Real browser-zoom keystrokes were not driven. |
| 5 | Large desktop | PASS | 1920 and 2560 px: container capped at 78 rem, no huge gaps, hero proportional (screenshots reviewed at 1440; metrics at 1920/2560). |
| 6 | Small laptop | PASS | 1024, 1100, 1280 px checked: hamburger menu below 1280 px (8 nav items + phone + CTA do not fit earlier), floating rail replaced by bottom bar below 1280 px so it never overlaps content. |
| 7 | Responsive device testing | PASS | Widths tested: 2560, 1920, 1800, 1600, 1440, 1309, 1280, 1152, 1024, 960, 820, 768, 600, 480, 390, 360, 320. Physical devices not tested. |
| 8 | Section layout | PASS | Shared `.container`; Grid/Flex; absolute positioning only for image fills, decorative panel text overlays, form honeypot. |
| 9 | Reusable components | PASS | Buttons, section-heading, forms/fields, accordion, quote/person cards, dialog, chips, social, nav, float actions each own an SCSS partial. |
| 10 | Accordion behaviour | PASS | Automated: only one open (`open=1`), height equals scrollHeight (no clipping), ArrowUp/Down/Home/End, smooth grid-rows animation, works after resize. |
| 11 | Navigation | PASS | Desktop nav + current-section highlight; mobile menu opens/closes, closes on link and Esc, `inert` when hidden, no overflow. No dropdowns exist (N/A). |
| 12 | Images & media | PASS | All images have width/height, `srcset`/`sizes`, `object-fit`; alt text reviewed; decorative = `alt=""`. **Note:** no Praana interior photos supplied (see Content gaps). |
| 13 | Typography | PASS | Self-hosted Cormorant Garamond (display) + Montserrat (body), `font-display: swap`, preloaded; body 17 px/1.7. |
| 14 | No horizontal overflow | PASS | Measured `scrollWidth === clientWidth` at all tested widths; offending-element probe empty. |
| 15 | Accessibility | PASS | axe-core (wcag2a/2aa/21aa + best-practices): **0 violations**; Lighthouse a11y 100; skip link, focus-visible ring, labelled forms, aria-expanded accordions, `<dialog>` modals. Screen-reader manual test not done. |
| 16 | Animation & motion | PASS | CSS + IntersectionObserver only (no GSAP: performance target). `prefers-reduced-motion` disables reveals/transitions. No layout shift (CLS 0–0.014). |
| 17 | Security headers | BLOCKED | CSP, HSTS, X-Content-Type-Options, X-Frame-Options are sent by `tools/serve.mjs` locally (verified with `curl -I`). Page works under that CSP with 0 violations. Production: apply `deploy/security-headers.htaccess` or `.nginx.conf`, then verify on the live URL. HTTPS/HSTS can only be verified deployed. |
| 18 | HTML validator | PASS | Nu validator: **0 errors, 0 warnings** on `index.html`, `privacy-policy.html`, `terms.html`. |
| 19 | CSS validation / quality | PASS (partial) | Sass compiles with no warnings; no `!important` except reduced-motion/sr-only; no fixed heights causing clipping. No separate W3C CSS validator run. |
| 20 | JavaScript errors | PASS | 0 console errors/warnings across all widths and during functional run (forms, dialogs, gallery, accordion). |
| 21 | Broken links | PASS (partial) | All internal anchors resolve; `tel:`/`mailto:`/`wa.me` formed; Privacy/Terms pages exist. External YouTube/InterSmart links not crawled. Social: only YouTube + WhatsApp are verified; other networks unknown → not shown. |
| 22 | Forms | PASS (frontend) / BLOCKED (backend) | Required, email, Indian-mobile, past-date validation; honeypot; busy/disabled state; duplicate-submit guard; reset on success. **No backend endpoint exists**, so the form shows "not sent yet" + WhatsApp/call fallback and never claims success. Set `js/config.js → formEndpoint`. |
| 23 | SEO / staging protection | PASS (staging) | `noindex, nofollow, noarchive` meta + `robots.txt Disallow: /`. Before launch: remove both, add canonical, sitemap, absolute `og:image`. |
| 24 | PageSpeed Insights | BLOCKED | PSI needs a public URL. Local Lighthouse (gzip on, simulated throttling): **mobile 82–90 (run-to-run noise; latest 82: LCP 3.6 s, TBT 280 ms, CLS 0)**, **desktop 98** (LCP 1.2 s, CLS 0). Target 100 **not met on mobile**; re-measure on production (HTTP/2/3, brotli, CDN). |
| 25 | Core Web Vitals | BLOCKED | Lab values above only; no field data. INP not measurable in lab. |
| 26 | Performance optimisation | PASS (partial) | WebP responsive set, lazy images, preloaded hero + fonts, no libraries, 19 KB JS, 37 KB CSS, `content-visibility`, IO instead of scroll listener. Remaining: mobile LCP/SI (tall mobile hero), unused CSS ≈ 11 KB. |
| 27 | Console / network QA | PASS | 0 failed requests, 0 4xx/5xx, no mixed content (all same-origin). |
| 28 | Footer | PASS | Responsive, links, contact, social, copyright, approved `footerintersmart-logo.svg` on a dark bar (logo is white-on-dark), "Designed and Developed by". Copyright text taken from the homepage ("Wellage Wellness Village Pvt Ltd") — confirm vs. "Varma Wellage Private Limited" in the address. |
| 29 | Browser compatibility | BLOCKED | Chrome only. Edge shares Chromium. Firefox/Safari **not tested**. Uses `<dialog>`, `inert`, `content-visibility`, `@media (scripting)`, `text-wrap: balance` (all progressive). |
| 30 | WordPress/CMS readiness | PASS | Component classes, BEM, no inline styles/`<style>`/inline JS, content in HTML not JS, config isolated. |
| 31 | Final visual QA | PASS (partial) | Page redesigned to the supplied mockup (`Wellage Praana Senior Living Experience (1).png`): light hero with couple cut-out + form card, overview with fact strip, why-grid, residences tabs, amenities cards, life banner, floor plans + connectivity side by side, reimagined cards, experience-centre banner form, testimonials carousel, gallery tabs + View All, two-column FAQ, dark-green final CTA. Also consistent with homepage PDF (logos, serif display, cream/dark-green). **Figma prototype and the two external reference sites were not inspected** (not accessed in this session). |
| 32 | Final responsive QA | PASS | See 4–7, 14. |
| 33 | Release gates | See table below | |
| 34 | Definition of done | NOT YET | Blocked items: security headers on server, PSI 100, cross-browser, form backend, client assets. |
| 35 | Folder structure | PASS | `assets/{images,icons,videos,fonts,documents}`, `css/`, `scss/{abstracts,base,components,layout,pages,vendors}`, `js/{main.js,components}`, `README.md`. `icons/`, `videos/`, `documents/` are empty (no assets supplied / SVG sprite is inline). |
| 36 | Sass architecture | PASS | Variables, functions, `up()/down()` breakpoint mixins, centralised tokens; `main.scss` entry; compiled `css/main.css` + `main.min.css`. |
| 37 | HTML + Sass separation | PASS | No inline CSS; HTML loads compiled CSS. |
| 38 | Naming convention | PASS | BEM throughout. |
| 39 | Final code organisation | PASS | Built via `npm run build`; generated `index.html` documented in README. |

## Release gates (section 33)

| Gate | Requirement | Status |
|---|---|---|
| HTML validator | 0 errors | PASS |
| Console | 0 errors | PASS |
| Broken resources | 0 critical | PASS |
| Horizontal overflow | 0 | PASS |
| Security headers | All 4 present | BLOCKED (local server only; deploy config provided) |
| PageSpeed mobile | 100 | BLOCKED / not met locally (≈82–90) |
| PageSpeed desktop | 100 | BLOCKED (≈98 local) |
| Responsive desktop / large / laptop / tablet / mobile | Pass | PASS |
| Browser zoom | 75–150% | PASS (viewport-emulated) |
| Section gaps | none abnormal | PASS |
| Accordion | one open | PASS |
| Images | correct proportions | PASS |
| Forms | Pass | PASS frontend; backend BLOCKED |
| Navigation | Pass | PASS |
| Accessibility | Pass | PASS (automated + keyboard flows) |
| Staging robots | disabled indexing | PASS |
| Production robots | reviewed before launch | BLOCKED (launch step) |
| Security | Pass | BLOCKED (see 17) |
| WordPress readiness | Pass | PASS |
| Footer credit | approved SVG | PASS |
| Visual QA | Pass | PASS vs homepage PDF; Figma not inspected |

## Content gaps & decisions needing the client

1. **Brochure PDF** — none in project. CTAs request it via the form (configurable in `js/config.js`).
2. **Floor-plan drawings** — none supplied; dialog shows approved areas and a request action.
3. **Praana interior photos** (living, kitchenette, bedroom, bathroom) — none. A homepage 360° living-room render is used and labelled illustrative.
4. **Videos** — none in project; "Life at Praana" uses stills + a link to the Varma Wellage YouTube channel.
5. **Testimonials** — only Wellage *Serene* quotes exist (homepage); shown as such, un-named because the PDF text order made name↔quote attribution ambiguous. No Praana testimonials exist.
6. **Completion date conflict** — structure document says **August 2032**; the Praana creative (PSD) says "Completion by 2030*". Page uses August 2032; please confirm.
7. **WhatsApp number** — assumed identical to +91 9048 857777; confirm.
8. **Experience-centre address / hours** — not documented; page says details are shared on confirmation.
9. **Social links** — only YouTube known; supply Instagram/Facebook/LinkedIn if wanted.
10. **Privacy Policy / Terms** — short plain-language placeholders; legal text pending.
11. **Experience Centre gallery category** — no photos; shows an honest empty state.
12. **Lead backend/CRM endpoint, spam protection (reCAPTCHA/Turnstile if required), production URL.**
13. Homepage claims such as "1000+ Happy Families" were deliberately **not** reused on the Praana page.

## Redesign notes (mockup parity)

- **Kept from the approved structure document but absent from the mockup:** *About Varma* section (placed between Testimonials and Gallery).
- **Deviations forced by missing assets:** floor-plan thumbnails are replaced by to-scale area bars (no drawings supplied); the connectivity map is a distance-ring schematic (no map asset/coordinates); only the Living Room tab has a photo; testimonial cards have no portraits (only Wellage Serene quotes exist); the "Life at Praana" banner uses the yoga-studio render and links to YouTube (no video file).
- **Mockup typo corrected:** heading reads "Welcome to Wellage Praana" (mockup said "Premium to Wellage Praana").
- Re-verified after redesign: Nu validator 0 errors, axe 0 violations, 0 console errors, all functional tests pass (accordion, forms, dialog, tabs, gallery filter/View All, lightbox, mobile nav), no page-level horizontal overflow at 320–1920 px.

## Form update (drawer + styled controls)

- Field sets match *Wellage Landing Page Structure*: hero form = Name, Phone, Email, Preferred Unit, Message → "Book a Visit"; visit form = Name, Phone, Email, Preferred Visit Date, Number of Visitors → "Schedule a Visit" (plus a hidden anti-spam honeypot).
- Slide-out **Enquire Now** drawer (right edge, every screen size) re-uses the enquiry form; brochure CTAs and "Request floor plans" open it pre-filled.
- Dropdowns are an ARIA select-only combobox layered on the native `<select>` (keyboard, type-ahead, Esc, validation state mirrored).
- Re-verified: Nu validator 0 errors; axe 0 violations (1440 and 390 px); 0 console errors; drawer/dropdown/validation tests pass.
