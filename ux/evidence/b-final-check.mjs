import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
const out = {};
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4321/project/gencourse', { waitUntil: 'networkidle' });
  out.enlarge = await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(x => /enlarge/i.test(x.textContent));
    const r = btn.getBoundingClientRect();
    return { text: btn.textContent.trim(), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), row: btn.parentElement.getBoundingClientRect().width };
  });
  await p.close();
}
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.evaluate(() => window.scrollTo(0, 500));
  await p.waitForTimeout(500);
  await p.evaluate(() => {
    const a = document.querySelector('.site-nav a[data-nav-section="projects"]');
    a.click();
  });
  await p.waitForTimeout(1500);
  out.anchor = await p.evaluate(() => {
    const h = document.querySelector('.site-header');
    const nav = document.querySelector('.site-nav');
    const notes = [...document.querySelectorAll('.site-nav a')].find(a => a.textContent.trim() === 'Notes');
    const nr = notes.getBoundingClientRect();
    const el = document.elementFromPoint(nr.x + nr.width / 2, nr.y + nr.height / 2);
    return {
      scrollY: Math.round(scrollY),
      headerTop: h.getBoundingClientRect().top,
      headerHidden: h.hasAttribute('data-hidden'),
      navTop: Math.round(nav.getBoundingClientRect().top),
      notesRect: { x: Math.round(nr.x), y: Math.round(nr.y), w: Math.round(nr.width), h: Math.round(nr.height) },
      hit: el ? { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 30) } : null,
      hash: location.hash
    };
  });
  await p.close();
}
{
  const p = await b.newPage({ viewport: { width: 320, height: 844 } });
  await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelector('.photo-open').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('.photo-open').click());
  await p.waitForTimeout(600);
  out.photo320 = await p.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    const r = d.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), overflowX: document.documentElement.scrollWidth - innerWidth };
  });
  await p.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
