import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const out = {};
for (const width of [320, 360, 390, 414, 640, 768]) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  out[width] = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), display: getComputedStyle(el).display, vis: getComputedStyle(el).visibility, fs: getComputedStyle(el).fontSize, shrink: getComputedStyle(el).flexShrink, vis2: el.checkVisibility ? el.checkVisibility() : null }; };
    const nav = q('.site-nav');
    const inner = q('.site-header-inner');
    const email = q('.site-nav a[href^="mailto"]');
    return {
      inner: r(inner), innerScroll: inner.scrollWidth, innerClient: inner.clientWidth,
      nav: r(nav), navScroll: nav.scrollWidth, navClient: nav.clientWidth,
      wordmark: r(q('header a[href="/"]')),
      links: [...document.querySelectorAll('.site-nav a[data-nav-section]')].map(a => ({ t: a.textContent.trim(), ...r(a) })),
      email: r(email), emailHTML: email ? email.outerHTML.slice(0, 200) : null,
      toggle: r(q('#theme-toggle')),
      toggleIcon: r(q('#theme-toggle svg')),
      bodyScroll: document.documentElement.scrollWidth, bodyClient: document.documentElement.clientWidth,
    };
  });
  await page.close();
}
console.log(JSON.stringify(out, null, 2));
await browser.close();
