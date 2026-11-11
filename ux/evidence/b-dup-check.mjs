import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
const routes = ['/', '/projects', '/project/gencourse', '/project/url2short', '/writing', '/post/idempotency-keys-what-most-tutorials-dont-tell-you', '/post/what-is-big-o-notation-my', '/about', '/404'];
for (const r of routes) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4321' + r, { waitUntil: 'networkidle' });
  const dups = await p.evaluate(() => {
    const seen = new Map();
    for (const el of document.querySelectorAll('[id]')) seen.set(el.id, (seen.get(el.id) || 0) + 1);
    return [...seen].filter(([, n]) => n > 1).map(([id, n]) => id + '×' + n);
  });
  console.log(r, dups.length ? dups : 'ok');
  await p.close();
}
await b.close();
