import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const out = {};
// no-JS fallback for photo viewer
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const p = await c.newPage();
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  out.noJs = await p.evaluate(() => {
    const trigger = document.querySelector('.photo-open');
    const d = document.querySelector('[data-photo-viewer]');
    const img = d?.querySelector('img');
    return { triggerTag: trigger?.tagName.toLowerCase(), triggerHref: trigger?.getAttribute('href'), triggerTarget: trigger?.getAttribute('target'), dialogOpen: d?.open, dialogDisplay: d ? getComputedStyle(d).display : null, imgSrc: img?.getAttribute('src'), imgVisible: img ? img.getBoundingClientRect().width > 0 : null, headerPosition: getComputedStyle(document.querySelector('.site-header')).position, themeLabel: document.querySelector('#theme-toggle')?.getAttribute('aria-label') };
  });
  await c.close();
}
// enlarge button actual hit area after scroll settles
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const p = await c.newPage();
  await p.goto('http://localhost:4321/project/gencourse', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('[data-diagram-enlarge]').scrollIntoView({ block: 'center' }); });
  await p.waitForTimeout(500);
  out.enlargeHit = await p.evaluate(() => {
    const btn = document.querySelector('[data-diagram-enlarge]'); const r = btn.getBoundingClientRect();
    const pts = [0.02, 0.25, 0.5, 0.75, 0.98].map(f => { const e = document.elementFromPoint(r.x + r.width * f, r.y + r.height / 2); return { f, tag: e?.tagName.toLowerCase(), isBtn: e === btn || btn.contains(e), text: (e?.textContent||'').trim().slice(0,18) }; });
    return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, pts };
  });
  // light focus ring via toggle + keyboard
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.locator('#theme-toggle').click(); await p.waitForTimeout(900);
  await p.evaluate(() => document.body.focus());
  const rings = [];
  for (let i = 0; i < 7; i++) { await p.keyboard.press('Tab'); await p.waitForTimeout(60); rings.push(await p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { text: (a.textContent||'').trim().slice(0,20), label: a.getAttribute('aria-label'), outline: cs.outline, offset: cs.outlineOffset, bg: getComputedStyle(document.documentElement).backgroundColor }; })); }
  out.lightRings = rings;
  // nav reachability after anchor: scroll up 8px only
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await p.locator('.site-nav a', { hasText: 'Work' }).first().click(); await p.waitForTimeout(1000);
  const hidden = await p.evaluate(() => ({ top: Math.round(document.querySelector('.site-header').getBoundingClientRect().top), hidden: document.querySelector('.site-header').hasAttribute('data-hidden') }));
  await p.evaluate(() => window.scrollBy(0, -10)); await p.waitForTimeout(400);
  const back = await p.evaluate(() => ({ top: Math.round(document.querySelector('.site-header').getBoundingClientRect().top), hidden: document.querySelector('.site-header').hasAttribute('data-hidden') }));
  out.headerReturn = { hidden, back };
  await c.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
