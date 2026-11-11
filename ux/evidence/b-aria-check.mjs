import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
const routes = ['/', '/projects', '/writing', '/about', '/project/gencourse', '/post/what-is-big-o-notation-my'];
for (const r of routes) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4321' + r, { waitUntil: 'networkidle' });
  const a = await p.evaluate(() => [...document.querySelectorAll('.site-nav a')].map(x => ({ t: x.textContent.trim(), cur: x.getAttribute('aria-current'), href: x.getAttribute('href') })));
  console.log(r, JSON.stringify(a.filter(x => x.cur)));
  await p.close();
}
await b.close();
