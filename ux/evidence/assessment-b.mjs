// Assessment B — independent detector + browser evidence for the Wint Khant Lin portfolio.
// Run from repo root with the dev server on http://localhost:4321.
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:4321";
const OUT = join(process.cwd(), "ux", "evidence");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = {};

const launch = async () => chromium.launch({ channel: "chrome", headless: true });

function wire(page, bucket) {
  page.on("console", (msg) => {
    if (msg.type() === "error") bucket.console.push(msg.text());
  });
  page.on("pageerror", (err) => bucket.console.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) => bucket.failed.push({ url: req.url(), failure: req.failure()?.errorText }));
  page.on("response", (res) => {
    if (res.status() >= 400) bucket.bad.push({ url: res.url(), status: res.status() });
  });
}

const rect = (el) => {
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) };
};

const pageProbe = () => {
  const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0;
  };
  const rr = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) };
  };

  const focusables = [...document.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
  )].filter(vis);

  const overflowers = [];
  for (const el of document.querySelectorAll("body *")) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // Skip elements inside an explicit horizontal scroller (diagram, code blocks).
    let p = el.parentElement, scroller = false;
    while (p && p !== document.body) {
      const s = getComputedStyle(p);
      if ((s.overflowX === "auto" || s.overflowX === "scroll") && p.scrollWidth > p.clientWidth) { scroller = true; break; }
      p = p.parentElement;
    }
    if (scroller) continue;
    if (r.right > innerWidth + 1 || r.left < -1) {
      overflowers.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 70), text: text(el).slice(0, 40), ...rr(el) });
    }
  }

  const imgs = [...document.images].map((img) => ({
    alt: img.getAttribute("alt"),
    ariaHidden: img.getAttribute("aria-hidden"),
    src: (img.currentSrc || img.src || "").split("/").slice(-1)[0],
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    complete: img.complete,
    visible: vis(img),
    inDialogClosed: !!img.closest("dialog:not([open])"),
    ...rr(img),
  }));

  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => ({
    level: Number(h.tagName[1]), text: text(h).slice(0, 90), id: h.id || undefined, hidden: !vis(h),
  }));

  const taps = focusables.map((el) => ({
    tag: el.tagName.toLowerCase(),
    text: text(el).slice(0, 40),
    label: el.getAttribute("aria-label") || "",
    id: el.id || undefined,
    cls: String(el.className).slice(0, 60),
    ...rr(el),
  }));

  return {
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang,
    theme: document.documentElement.classList.contains("light") ? "light" : "dark",
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    innerWidth,
    innerHeight,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    pageHeight: document.documentElement.scrollHeight,
    bodyScrollWidth: document.body.scrollWidth,
    overflowers: overflowers.slice(0, 20),
    h1: [...document.querySelectorAll("h1")].map((h) => text(h)),
    headings,
    landmarks: {
      header: document.querySelectorAll("header").length,
      nav: [...document.querySelectorAll("nav")].map((n) => n.getAttribute("aria-label") || "(unlabelled)"),
      main: document.querySelectorAll("main").length,
      footer: document.querySelectorAll("footer").length,
      aside: document.querySelectorAll("aside").length,
    },
    skip: (() => {
      const el = document.querySelector(".skip-link");
      if (!el) return null;
      const s = getComputedStyle(el);
      return { text: text(el), href: el.getAttribute("href"), transform: s.transform, ...rr(el) };
    })(),
    images: imgs,
    brokenVisible: imgs.filter((i) => i.visible && i.complete && i.naturalWidth === 0),
    emptyAltVisible: imgs.filter((i) => i.visible && i.alt === "" && !i.ariaHidden),
    focusableCount: focusables.length,
    taps,
    smallTaps: taps.filter((t) => t.w < 44 || t.h < 44),
    header: (() => {
      const h = document.querySelector(".site-header");
      if (!h) return null;
      const a = h.querySelector("a");
      const nav = h.querySelector(".site-nav");
      return {
        ...rr(h), position: getComputedStyle(h).position,
        hidden: h.hasAttribute("data-hidden"), scrolled: h.hasAttribute("data-scrolled"),
        transform: getComputedStyle(h).transform,
        wordmark: a ? { text: text(a), ...rr(a) } : null,
        nav: nav ? rr(nav) : null,
        links: [...h.querySelectorAll("a,button")].map((el) => ({ text: text(el).slice(0, 24), href: el.getAttribute("href"), label: el.getAttribute("aria-label"), ...rr(el) })),
      };
    })(),
    hero: (() => {
      const h = document.querySelector(".hero");
      if (!h) return null;
      const name = h.querySelector("#hero-name");
      const side = h.querySelector(".hero-side");
      return { ...rr(h), name: name ? rr(name) : null, side: side ? rr(side) : null, nameScrollWidth: name?.scrollWidth, nameFont: name ? getComputedStyle(name).fontSize : null };
    })(),
    firstSectionTops: [...document.querySelectorAll("main section[id]")].slice(0, 8).map((s) => ({ id: s.id, top: Math.round(s.getBoundingClientRect().top + scrollY) })),
    links: [...document.querySelectorAll("a[href]")].filter(vis).map((a) => ({ text: text(a).slice(0, 50), href: a.getAttribute("href") })),
    mainText: text(document.querySelector("main"))?.slice(0, 400),
  };
};

// ── 1. Route sweep at three viewports ─────────────────────────────────────────
const routes = [
  { slug: "home", path: "/" },
  { slug: "projects", path: "/projects" },
  { slug: "project-gencourse", path: "/project/gencourse" },
  { slug: "project-url2short", path: "/project/url2short" },
  { slug: "writing", path: "/writing" },
  { slug: "post-idempotency", path: "/post/idempotency-keys-what-most-tutorials-dont-tell-you" },
  { slug: "post-bigo", path: "/post/what-is-big-o-notation-my" },
  { slug: "about", path: "/about" },
  { slug: "404", path: "/404" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile390", width: 390, height: 844 },
  { name: "mobile320", width: 320, height: 844 },
];

const browser = await launch();
try {
  results.sweep = [];
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, colorScheme: "dark", reducedMotion: "no-preference" });
    const page = await ctx.newPage();
    for (const route of routes) {
      const bucket = { console: [], failed: [], bad: [] };
      wire(page, bucket);
      const before = { c: bucket.console.length, f: bucket.failed.length, b: bucket.bad.length };
      await page.goto(BASE + route.path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await sleep(700);
      // Load lazy images before judging them.
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += Math.round(vp.height * 0.8)) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await sleep(60);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(500);
      const data = await page.evaluate(pageProbe);
      data.record = { key: `${route.slug}-${vp.name}`, route: route.path };
      data.net = {
        console: bucket.console.slice(before.c),
        failed: bucket.failed.slice(before.f),
        bad: bucket.bad.slice(before.b),
      };
      results.sweep.push(data);
      if (["home", "projects", "project-gencourse", "writing", "post-idempotency", "about"].includes(route.slug)) {
        await page.screenshot({ path: join(OUT, `b-${route.slug}-${vp.name}.png`) });
      }
    }
    await ctx.close();
  }

  // ── 2. Desktop interactions ─────────────────────────────────────────────────
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  const bucket = { console: [], failed: [], bad: [] };
  wire(page, bucket);
  const netStart = () => ({ c: bucket.console.length, f: bucket.failed.length, b: bucket.bad.length });
  const netSlice = (s) => ({ console: bucket.console.slice(s.c), failed: bucket.failed.slice(s.f), bad: bucket.bad.slice(s.b) });

  // 2a. skip link + first 16 tab stops, dark
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);
  let s = netStart();
  const tabsDark = [];
  for (let i = 0; i < 16; i++) {
    await page.keyboard.press("Tab");
    await sleep(60);
    tabsDark.push(await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const st = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        i: el.tagName.toLowerCase(),
        text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
        href: el.getAttribute?.("href"),
        ariaLabel: el.getAttribute?.("aria-label"),
        outline: `${st.outlineStyle} ${st.outlineWidth} ${st.outlineColor}`,
        offset: st.outlineOffset,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        visible: r.width > 0 && r.height > 0,
      };
    }));
  }
  await page.screenshot({ path: join(OUT, "b-focus-dark.png") });
  results.tabsDark = { stops: tabsDark, net: netSlice(s) };

  // 2b. theme switch (light) — label, animation.gif request, mid frames
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(200);
  const labelBefore = await page.getAttribute("#theme-toggle", "aria-label");
  s = netStart();
  await page.locator("#theme-toggle").click();
  await sleep(120);
  await page.screenshot({ path: join(OUT, "b-theme-120.png") });
  const mid1 = await page.evaluate(() => ({
    light: document.documentElement.classList.contains("light"),
    switching: document.documentElement.classList.contains("theme-switching"),
    bg: getComputedStyle(document.documentElement).backgroundColor,
    label: document.querySelector("#theme-toggle")?.getAttribute("aria-label"),
    vt: document.getAnimations().map((a) => ({ name: a.animationName || a.transitionProperty || a.constructor.name, playState: a.playState, currentTime: Math.round(a.currentTime || 0) })),
  }));
  await sleep(200);
  await page.screenshot({ path: join(OUT, "b-theme-320.png") });
  await sleep(500);
  await page.screenshot({ path: join(OUT, "b-theme-820.png") });
  await sleep(500);
  const themeFinal = await page.evaluate(() => ({
    light: document.documentElement.classList.contains("light"),
    theme: document.documentElement.dataset.theme,
    bg: getComputedStyle(document.documentElement).backgroundColor,
    stored: localStorage.getItem("theme"),
    label: document.querySelector("#theme-toggle")?.getAttribute("aria-label"),
    themeColor: document.querySelector("#theme-color")?.getAttribute("content"),
    switching: document.documentElement.classList.contains("theme-switching"),
    iconDarkHidden: document.querySelector("#theme-icon-dark")?.classList.contains("hidden"),
    iconLightHidden: document.querySelector("#theme-icon-light")?.classList.contains("hidden"),
  }));
  results.themeSwitch = { labelBefore, mid1, final: themeFinal, net: netSlice(s) };

  // 2c. light-theme contrast spot check + focus ring
  const lightContrast = await page.evaluate(() => {
    const parse = (v) => {
      const m = String(v).match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
    };
    const lum = ({ r, g, b }) => {
      const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
    const blend = (fg, bg) => ({ r: fg.r * (fg.a ?? 1) + bg.r * (1 - (fg.a ?? 1)), g: fg.g * (fg.a ?? 1) + bg.g * (1 - (fg.a ?? 1)), b: fg.b * (fg.a ?? 1) + bg.b * (1 - (fg.a ?? 1)), a: 1 });
    const bgOf = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const st = getComputedStyle(n);
        if (st.backgroundImage && st.backgroundImage !== "none") return null;
        const c = parse(st.backgroundColor);
        if (c && c.a > 0.95) return c;
        n = n.parentElement;
      }
      const root = parse(getComputedStyle(document.documentElement).backgroundColor);
      return root && root.a ? root : { r: 250, g: 250, b: 250, a: 1 };
    };
    const samples = [];
    const sel = [".site-header a", ".site-nav a", ".site-nav a[data-current]", ".hero-lede", ".hero-alias", "#theme-toggle", ".index-meta", ".index-stack", ".index-about", ".recognition-result", ".recognition-date", ".writing-excerpt", ".writing-meta", ".footer-colophon a", ".footer-close p", "main h2", "main p", ".skip-link"];
    for (const q of sel) {
      const el = document.querySelector(q);
      if (!el) continue;
      const st = getComputedStyle(el);
      const fg = parse(st.color);
      const bg = bgOf(el);
      if (!fg || !bg) continue;
      const solid = blend(fg, bg);
      const size = parseFloat(st.fontSize);
      const weight = parseInt(st.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      samples.push({ q, text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40), color: st.color, bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`, size, weight, ratio: Math.round(ratio(solid, bg) * 100) / 100, need: large ? 3 : 4.5 });
    }
    return samples;
  });
  const tabsLight = [];
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.keyboard.press("Tab");
  for (let i = 0; i < 5; i++) {
    tabsLight.push(await page.evaluate(() => {
      const el = document.activeElement;
      const st = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30), outline: `${st.outlineStyle} ${st.outlineWidth} ${st.outlineColor}`, offset: st.outlineOffset, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } };
    }));
    await page.keyboard.press("Tab");
    await sleep(60);
  }
  await page.screenshot({ path: join(OUT, "b-focus-light.png") });
  results.lightTheme = { contrast: lightContrast, tabs: tabsLight };

  // 2d. header scroll behaviour + scroll spy + anchor navigation
  await page.evaluate(() => { localStorage.setItem("theme", "dark"); });
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);
  const headerStates = {};
  headerStates.top = await page.evaluate(() => {
    const h = document.querySelector(".site-header");
    return { y: scrollY, hidden: h.hasAttribute("data-hidden"), scrolled: h.hasAttribute("data-scrolled"), top: Math.round(h.getBoundingClientRect().top), active: document.querySelector("[data-current]")?.textContent?.trim(), aria: document.querySelector("[data-current]")?.getAttribute("aria-current") };
  });
  await page.evaluate(() => window.scrollTo(0, 1400));
  await sleep(500);
  headerStates.down = await page.evaluate(() => {
    const h = document.querySelector(".site-header");
    return { y: scrollY, hidden: h.hasAttribute("data-hidden"), scrolled: h.hasAttribute("data-scrolled"), top: Math.round(h.getBoundingClientRect().top), active: document.querySelector("[data-current]")?.textContent?.trim(), aria: document.querySelector("[data-current]")?.getAttribute("aria-current") };
  });
  await page.screenshot({ path: join(OUT, "b-header-scrolled-down.png") });
  await page.evaluate(() => window.scrollTo(0, 1000));
  await sleep(500);
  headerStates.up = await page.evaluate(() => {
    const h = document.querySelector(".site-header");
    return { y: scrollY, hidden: h.hasAttribute("data-hidden"), scrolled: h.hasAttribute("data-scrolled"), top: Math.round(h.getBoundingClientRect().top), active: document.querySelector("[data-current]")?.textContent?.trim(), aria: document.querySelector("[data-current]")?.getAttribute("aria-current") };
  });
  // scroll spy at each section
  headerStates.spy = [];
  for (const id of ["projects", "writing", "about"]) {
    await page.evaluate((sid) => document.getElementById(sid)?.scrollIntoView({ behavior: "instant", block: "start" }), id);
    await sleep(700);
    headerStates.spy.push(await page.evaluate(() => ({ active: document.querySelector("[data-current]")?.textContent?.trim(), aria: document.querySelector("[data-current]")?.getAttribute("aria-current"), hash: location.hash })));
  }
  // anchor click from home header
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
  await page.locator(".site-nav a", { hasText: "Work" }).first().click();
  await sleep(1000);
  headerStates.anchorClick = await page.evaluate(() => ({
    hash: location.hash,
    projectsTop: Math.round(document.getElementById("projects")?.getBoundingClientRect().top),
    active: document.querySelector("[data-current]")?.textContent?.trim(),
    headerTop: Math.round(document.querySelector(".site-header").getBoundingClientRect().top),
    h2Top: Math.round(document.querySelector("#index-heading")?.getBoundingClientRect().top),
  }));
  results.header = headerStates;

  // 2e. photo viewer
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);
  await page.locator(".photo-open").first().scrollIntoViewIfNeeded();
  await sleep(500);
  s = netStart();
  await page.locator(".photo-open").first().click();
  await sleep(700);
  const photoOpen = await page.evaluate(() => {
    const d = document.querySelector("[data-photo-viewer]");
    const a = document.activeElement;
    const img = d.querySelector("[data-viewer-img]");
    return {
      open: d.open, busy: d.getAttribute("aria-busy"), activeTag: a?.tagName.toLowerCase(), activeText: (a?.textContent || "").replace(/\s+/g, " ").trim(),
      activeIsClose: a === d.querySelector("[data-viewer-close]"),
      imgSrc: (img.currentSrc || img.src || "").split("/").slice(-1)[0], imgNatural: [img.naturalWidth, img.naturalHeight], imgAlt: img.alt,
      count: d.querySelector("[data-viewer-count]")?.textContent?.trim(),
      caption: d.querySelector("[data-viewer-caption]")?.textContent?.trim(),
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      stage: (() => { const r = d.querySelector("[data-viewer-stage]").getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
      dialog: (() => { const r = d.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
    };
  });
  await page.screenshot({ path: join(OUT, "b-photo-open.png") });
  await page.keyboard.press("Escape");
  await sleep(1200);
  const photoEsc = await page.evaluate(() => ({
    open: document.querySelector("[data-photo-viewer]").open,
    opacity: getComputedStyle(document.querySelector("[data-photo-viewer]")).opacity,
    active: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.replace(/\s+/g, " ").trim().slice(0, 60),
    activeIsOpener: document.activeElement === document.querySelector(".photo-open"),
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
  }));
  // reopen, next, close button
  await page.locator(".photo-open").first().click();
  await sleep(600);
  await page.locator("[data-viewer-next]").click();
  await sleep(900);
  const photoNext = await page.evaluate(() => ({
    count: document.querySelector("[data-viewer-count]")?.textContent?.trim(),
    src: (document.querySelector("[data-viewer-img]")?.currentSrc || "").split("/").slice(-1)[0],
    alt: document.querySelector("[data-viewer-img]")?.alt,
  }));
  await page.locator("[data-viewer-close]").click();
  await sleep(1200);
  const photoClose = await page.evaluate(() => ({
    open: document.querySelector("[data-photo-viewer]").open,
    activeIsOpener: document.activeElement === document.querySelector(".photo-open"),
    active: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.replace(/\s+/g, " ").trim().slice(0, 60),
  }));
  results.photo = { open: photoOpen, afterEsc: photoEsc, next: photoNext, afterClose: photoClose, net: netSlice(s) };

  // 2f. project page: diagram contrast from real shapes, TOC, next case study
  await page.goto(BASE + "/project/gencourse", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(800);
  const diagram = await page.evaluate(() => {
    const parse = (v) => {
      const m = String(v).match(/rgba?\(([^)]+)\)/);
      if (m) { const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; }
      const h = String(v).trim();
      if (h.startsWith("#")) {
        const n = h.length === 4 ? h.slice(1).split("").map((c) => c + c) : [h.slice(1, 3), h.slice(3, 5), h.slice(5, 7)];
        return { r: parseInt(n[0], 16), g: parseInt(n[1], 16), b: parseInt(n[2], 16), a: 1 };
      }
      if (h === "none" || h === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
      return null;
    };
    const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
    const out = [];
    const svg = document.querySelector(".diagram-dark svg");
    if (!svg) return { error: "no svg" };
    const labels = [...svg.querySelectorAll("text, tspan, p, span")].filter((el) => (el.textContent || "").trim() && el.getBoundingClientRect().width > 0);
    for (const el of labels) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const st = getComputedStyle(el);
      const fg = parse(el.tagName === "text" || el.tagName === "tspan" ? st.fill : st.color);
      if (!fg || fg.a === 0) continue;
      // Find what is actually painted behind the text centre.
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const stack = document.elementsFromPoint(cx, cy);
      let bgEl = null;
      for (const cand of stack) {
        if (cand === el || el.contains(cand)) continue;
        if (cand.tagName === "svg" || cand.tagName === "HTML" || cand.tagName === "BODY") continue;
        const cs = getComputedStyle(cand);
        const fill = parse(cs.fill);
        const bgc = parse(cs.backgroundColor);
        if (fill && fill.a > 0.9) { bgEl = { el: cand, color: fill, via: "fill" }; break; }
        if (bgc && bgc.a > 0.9) { bgEl = { el: cand, color: bgc, via: "background" }; break; }
      }
      if (!bgEl) continue;
      out.push({
        text: (el.textContent || "").trim().slice(0, 32), tag: el.tagName.toLowerCase(),
        fg: `rgb(${Math.round(fg.r)},${Math.round(fg.g)},${Math.round(fg.b)})`,
        bg: `rgb(${Math.round(bgEl.color.r)},${Math.round(bgEl.color.g)},${Math.round(bgEl.color.b)})`,
        bgTag: bgEl.el.tagName.toLowerCase(), bgVia: bgEl.via,
        ratio: Math.round(ratio(fg, bgEl.color) * 100) / 100,
      });
    }
    return out;
  });
  const diagramFrame = await page.evaluate(() => {
    const f = document.querySelector("[data-diagram]");
    const btn = document.querySelector("[data-diagram-enlarge]");
    const toc = document.querySelector(".md\\:sticky nav[aria-label='On this page']") || [...document.querySelectorAll("nav")].find((n) => n.getAttribute("aria-label") === "On this page");
    const next = [...document.querySelectorAll("main > a")].find((a) => a.textContent.includes("Next case study"));
    return {
      frame: f ? { clientWidth: f.clientWidth, scrollWidth: f.scrollWidth, clientHeight: f.clientHeight, scrollHeight: f.scrollHeight, tabindex: f.getAttribute("tabindex"), label: f.getAttribute("aria-label") } : null,
      enlarge: btn ? { display: getComputedStyle(btn).display, visible: btn.getBoundingClientRect().width > 0, text: btn.textContent.trim() } : null,
      toc: toc ? { display: getComputedStyle(toc).display, visible: toc.getBoundingClientRect().width > 0, rect: (() => { const r = toc.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(), position: getComputedStyle(toc.parentElement).position } : null,
      next: next ? { href: next.getAttribute("href"), text: next.textContent.replace(/\s+/g, " ").trim().slice(0, 80) } : null,
      h1: document.querySelector("h1")?.textContent?.trim(),
    };
  });
  await page.locator("[data-diagram-enlarge]").click();
  await sleep(600);
  const diagramDialog = await page.evaluate(() => {
    const d = document.querySelector("[data-diagram-viewer]");
    const c = d.querySelector("[data-diagram-canvas]");
    const a = document.activeElement;
    return {
      open: d.open, activeTag: a?.tagName.toLowerCase(), activeIsClose: a === d.querySelector("[data-diagram-close]"),
      canvas: { clientWidth: c.clientWidth, scrollWidth: c.scrollWidth, clientHeight: c.clientHeight, scrollHeight: c.scrollHeight },
      svg: (() => { const s = c.querySelector("svg"); if (!s) return null; const r = s.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
      dialog: (() => { const r = d.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
    };
  });
  await page.screenshot({ path: join(OUT, "b-diagram-enlarged.png") });
  await page.keyboard.press("Escape");
  await sleep(400);
  const diagramAfterEsc = await page.evaluate(() => ({ open: document.querySelector("[data-diagram-viewer]").open, active: document.activeElement?.textContent?.trim().slice(0, 40), activeIsButton: document.activeElement === document.querySelector("[data-diagram-enlarge]") }));
  results.project = { diagram, diagramFrame, diagramDialog, diagramAfterEsc };

  // 2g. article: TOC, progress, lang, line length
  await page.goto(BASE + "/post/idempotency-keys-what-most-tutorials-dont-tell-you", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(800);
  const article = await page.evaluate(() => {
    const toc = document.querySelector("[data-article-toc]");
    const prog = document.querySelector(".read-progress");
    const body = document.querySelector(".article-body");
    const p = body?.querySelector("p");
    const pcs = p ? getComputedStyle(p) : null;
    const tocRect = toc?.getBoundingClientRect();
    return {
      lang: document.documentElement.lang,
      articleLang: document.querySelector("article")?.getAttribute("lang"),
      tocOpen: toc?.open, tocCount: toc?.querySelectorAll("a").length,
      tocLinks: toc ? [...toc.querySelectorAll("a")].map((a) => ({ text: a.textContent.trim(), href: a.getAttribute("href"), h: Math.round(a.getBoundingClientRect().height) })) : [],
      tocPosition: toc ? getComputedStyle(toc).position : null,
      tocTop: tocRect ? Math.round(tocRect.top) : null,
      tocWidth: tocRect ? Math.round(tocRect.width) : null,
      tocHeight: tocRect ? Math.round(tocRect.height) : null,
      tocParentOverflow: toc ? getComputedStyle(toc).overflow : null,
      progress: prog ? { display: getComputedStyle(prog).display, animationName: getComputedStyle(prog).animationName, timeline: getComputedStyle(prog).animationTimeline, transform: getComputedStyle(prog).transform, height: getComputedStyle(prog).height } : null,
      bodyWidth: body ? Math.round(body.getBoundingClientRect().width) : null,
      pWidth: p ? Math.round(p.getBoundingClientRect().width) : null,
      pFontSize: pcs?.fontSize, pLineHeight: pcs?.lineHeight,
      pChars: p ? p.textContent.trim().length : null,
      firstHeading: body?.querySelector("h2")?.textContent?.trim(),
      firstHeadingLang: body?.querySelector("h2")?.getAttribute("lang"),
      headings: [...document.querySelectorAll(".article-body h2, .article-body h3")].slice(0, 12).map((h) => ({ tag: h.tagName.toLowerCase(), text: h.textContent.trim().slice(0, 40), id: h.id, lang: h.getAttribute("lang") })),
      nextNote: (() => { const a = [...document.querySelectorAll("main a")].find((x) => x.textContent.includes("Next note")); return a ? { href: a.getAttribute("href"), text: a.textContent.replace(/\s+/g, " ").trim().slice(0, 90) } : null; })(),
      moreAbout: (() => { const a = [...document.querySelectorAll("a")].find((x) => x.textContent.trim() === "More about me"); return a ? { href: a.getAttribute("href"), rect: (() => { const r = a.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })() } : null; })(),
    };
  });
  await page.evaluate(() => window.scrollTo(0, 1800));
  await sleep(600);
  const articleScrolled = await page.evaluate(() => {
    const toc = document.querySelector("[data-article-toc]");
    const prog = document.querySelector(".read-progress");
    const cur = toc?.querySelector("[aria-current='location']");
    return {
      tocTop: toc ? Math.round(toc.getBoundingClientRect().top) : null,
      current: cur?.textContent?.trim(),
      progressTransform: prog ? getComputedStyle(prog).transform : null,
      hash: location.hash,
    };
  });
  await page.screenshot({ path: join(OUT, "b-article-scrolled.png") });
  results.article = { initial: article, scrolled: articleScrolled };

  // 2h. home notes/about IA links + header link targets per page
  const ia = await page.evaluate(async () => ({})).catch(() => ({}));
  const pages = ["/", "/writing", "/about", "/projects", "/post/idempotency-keys-what-most-tutorials-dont-tell-you", "/project/gencourse"];
  const headerLinks = [];
  for (const p of pages) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await sleep(500);
    headerLinks.push(await page.evaluate(() => ({
      path: location.pathname,
      header: [...document.querySelectorAll(".site-nav a")].map((a) => ({ text: a.textContent.trim(), href: a.getAttribute("href"), current: a.getAttribute("aria-current") })),
      footerNotes: [...document.querySelectorAll("footer a")].filter((a) => a.textContent.trim() === "Notes").map((a) => a.getAttribute("href")),
      viewAllNotes: [...document.querySelectorAll("a")].filter((a) => a.textContent.includes("View all notes")).map((a) => a.getAttribute("href")),
      moreAbout: [...document.querySelectorAll("a")].filter((a) => a.textContent.trim() === "More about me").map((a) => a.getAttribute("href")),
    })));
  }
  results.ia = { headerLinks, notes: ia };

  // ── 3. Reduced motion ───────────────────────────────────────────────────────
  const rmCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
  const rm = await rmCtx.newPage();
  const rmBucket = { console: [], failed: [], bad: [] };
  wire(rm, rmBucket);
  await rm.goto(BASE + "/", { waitUntil: "networkidle" });
  await rm.evaluate(() => document.fonts.ready);
  await sleep(1200);
  const rmBefore = await rm.evaluate(() => ({
    media: matchMedia("(prefers-reduced-motion: reduce)").matches,
    letters: document.querySelectorAll(".hero-letter").length,
    words: document.querySelectorAll(".hero-name-word").length,
    label: document.querySelector("#hero-name")?.getAttribute("aria-label"),
    letterTransforms: [...document.querySelectorAll(".hero-letter")].slice(0, 5).map((l) => l.style.translate + "|" + l.style.rotate),
    rowTransitions: getComputedStyle(document.querySelector(".index-row")).transitionDuration,
    tocTransitions: document.querySelector(".writing-link") ? getComputedStyle(document.querySelector(".writing-link")).transitionDuration : null,
    headerTransition: getComputedStyle(document.querySelector(".site-header")).transitionDuration,
    copy: (() => { const c = document.querySelector(".copy-email"); return c ? { display: getComputedStyle(c).display } : null; })(),
    htmlScroll: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  await sleep(1500);
  const rmAfter = await rm.evaluate(() => ({
    letterTransforms: [...document.querySelectorAll(".hero-letter")].slice(0, 5).map((l) => l.style.translate + "|" + l.style.rotate),
    strengthSweep: document.querySelectorAll(".hero-letter[style*='font-variation-settings']").length,
  }));
  await rm.screenshot({ path: join(OUT, "b-reduced-motion.png") });
  results.reducedMotion = { before: rmBefore, after: rmAfter, net: rmBucket };
  await rmCtx.close();

  // ── 4. Mobile interaction: 390 header scroll + tap targets for named elements ──
  results.mobile = [];
  for (const width of [390, 320]) {
    const mctx = await browser.newContext({ viewport: { width, height: 844 }, colorScheme: "dark" });
    const mp = await mctx.newPage();
    const mb = { console: [], failed: [], bad: [] };
    wire(mp, mb);
    await mp.goto(BASE + "/", { waitUntil: "networkidle" });
    await mp.evaluate(() => document.fonts.ready);
    await sleep(800);
    const named = await mp.evaluate(() => {
      const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
      const byText = (sel, t) => [...document.querySelectorAll(sel)].find((e) => e.textContent.trim().startsWith(t));
      return {
        wordmark: r(document.querySelector(".site-header a")),
        navLinks: [...document.querySelectorAll(".site-nav a")].map((a) => ({ text: a.textContent.trim(), ...r(a) })),
        email: r([...document.querySelectorAll(".site-nav a")].find((a) => (a.getAttribute("href") || "").startsWith("mailto:"))),
        themeToggle: r(document.querySelector("#theme-toggle")),
        heroEmail: r(document.querySelector(".hero-cta")),
        copyEmail: r(document.querySelector(".copy-email")),
        seeWork: r(byText("a", "See the work")),
        viewAllWork: r(byText("a", "View all work")),
        moreAbout: r(byText("a", "More about me")),
        footerLinks: [...document.querySelectorAll("footer a")].map((a) => ({ text: a.textContent.trim().slice(0, 24), ...r(a) })),
        tocLinks: [...document.querySelectorAll("[data-article-toc] a")].map((a) => ({ text: a.textContent.trim().slice(0, 24), ...r(a) })),
        navGap: (() => { const n = document.querySelector(".site-nav"); return n ? { w: Math.round(n.getBoundingClientRect().width), x: Math.round(n.getBoundingClientRect().x) } : null; })(),
        headerInner: (() => { const i = document.querySelector(".site-header-inner"); return i ? { w: Math.round(i.getBoundingClientRect().width), x: Math.round(i.getBoundingClientRect().x) } : null; })(),
      };
    });
    // header hide/return at mobile
    await mp.evaluate(() => window.scrollTo(0, 1500));
    await sleep(500);
    const mDown = await mp.evaluate(() => { const h = document.querySelector(".site-header"); return { hidden: h.hasAttribute("data-hidden"), top: Math.round(h.getBoundingClientRect().top), active: document.querySelector("[data-current]")?.textContent?.trim() }; });
    await mp.evaluate(() => window.scrollTo(0, 1100));
    await sleep(500);
    const mUp = await mp.evaluate(() => { const h = document.querySelector(".site-header"); return { hidden: h.hasAttribute("data-hidden"), top: Math.round(h.getBoundingClientRect().top) }; });
    await mp.screenshot({ path: join(OUT, `b-home-${width}-viewport.png`) });
    // article TOC at mobile
    await mp.goto(BASE + "/post/idempotency-keys-what-most-tutorials-dont-tell-you", { waitUntil: "networkidle" });
    await mp.evaluate(() => document.fonts.ready);
    await sleep(600);
    const mArticle = await mp.evaluate(() => {
      const toc = document.querySelector("[data-article-toc]");
      const r = toc?.getBoundingClientRect();
      const links = [...(toc?.querySelectorAll("a") || [])].map((a) => { const b = a.getBoundingClientRect(); return { text: a.textContent.trim().slice(0, 30), w: Math.round(b.width), h: Math.round(b.height) }; });
      return {
        tocOpen: toc?.open, tocPosition: toc ? getComputedStyle(toc).position : null,
        toc: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null,
        links, summaryH: toc?.querySelector("summary")?.getBoundingClientRect().height,
        bodyW: document.querySelector(".article-body")?.getBoundingClientRect().width,
        moreAbout: (() => { const a = [...document.querySelectorAll("a")].find((x) => x.textContent.trim() === "More about me"); if (!a) return null; const b = a.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; })(),
        nextNote: (() => { const a = [...document.querySelectorAll("main a")].find((x) => x.textContent.includes("Next note")); return a ? a.getAttribute("href") : null; })(),
        lang: document.documentElement.lang,
      };
    });
    results.mobile.push({ width, named, down: mDown, up: mUp, article: mArticle, net: mb });
    await mctx.close();
  }

  // ── 5. Project mobile diagram/TOC ───────────────────────────────────────────
  results.projectMobile = [];
  for (const width of [390, 320]) {
    const pctx = await browser.newContext({ viewport: { width, height: 844 }, colorScheme: "dark" });
    const pp = await pctx.newPage();
    await pp.goto(BASE + "/project/gencourse", { waitUntil: "networkidle" });
    await pp.evaluate(() => document.fonts.ready);
    await sleep(700);
    const info = await pp.evaluate(() => {
      const f = document.querySelector("[data-diagram]");
      const btn = document.querySelector("[data-diagram-enlarge]");
      const onThisPage = [...document.querySelectorAll("nav")].find((n) => n.getAttribute("aria-label") === "On this page");
      const next = [...document.querySelectorAll("main a")].find((a) => a.textContent.includes("Next case study"));
      const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
      return {
        frame: f ? { clientWidth: f.clientWidth, scrollWidth: f.scrollWidth, rect: r(f) } : null,
        enlarge: btn ? { display: getComputedStyle(btn).display, rect: r(btn) } : null,
        onThisPage: onThisPage ? { display: getComputedStyle(onThisPage).display, rect: r(onThisPage) } : null,
        next: next ? { href: next.getAttribute("href"), rect: r(next), text: next.textContent.replace(/\s+/g, " ").trim().slice(0, 60) } : null,
        h1: document.querySelector("h1")?.textContent?.trim(),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    await pp.screenshot({ path: join(OUT, `b-project-gencourse-${width}.png`) });
    results.projectMobile.push({ width, info });
    await pctx.close();
  }
} finally {
  await browser.close();
}

writeFileSync(join(OUT, "assessment-b.json"), JSON.stringify(results, null, 2));
console.log("wrote assessment-b.json");
for (const r of results.sweep) {
  console.log(`${r.record.key}: h=${r.pageHeight} overflow=${r.overflowX} overflowers=${r.overflowers.length} broken=${r.brokenVisible.length} emptyAlt=${r.emptyAltVisible.length} smallTaps=${r.smallTaps.length} h1=${r.h1.length} errs=${r.net.console.length} failed=${r.net.failed.length} bad=${r.net.bad.length}`);
}
