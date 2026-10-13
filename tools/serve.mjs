// Local static server for QA. Sends the production security headers so they can be verified locally.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".pdf": "application/pdf" };
const headers = {
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; frame-src https://player.vimeo.com https://www.youtube-nocookie.com; object-src 'none'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Permitted-Cross-Domain-Policies": "none",
};

createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (path.endsWith("\\") || path.endsWith("/")) path += "index.html";
  const file = join(root, path);
  if (!file.startsWith(root) || /node_modules|tools|scss|Client Resources/.test(path)) { res.writeHead(404, headers).end("Not found"); return; }
  try {
    if (!(await stat(file)).isFile()) throw new Error();
    let body = await readFile(file);
    const type = types[extname(file)] || "application/octet-stream";
    const h = { ...headers, "Content-Type": type, "Cache-Control": "no-cache" };
    // mimic production text compression
    if (/text|javascript|json|svg/.test(type) && /gzip/.test(req.headers["accept-encoding"] || "")) { body = gzipSync(body); h["Content-Encoding"] = "gzip"; }
    res.writeHead(200, h).end(body);
  } catch {
    res.writeHead(404, headers).end("Not found");
  }
}).listen(port, () => console.log("http://localhost:" + port));
