import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
const p = await c.newPage();
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
// keyboard activate Work link
await p.locator('.site-nav a', { hasText: 'Work' }).first().focus();
await p.keyboard.press('Enter'); await p.waitForTimeout(1000);
const a0 = await p.evaluate(() => { const a=document.activeElement; const r=a.getBoundingClientRect(); return { tag:a.tagName.toLowerCase(), id:a.id, text:(a.textContent||'').trim().slice(0,20), rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}, inView:r.bottom>0&&r.top<innerHeight, headerTop:Math.round(document.querySelector('.site-header').getBoundingClientRect().top), outline:getComputedStyle(a).outline, y:Math.round(scrollY) }; });
await p.keyboard.press('Shift+Tab'); await p.waitForTimeout(200);
const a1 = await p.evaluate(() => { const a=document.activeElement; const r=a.getBoundingClientRect(); return { tag:a.tagName.toLowerCase(), text:(a.textContent||'').trim().slice(0,20), label:a.getAttribute('aria-label'), rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}, inView:r.bottom>0&&r.top<innerHeight, outline:getComputedStyle(a).outline }; });
await p.keyboard.press('Shift+Tab'); await p.waitForTimeout(200);
const a2 = await p.evaluate(() => { const a=document.activeElement; const r=a.getBoundingClientRect(); return { tag:a.tagName.toLowerCase(), text:(a.textContent||'').trim().slice(0,20), label:a.getAttribute('aria-label'), rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}, inView:r.bottom>0&&r.top<innerHeight, outline:getComputedStyle(a).outline }; });
console.log(JSON.stringify({ a0, a1, a2 }, null, 1));
await b.close();
