// Gera public/juca-og.png (1200x630) a partir de public/juca.svg (logo quadrado 1000x1000),
// centralizado sobre o fundo "rio à noite" do site — usado como og:image geral (home).
// WhatsApp e a maioria dos apps de chat não renderizam SVG em preview de link, só PNG/JPEG.
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const svgPath = path.join(root, "public", "juca.svg");
const outPath = path.join(root, "public", "juca-og.png");

const svg = readFileSync(svgPath, "utf-8");
const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_SIZE = 520;

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; padding: 0; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: #0a1628;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo {
    width: ${LOGO_SIZE}px;
    height: ${LOGO_SIZE}px;
  }
  .logo > svg { width: 100%; height: 100%; display: block; }
</style>
</head>
<body>
  <div class="logo">${svg}</div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
await page.setContent(html);
await page.screenshot({ path: outPath });
await browser.close();

console.log(`OG image gerada em ${outPath}`);
