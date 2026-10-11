// Build: SCSS -> css/main.css + main.min.css, JS components -> js/bundle.js, HTML tokens -> index.html
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = (...a) => join(root, ...a);

// ---- CSS
mkdirSync(p("css"), { recursive: true });
const expanded = sass.compile(p("scss/main.scss"), { style: "expanded", loadPaths: [p("scss")] });
writeFileSync(p("css/main.css"), expanded.css);
const min = sass.compile(p("scss/main.scss"), { style: "compressed", loadPaths: [p("scss")] });
writeFileSync(p("css/main.min.css"), min.css);

// ---- JS (simple concatenation; every file is an IIFE)
const order = ["config.js", ...readdirSync(p("js/components")).sort().map((f) => "components/" + f), "main.js"];
const bundle = order.map((f) => `/* ${f} */\n` + readFileSync(p("js", f), "utf8")).join("\n");
writeFileSync(p("js/bundle.js"), bundle);

// ---- HTML
const manifest = JSON.parse(readFileSync(p("assets/images/manifest.json"), "utf8"));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function imgTag(parts) {
  const [name, alt = "", cls = "", sizes = "", loading = "lazy", ...rest] = parts;
  const attrs = [];
  if (/\.(png|svg)$/.test(name) || /^logo-.*\.webp$/.test(name)) {
    const [w, h] = rest;
    attrs.push(`src="assets/images/${name}"`, `width="${w}"`, `height="${h}"`);
  } else {
    const m = manifest[name];
    if (!m) throw new Error("Unknown image " + name);
    const widths = (rest.find((r) => /^[\d,]+$/.test(r) && r.includes(",")) || rest[rest.length - 1] || "")
      .split(",").map(Number).filter((w) => m.widths.includes(w));
    const list = widths.length ? widths : m.widths;
    const max = Math.max(...list);
    attrs.push(
      `src="assets/images/${name}-${max}.webp"`,
      `srcset="${list.map((w) => `assets/images/${name}-${w}.webp ${w}w`).join(", ")}"`,
      `sizes="${sizes}"`,
      `width="${max}"`,
      `height="${Math.round((m.h * max) / m.w)}"`
    );
  }
  attrs.push(`alt="${esc(alt)}"`);
  if (cls) attrs.push(`class="${cls}"`);
  if (loading === "priority") attrs.push('fetchpriority="high"');
  else if (loading === "eager") attrs.push('decoding="async"');
  else attrs.push('loading="lazy"', 'decoding="async"');
  return `<img ${attrs.join(" ")}>`;
}

let html = readFileSync(p("tools/src/index.src.html"), "utf8");
html = html.replace(/\{\{img ([^}]+)\}\}/g, (_, body) => imgTag(body.split("|").map((s) => s.trim())));
html = html.replace(/\{\{gal ([^}]+)\}\}/g, (_, body) => {
  const [head, alt, variant = ""] = body.split("|").map((s) => s.trim());
  const [cat, name] = head.split(/\s+/);
  const m = manifest[name];
  const full = Math.max(...m.widths.filter((w) => w <= 1600));
  const thumbs = m.widths.filter((w) => w <= 960);
  return `<li class="gallery__item${variant ? " gallery__item--" + variant : ""}" data-cat="${cat}"><button class="gallery__btn" type="button" data-full="assets/images/${name}-${full}.webp" data-alt="${esc(alt)}" aria-label="View larger: ${esc(alt)}"><img src="assets/images/${name}-${Math.max(...thumbs)}.webp" srcset="${thumbs.map((w) => `assets/images/${name}-${w}.webp ${w}w`).join(", ")}" sizes="(min-width: 64rem) 25vw, (min-width: 40rem) 33vw, 50vw" width="${Math.max(...thumbs)}" height="${Math.round((m.h * Math.max(...thumbs)) / m.w)}" alt="${esc(alt)}" loading="lazy" decoding="async"></button></li>`;
});
html = html.replace('<link rel="icon" href="assets/images/favicon.png" type="image/png">', '<link rel="icon" href="assets/images/favicon.png" type="image/png">');
writeFileSync(p("index.html"), html);
console.log("built: css", min.css.length, "bytes min, js", bundle.length, "bytes, html", html.length, "bytes");
