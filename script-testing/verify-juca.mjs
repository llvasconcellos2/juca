import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
// A história do Juca deixou de ficar em "/" (agora é a tela de seleção);
// mora na rota da história.
const STORY_URL = `${BASE}/historias/juca-tesouro-do-rio`;
const shots = [];

async function shot(page, name) {
  const p = `C:/Users/leona/AppData/Local/Temp/juca-${name}.png`;
  await page.screenshot({ path: p, fullPage: false });
  shots.push(p);
  console.log(`📸 ${name}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto(STORY_URL, { waitUntil: 'networkidle' });
console.log('✅ Page loaded');
await shot(page, '01-inicio');

const skipLink = await page.locator('a:has-text("Pular para o conteúdo")').count();
console.log(`✅ Skip link: ${skipLink === 1}`);

const h1 = await page.locator('h1').textContent();
console.log(`✅ H1: "${h1?.trim()}"`);

const narBtn = await page.locator('button:has-text("Ouvir cena")').count();
console.log(`✅ Narration button: ${narBtn === 1}`);

const choiceBtns = await page.locator('nav button').count();
console.log(`✅ Choice buttons: ${choiceBtns}`);

// Path A: Farejar
await page.locator('nav button').first().click();
await page.waitForTimeout(400);
await shot(page, '02-cena-faro');
const sceneAText = await page.locator('article p').first().textContent();
console.log(`✅ Cena A: "${sceneAText?.substring(0, 60)}"`);

const focusAfterNav = await page.evaluate(() => document.activeElement?.tagName + '/' + document.activeElement?.getAttribute('tabindex'));
console.log(`✅ Focus after nav: ${focusAfterNav}`);

await page.locator('nav button:has-text("Continuar")').click();
await page.waitForTimeout(400);
await shot(page, '03-final-faro');

const restartBtn = await page.locator('button:has-text("Jogar novamente")').count();
console.log(`✅ Restart button on ending: ${restartBtn === 1}`);

// Restart → Path B: Escutar
await page.locator('button:has-text("Jogar novamente")').click();
await page.waitForTimeout(400);
await page.locator('nav button').nth(1).click();
await page.waitForTimeout(400);
await shot(page, '04-cena-ouvido');
await page.locator('nav button:has-text("Continuar")').click();
await page.waitForTimeout(400);
await shot(page, '05-final-ouvido');
console.log('✅ Path B complete');

// Zoom probe
await page.setViewportSize({ width: 640, height: 800 });
await shot(page, '06-mobile');
const overflow = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth);
console.log(`🔍 Horizontal overflow at 640px: ${overflow}`);

// Keyboard: tab to first choice button
await page.goto(STORY_URL, { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
const skipFocused = await page.evaluate(() => document.activeElement?.textContent?.trim());
console.log(`🔍 First Tab focus: "${skipFocused}"`);
await page.keyboard.press('Tab');
for (let i = 0; i < 8; i++) {
  const t = await page.evaluate(() => document.activeElement?.textContent?.trim()?.substring(0, 30));
  if (t?.includes('Farejar') || t?.includes('Ouvir')) { console.log(`🔍 Keyboard reached: "${t}"`); break; }
  await page.keyboard.press('Tab');
}

console.log('\n✅ All screenshots written to C:/Users/leona/AppData/Local/Temp/');
await browser.close();
