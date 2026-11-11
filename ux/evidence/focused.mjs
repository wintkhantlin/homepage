import { chromium } from "playwright-core";

const BASE = "http://localhost:4321";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const page = await context.newPage();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. Diagram label contrast (real shape fills, not ancestor backgrounds).
await page.goto(`${BASE}/project/gencourse`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await sleep(700);
const diagram = await page.evaluate(() => {
  const svg = document.querySelector(".diagram-dark svg");
  if (!svg) return null;
  const parse = (v) => {
    const m = String(v).match(/rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
    }
    const h = String(v).trim();
    if (h.startsWith("#")) {
      const n = h.length === 4 ? h.slice(1).split("").map((c) => c + c) : [h.slice(1, 3), h.slice(3, 5), h.slice(5, 7)];
      return { r: parseInt(n[0], 16), g: parseInt(n[1], 16), b: parseInt(n[2], 16), a: 1 };
    }
    return null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const labels = [...svg.querySelectorAll("p, span, text, tspan")].filter((el) => (el.textContent || "").trim());
  const out = [];
  for (const el of labels) {
    const style = getComputedStyle(el);
    const fg = parse(style.color) || parse(style.fill);
    if (!fg) continue;
    const g = el.closest("g.node, g.cluster, g");
    const shape = g?.querySelector("rect, polygon, path");
    const bg = shape ? parse(getComputedStyle(shape).fill) || parse(shape.getAttribute("fill")) : null;
    if (!bg || bg.a === 0) continue;
    out.push({
      text: (el.textContent || "").trim().slice(0, 40),
      tag: el.tagName.toLowerCase(),
      fg: style.color || style.fill,
      bg: shape.getAttribute("fill") || getComputedStyle(shape).fill,
      ratio: Math.round(ratio(fg, bg) * 100) / 100,
    });
  }
  return out;
});
console.log("DIAGRAM", JSON.stringify(diagram, null, 1));

// 2. Photo dialog: Escape, close button, focus return.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await sleep(1000);
await page.locator(".photo-open").first().click();
await sleep(500);
console.log("OPEN", await page.evaluate(() => ({ open: document.querySelector("[data-photo-viewer]").open, active: document.activeElement?.textContent?.trim() })));
await page.keyboard.press("Escape");
await sleep(1200);
console.log("AFTER ESC 1.2s", await page.evaluate(() => ({ open: document.querySelector("[data-photo-viewer]").open, opacity: getComputedStyle(document.querySelector("[data-photo-viewer]")).opacity, active: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 40) })));
// Re-open and click Close.
if (await page.locator(".photo-open").first().count()) {
  await page.locator(".photo-open").first().click();
  await sleep(500);
  await page.locator("[data-viewer-close]").click();
  await sleep(1200);
  console.log("AFTER CLOSE BUTTON", await page.evaluate(() => ({ open: document.querySelector("[data-photo-viewer]").open, active: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 40) })));
}

// 3. Lazy images after scrolling to bottom.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 80));
  }
  window.scrollTo(0, document.body.scrollHeight);
});
await sleep(1200);
const lazy = await page.evaluate(() => [...document.images].map((img) => ({
  alt: img.alt.slice(0, 40),
  src: (img.currentSrc || img.src).split("/").slice(-1)[0].slice(0, 80),
  naturalWidth: img.naturalWidth,
  complete: img.complete,
})));
console.log("LAZY", JSON.stringify(lazy, null, 1));

// 4. Dark-theme focus ring and header wordmark geometry.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.evaluate(() => { localStorage.setItem("theme", "dark"); });
await page.reload({ waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await sleep(700);
await page.keyboard.press("Tab");
await page.keyboard.press("Tab");
const focus = await page.evaluate(() => {
  const el = document.activeElement;
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { text: el.textContent?.trim().slice(0, 40), href: el.getAttribute("href"), outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, rect: { x: r.x, y: r.y, w: r.width, h: r.height } };
});
console.log("DARK FOCUS", focus);
const header = await page.evaluate(() => {
  const link = document.querySelector(".site-header a");
  const r = link.getBoundingClientRect();
  const inner = document.querySelector(".site-header-inner").getBoundingClientRect();
  const nav = document.querySelector(".site-nav").getBoundingClientRect();
  return { link: { x: r.x, y: r.y, w: r.width, h: r.height }, inner: { x: inner.x, w: inner.width }, nav: { x: nav.x, w: nav.width } };
});
console.log("HEADER", header);

// 5. Mobile header and 320px reflow.
for (const width of [390, 320]) {
  const c = await browser.newContext({ viewport: { width, height: 844 }, colorScheme: "dark" });
  const p = await c.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await sleep(700);
  const info = await p.evaluate(() => {
    const rect = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    return {
      width: innerWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      wordmark: rect(".site-header a"),
      nav: rect(".site-nav"),
      navLinks: [...document.querySelectorAll(".site-nav a, .site-nav button")].map((el) => { const r = el.getBoundingClientRect(); return { text: el.textContent.trim().slice(0, 20), label: el.getAttribute("aria-label"), w: Math.round(r.width), h: Math.round(r.height) }; }),
      heroName: rect("#hero-name"),
      heroSide: rect(".hero-side"),
      heroNameFont: getComputedStyle(document.querySelector("#hero-name")).fontSize,
    };
  });
  console.log("MOBILE", width, JSON.stringify(info, null, 1));
  await p.screenshot({ path: `ux/evidence/home-${width}.png` });
  await c.close();
}

await browser.close();
