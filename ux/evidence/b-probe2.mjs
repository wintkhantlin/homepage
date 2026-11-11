import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const out = {};
// TOC collapse at desktop
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const p = await c.newPage();
  await p.goto('http://localhost:4321/post/idempotency-keys-what-most-tutorials-dont-tell-you', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
  const before = await p.evaluate(() => {
    const d = document.querySelector('[data-article-toc]'); const n = d.querySelector('nav'); const a = d.querySelector('a');
    return { open: d.open, navDisplay: getComputedStyle(n).display, navVis: n.checkVisibility(), linkRect: (() => { const r = a.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(), hit: (() => { const r = a.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return e ? (e === a || a.contains(e)) : false; })() };
  });
  await p.locator('[data-article-toc] summary').click(); await p.waitForTimeout(400);
  const after = await p.evaluate(() => {
    const d = document.querySelector('[data-article-toc]'); const n = d.querySelector('nav'); const a = d.querySelector('a');
    const r = a.getBoundingClientRect();
    return { open: d.open, navDisplay: getComputedStyle(n).display, navVis: n.checkVisibility(), linkRect: { w: Math.round(r.width), h: Math.round(r.height) }, linkText: a.textContent.trim().slice(0,20), hit: (() => { const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return e ? { tag: e.tagName.toLowerCase(), isLink: e === a || a.contains(e), text: (e.textContent||'').trim().slice(0,20) } : null; })(), detailsH: Math.round(d.getBoundingClientRect().height) };
  });
  await p.screenshot({ path: 'ux/evidence/b-toc-collapsed.png' });
  out.tocCollapse = { before, after };
  await c.close();
}
// aria-current per route + light keyboard focus
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  const p = await c.newPage();
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
  // keyboard tab through header in light
  await p.evaluate(() => document.body.focus());
  const stops = [];
  for (let i = 0; i < 7; i++) {
    await p.keyboard.press('Tab'); await p.waitForTimeout(80);
    stops.push(await p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { tag: a.tagName.toLowerCase(), text: (a.textContent||'').trim().slice(0,24), label: a.getAttribute('aria-label'), outline: cs.outline, offset: cs.outlineOffset, rect: (() => { const r = a.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })() }; }));
  }
  out.lightKeyboard = stops;
  for (const path of ['/about','/projects','/writing','/project/gencourse']) {
    await p.goto('http://localhost:4321'+path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    out['aria'+path] = await p.evaluate(() => [...document.querySelectorAll('.site-nav a')].map(a => ({ t: a.textContent.trim(), href: a.getAttribute('href'), aria: a.getAttribute('aria-current'), current: a.hasAttribute('data-current') })));
  }
  await c.close();
}
// enlarge hit area + wordmark click from empty space
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const p = await c.newPage();
  await p.goto('http://localhost:4321/project/gencourse', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
  out.hitAreas = await p.evaluate(() => {
    const btn = document.querySelector('[data-diagram-enlarge]'); btn.scrollIntoView({ block: 'center' });
    const r = btn.getBoundingClientRect();
    const points = [0.02, 0.5, 0.98].map(f => { const e = document.elementFromPoint(r.x + r.width * f, r.y + r.height / 2); return { f, tag: e?.tagName.toLowerCase(), isBtn: e === btn || btn.contains(e) }; });
    return { btnRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, points, label: btn.textContent.trim() };
  });
  await p.evaluate(() => window.scrollTo(0,0)); await p.waitForTimeout(600);
  const navBefore = p.url();
  await p.mouse.click(700, 36); await p.waitForTimeout(800);
  out.wordmarkClick = { before: navBefore, after: p.url() };
  await c.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
