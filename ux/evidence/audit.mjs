// UX study evidence collector for the Wint Khant Lin portfolio.
// Run from the repo root with the dev server on http://localhost:4321.
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:4321";
const OUT = join(process.cwd(), "ux", "evidence");
mkdirSync(OUT, { recursive: true });

const routes = [
  { slug: "home", path: "/" },
  { slug: "projects", path: "/projects" },
  { slug: "project-gencourse", path: "/project/gencourse" },
  { slug: "project-url2short", path: "/project/url2short" },
  { slug: "writing", path: "/writing" },
  { slug: "post-idempotency", path: "/post/idempotency-keys-what-most-tutorials-dont-tell-you" },
  { slug: "about", path: "/about" },
  { slug: "404", path: "/404" },
];

const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function round(n, digits = 2) {
  return Number.isFinite(n) ? Number(n.toFixed(digits)) : n;
}

async function collectPage(page) {
  return page.evaluate(() => {
    const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };
    const isVisible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0;
    };

    const parseColor = (value) => {
      const m = value.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      if (parts.length < 3) return null;
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    };
    const luminance = ({ r, g, b }) => {
      const f = (v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const contrast = (a, b) => {
      const l1 = luminance(a);
      const l2 = luminance(b);
      const hi = Math.max(l1, l2);
      const lo = Math.min(l1, l2);
      return (hi + 0.05) / (lo + 0.05);
    };
    const blend = (fg, bg) => {
      const a = fg.a ?? 1;
      return {
        r: fg.r * a + bg.r * (1 - a),
        g: fg.g * a + bg.g * (1 - a),
        b: fg.b * a + bg.b * (1 - a),
        a: 1,
      };
    };
    const bgFor = (el) => {
      let node = el;
      while (node && node !== document.documentElement) {
        const s = getComputedStyle(node);
        if (s.backgroundImage && s.backgroundImage !== "none") return null;
        const c = parseColor(s.backgroundColor);
        if (c && c.a > 0.95) return c;
        node = node.parentElement;
      }
      const root = parseColor(getComputedStyle(document.documentElement).backgroundColor);
      return root && root.a > 0 ? root : { r: 12, g: 13, b: 12, a: 1 };
    };

    const focusables = [...document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
    )].filter(isVisible);

    const tapTargets = focusables.map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: text(el).slice(0, 60),
      label: el.getAttribute("aria-label") || "",
      ...rect(el),
    })).filter((t) => t.w < 44 || t.h < 44);

    const images = [...document.images].map((img) => ({
      alt: img.getAttribute("alt"),
      src: (img.currentSrc || img.src || "").split("/").slice(-1)[0],
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      visible: isVisible(img),
      ...rect(img),
    }));

    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(isVisible).map((h) => ({
      level: Number(h.tagName[1]),
      text: text(h).slice(0, 100),
      id: h.id || undefined,
    }));

    const links = [...document.querySelectorAll("a[href]")].filter(isVisible).map((a) => ({
      text: text(a).slice(0, 70),
      href: a.getAttribute("href"),
      target: a.getAttribute("target") || undefined,
      rel: a.getAttribute("rel") || undefined,
      ariaLabel: a.getAttribute("aria-label") || undefined,
      ...rect(a),
    }));

    const textSamples = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const value = (node.textContent || "").trim();
      if (!value) continue;
      const el = node.parentElement;
      if (!el || !isVisible(el)) continue;
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.display === "none") continue;
      const fg = parseColor(s.color);
      const bg = bgFor(el);
      if (!fg || !bg) continue;
      const solid = blend(fg, bg);
      const ratio = contrast(solid, bg);
      const size = Number.parseFloat(s.fontSize);
      const weight = Number.parseInt(s.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      if (ratio < (large ? 3 : 4.5)) {
        textSamples.push({
          text: value.slice(0, 80),
          tag: el.tagName.toLowerCase(),
          color: s.color,
          bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
          fontSize: size,
          fontWeight: weight,
          ratio: Math.round(ratio * 100) / 100,
          required: large ? 3 : 4.5,
        });
      }
    }

    return {
      url: location.href,
      title: document.title,
      lang: document.documentElement.lang,
      theme: document.documentElement.classList.contains("light") ? "light" : "dark",
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "",
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      pageHeight: document.documentElement.scrollHeight,
      h1: [...document.querySelectorAll("h1")].map((h) => text(h)),
      headings,
      landmarks: {
        header: document.querySelectorAll("header").length,
        nav: document.querySelectorAll("nav").length,
        main: document.querySelectorAll("main").length,
        footer: document.querySelectorAll("footer").length,
        aside: document.querySelectorAll("aside").length,
      },
      skipLink: (() => {
        const el = document.querySelector(".skip-link");
        return el ? { text: text(el), ...rect(el) } : null;
      })(),
      focusableCount: focusables.length,
      tapTargets,
      images,
      brokenImages: images.filter((i) => i.visible && i.naturalWidth === 0),
      linksWithoutText: links.filter((l) => !l.text && !l.ariaLabel),
      externalLinksWithoutRel: links.filter((l) => l.target === "_blank" && !(l.rel || "").includes("noopener")),
      lowContrast: textSamples.slice(0, 40),
      lowContrastCount: textSamples.length,
      firstScreenText: text(document.querySelector("main"))?.slice(0, 700),
      header: (() => {
        const h = document.querySelector(".site-header");
        return h ? { ...rect(h), position: getComputedStyle(h).position, hidden: h.hasAttribute("data-hidden") } : null;
      })(),
      themeToggle: (() => {
        const b = document.querySelector("#theme-toggle");
        return b ? { label: b.getAttribute("aria-label"), ...rect(b) } : null;
      })(),
    };
  });
}

async function runViewport(browser, viewportName, viewport, results) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  const badResponses = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) => failedRequests.push({ url: req.url(), failure: req.failure()?.errorText }));
  page.on("response", (res) => {
    if (res.status() >= 400) badResponses.push({ url: res.url(), status: res.status() });
  });

  for (const route of routes) {
    const key = `${route.slug}-${viewportName}`;
    const before = { errors: consoleErrors.length, failed: failedRequests.length, bad: badResponses.length };
    await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await sleep(900);
    const data = await collectPage(page);
    await page.screenshot({ path: join(OUT, `${key}-viewport.png`) });
    if (["home", "projects", "project-gencourse", "writing", "post-idempotency", "about"].includes(route.slug)) {
      await page.screenshot({ path: join(OUT, `${key}-full.png`), fullPage: true });
    }
    results.push({
      key,
      viewport: viewportName,
      route: route.path,
      data,
      consoleErrors: consoleErrors.slice(before.errors),
      failedRequests: failedRequests.slice(before.failed),
      badResponses: badResponses.slice(before.bad),
    });
  }

  // Interaction checks (desktop only unless noted).
  if (viewportName === "desktop") {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await sleep(1200);

    // Theme switch: capture the transition mid-flight and record asset failures.
    const themeStart = { failed: failedRequests.length, bad: badResponses.length };
    await page.locator("#theme-toggle").click();
    await sleep(120);
    await page.screenshot({ path: join(OUT, "theme-switch-120ms.png") });
    await sleep(200);
    await page.screenshot({ path: join(OUT, "theme-switch-320ms.png") });
    await sleep(500);
    await page.screenshot({ path: join(OUT, "theme-switch-820ms.png") });
    const themeState = await page.evaluate(() => ({
      light: document.documentElement.classList.contains("light"),
      theme: document.documentElement.dataset.theme,
      bg: getComputedStyle(document.documentElement).backgroundColor,
      stored: localStorage.getItem("theme"),
      toggleLabel: document.querySelector("#theme-toggle")?.getAttribute("aria-label"),
    }));
    results.push({
      key: "interaction-theme",
      viewport: viewportName,
      data: themeState,
      consoleErrors: [],
      failedRequests: failedRequests.slice(themeStart.failed),
      badResponses: badResponses.slice(themeStart.bad),
    });

    // First 12 tab stops and focus ring visibility.
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await sleep(600);
    const tabStops = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      await sleep(80);
      tabStops.push(await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
          href: el.getAttribute?.("href") || undefined,
          outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
          outlineOffset: s.outlineOffset,
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        };
      }));
    }
    await page.screenshot({ path: join(OUT, "keyboard-focus.png") });
    results.push({ key: "interaction-keyboard", viewport: viewportName, data: tabStops, consoleErrors: [], failedRequests: [], badResponses: [] });

    // Project card hover/focus and photo dialog.
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await sleep(700);
    const firstRow = page.locator(".index-row").first();
    await firstRow.hover();
    await sleep(400);
    await page.screenshot({ path: join(OUT, "project-hover.png") });
    await firstRow.focus();
    await sleep(250);
    await page.screenshot({ path: join(OUT, "project-focus.png") });

    const photo = page.locator(".photo-open").first();
    if (await photo.count()) {
      await photo.click();
      await sleep(600);
      const dialog = await page.evaluate(() => {
        const d = document.querySelector("[data-photo-viewer]");
        if (!d) return null;
        const active = document.activeElement;
        return {
          open: d.open,
          busy: d.getAttribute("aria-busy"),
          activeText: (active?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
          activeTag: active?.tagName.toLowerCase(),
          imgSrc: d.querySelector("[data-viewer-img]")?.getAttribute("src")?.split("/").slice(-1)[0],
          imgAlt: d.querySelector("[data-viewer-img]")?.getAttribute("alt"),
          count: d.querySelector("[data-viewer-count]")?.textContent?.trim(),
          caption: d.querySelector("[data-viewer-caption]")?.textContent?.trim(),
        };
      });
      await page.screenshot({ path: join(OUT, "photo-dialog.png") });
      await page.keyboard.press("Escape");
      await sleep(500);
      const afterClose = await page.evaluate(() => ({
        open: document.querySelector("[data-photo-viewer]")?.open,
        active: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 40),
      }));
      results.push({ key: "interaction-photo-dialog", viewport: viewportName, data: { dialog, afterClose }, consoleErrors: [], failedRequests: [], badResponses: [] });
    }

    // Article table of contents and reading progress.
    await page.goto(`${BASE}/post/idempotency-keys-what-most-tutorials-dont-tell-you`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await sleep(600);
    const article = await page.evaluate(() => {
      const toc = document.querySelector("[data-article-toc]");
      const progress = document.querySelector(".read-progress");
      const cs = progress ? getComputedStyle(progress) : null;
      return {
        tocOpen: toc?.open,
        tocLinks: toc ? [...toc.querySelectorAll("a")].map((a) => a.textContent?.trim()).slice(0, 12) : [],
        tocPosition: toc ? getComputedStyle(toc).position : null,
        progressDisplay: cs?.display,
        progressAnimation: cs?.animationName,
        articleWidth: document.querySelector(".article-body")?.getBoundingClientRect().width,
      };
    });
    results.push({ key: "interaction-article", viewport: viewportName, data: article, consoleErrors: [], failedRequests: [], badResponses: [] });
  }

  // Mobile-specific: check the header after scrolling down, and the project index.
  if (viewportName === "mobile") {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await sleep(900);
    await page.evaluate(() => window.scrollTo(0, 1200));
    await sleep(700);
    await page.screenshot({ path: join(OUT, "mobile-scrolled.png") });
    const header = await page.evaluate(() => {
      const h = document.querySelector(".site-header");
      const r = h?.getBoundingClientRect();
      return {
        hidden: h?.hasAttribute("data-hidden"),
        scrolled: h?.hasAttribute("data-scrolled"),
        top: r ? Math.round(r.top) : null,
        height: r ? Math.round(r.height) : null,
        active: document.querySelector("[data-current]")?.textContent?.trim(),
      };
    });
    results.push({ key: "interaction-mobile-scroll", viewport: viewportName, data: header, consoleErrors: [], failedRequests: [], badResponses: [] });
  }

  await context.close();
}

async function runReducedMotion(browser, results) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(1000);
  const data = await page.evaluate(() => ({
    letters: document.querySelectorAll(".hero-letter").length,
    words: document.querySelectorAll(".hero-name-word").length,
    nameLabel: document.querySelector("#hero-name")?.getAttribute("aria-label"),
    transitions: getComputedStyle(document.querySelector(".index-row")).transitionDuration,
    headerPosition: getComputedStyle(document.querySelector(".site-header")).position,
    copyButtonDisplay: getComputedStyle(document.querySelector(".copy-email")).display,
  }));
  await page.screenshot({ path: join(OUT, "home-reduced-motion.png") });
  results.push({ key: "reduced-motion-home", viewport: "desktop", data, consoleErrors: [], failedRequests: [], badResponses: [] });
  await context.close();
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
  await runViewport(browser, "desktop", viewports.desktop, results);
  await runViewport(browser, "mobile", viewports.mobile, results);
  await runReducedMotion(browser, results);
} finally {
  await browser.close();
}

writeFileSync(join(OUT, "audit.json"), JSON.stringify(results, null, 2));
console.log(`Wrote ${results.length} records to ${join(OUT, "audit.json")}`);
for (const r of results) {
  const d = r.data;
  if (d && typeof d === "object" && "overflowX" in d) {
    console.log(`${r.key}: h=${d.pageHeight}px overflowX=${d.overflowX} tap<44=${d.tapTargets.length} lowContrast=${d.lowContrastCount} broken=${d.brokenImages.length} errors=${r.consoleErrors.length} failed=${r.failedRequests.length} bad=${r.badResponses.length}`);
  }
}
