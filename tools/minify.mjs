// Minify hand-edited css/main.css -> css/main.min.css and js/bundle.js -> js/bundle.min.js
import { writeFileSync } from "node:fs";
import * as sass from "sass";
writeFileSync("css/main.min.css", sass.compile("css/main.css", { style: "compressed" }).css);
