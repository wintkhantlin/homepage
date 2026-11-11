import { chromium } from "playwright-core";
const BASE = "http://localhost:4321";
const OUT = "ux/evidence";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = {};

// ── A. Detector finding: img with no src inside closed dialog ────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  const reqs = [];
  page.on("request", (r) => { if (r.url().includes("awards") || r.url().includes("photo")) reqs.push(r.url()); });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);
  out.detector = await page.evaluate(() => {
    const img = document.querySelector(".photo-viewer-img");
    const d = img.closest("dialog");
    const r = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    return {
      hasSrcAttr: img.hasAttribute("src"), srcAttr: img.getAttribute("src"),
      naturalWidth: img.naturalWidth, complete: img.complete,
      dialogOpen: d.open, dialogDisplay: getComputedStyle(d).display,
      imgRect: { w: Math.round(r.width), h: Math.round(r.height) },
      checkVisibility: img.checkVisibility?.({ checkVisibilityCSS: true, checkOpacity: true }),
      imgDisplay: cs.display, imgVisibility: cs.visibility, imgOpacity: cs.opacity,
      widthAttr: img.getAttribute("width"), heightAttr: img.getAttribute("height"),
      // Does it render a broken-image box anywhere?
      offsetParent: !!img.offsetParent,
      alt: img.alt,
    };
  });
  out.detector.requestsBeforeOpen = reqs;
  await page.locator(".photo-open").first().scrollIntoViewIfNeeded();
  await page.locator(".photo-open").first().click();
  await sleep(800);
  out.detector.afterOpen = await page.evaluate(() => {
    const img = document.querySelector(".photo-viewer-img");
    return { hasSrc: img.hasAttribute("src"), src: (img.currentSrc || "").split("/").slice(-1)[0].slice(0, 90), naturalWidth: img.naturalWidth, complete: img.complete, visible: img.checkVisibility?.() };
  });
  out.detector.requestsAfterOpen = reqs;
  await ctx.close();
}

// ── B. Escape timing + animation.gif requests + scroll spy at top ────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  const gif = [];
  page.on("request", (r) => { if (r.url().includes("animation.gif")) gif.push({ url: r.url(), type: r.resourceType() }); });
  page.on("response", (r) => { if (r.url().includes("animation.gif")) gif.push({ url: r.url(), status: r.status(), type: r.request().resourceType() }); });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);
  out.spyTop = await page.evaluate(() => ({
    y: scrollY, active: document.querySelector("[data-current]")?.textContent?.trim() || null,
    currentCount: document.querySelectorAll("[data-current]").length,
    aria: [...document.querySelectorAll("[data-nav-section]")].map((a) => ({ t: a.textContent.trim(), aria: a.getAttribute("aria-current") })),
  }));
  // wordmark hit area
  out.wordmark = await page.evaluate(() => {
    const a = document.querySelector(".site-header a");
    const r = a.getBoundingClientRect();
    const hit = (x, y) => { const el = document.elementFromPoint(x, y); return el ? { tag: el.tagName.toLowerCase(), text: (el.textContent || "").trim().slice(0, 30), isWordmark: el === a || a.contains(el) } : null; };
    return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, midRight: hit(r.x + r.width - 20, r.y + r.height / 2), gap: hit(880, 36) };
  });
  // theme + gif
  await page.locator("#theme-toggle").click();
  await sleep(900);
  out.gif = gif;
  // escape timing
  await page.evaluate(() => localStorage.setItem("theme", "dark"));
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);
  await page.locator(".photo-open").first().scrollIntoViewIfNeeded();
  await page.locator(".photo-open").first().click();
  await sleep(700);
  const t0 = Date.now();
  await page.keyboard.press("Escape");
  let closedAt = null;
  for (let i = 0; i < 40; i++) {
    const open = await page.evaluate(() => document.querySelector("[data-photo-viewer]").open);
    if (!open) { closedAt = Date.now() - t0; break; }
    await sleep(50);
  }
  out.escapeTiming = { closedAfterMs: closedAt, focusedAfter: await page.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 40)) };
  await ctx.close();
}

// ── C. Diagram contrast via nearest shape; light theme too ──────────────────
const diagramProbe = () => {
  const parse = (v) => {
    const m = String(v).match(/rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; }
    const h = String(v).trim();
    if (h.startsWith("#")) {
      const n = h.length === 4 ? h.slice(1).split("").map((c) => c + c) : [h.slice(1, 3), h.slice(3, 5), h.slice(5, 7)];
      return { r: parseInt(n[0], 16), g: parseInt(n[1], 16), b: parseInt(n[2], 16), a: 1 };
    }
    return null;
  };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const results = [];
  for (const theme of ["dark", "light"]) {
    const svg = document.querySelector(`.diagram-${theme} svg`);
    if (!svg) continue;
    const labels = [...svg.querySelectorAll("text, p")].filter((el) => (el.textContent || "").trim() && el.getBoundingClientRect().width > 0);
    for (const el of labels) {
      const st = getComputedStyle(el);
      const fg = parse(el.tagName === "text" ? st.fill : st.color);
      if (!fg) continue;
      // Nearest painted shape behind the label.
      let shape = el.closest("g.node")?.querySelector(":scope > rect, :scope > polygon, :scope > path, :scope > circle");
      let group = "node";
      if (!shape) { shape = el.closest("g.cluster")?.querySelector(":scope > rect, :scope > polygon"); group = "cluster"; }
      if (!shape) { shape = el.closest("g.edgeLabel")?.querySelector("rect"); group = "edgeLabel"; }
      if (!shape) { shape = el.closest("g")?.querySelector("rect"); group = "fallback-g"; }
      if (!shape) continue;
      const bg = parse(getComputedStyle(shape).fill);
      if (!bg || bg.a === 0) continue;
      const r = el.getBoundingClientRect();
      results.push({
        theme, group, text: (el.textContent || "").trim().slice(0, 30),
        fg: `rgb(${Math.round(fg.r)},${Math.round(fg.g)},${Math.round(fg.b)})`,
        bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
        shape: shape.tagName.toLowerCase(),
        ratio: Math.round(ratio(fg, bg) * 100) / 100,
        rect: { w: Math.round(r.width), h: Math.round(r.height) },
      });
    }
  }
  return results;
};
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/project/gencourse", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(700);
  out.diagramDark = await page.evaluate(diagramProbe);
  await page.locator("[data-diagram]").screenshot({ path: `${OUT}/b-diagram-dark-crop.png` });
  // light
  await page.evaluate(() => localStorage.setItem("theme", "light"));
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(700);
  out.diagramLight = await page.evaluate(diagramProbe);
  await page.locator("[data-diagram]").screenshot({ path: `${OUT}/b-diagram-light-crop.png` });
  out.diagramThemes = await page.evaluate(() => ({
    darkDisplay: getComputedStyle(document.querySelector(".diagram-dark")).display,
    lightDisplay: getComputedStyle(document.querySelector(".diagram-light")).display,
  }));
  await ctx.close();
}

// ── D. Article line length + lang + TOC + 404 console ───────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/post/idempotency-keys-what-most-tutorials-dont-tell-you", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(700);
  out.articleMeasure = await page.evaluate(() => {
    const p = document.querySelector(".article-body p");
    const textNode = [...p.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    const range = document.createRange();
    const start = textNode.textContent.indexOf(textNode.textContent.trim());
    const firstTop = (() => { range.setStart(textNode, start); range.setEnd(textNode, start + 1); return range.getBoundingClientRect().top; })();
    let chars = 0;
    for (let i = start; i < textNode.textContent.length; i++) {
      range.setStart(textNode, i); range.setEnd(textNode, i + 1);
      if (Math.abs(range.getBoundingClientRect().top - firstTop) > 2) break;
      chars++;
    }
    const cs = getComputedStyle(p);
    return { charsFirstLine: chars, width: Math.round(p.getBoundingClientRect().width), fontSize: cs.fontSize, lineHeight: cs.lineHeight, maxWidthRule: cs.maxWidth, textSample: textNode.textContent.trim().slice(0, 50) };
  });
  out.articleLang = await page.evaluate(() => ({
    html: document.documentElement.lang,
    headTitle: document.title,
    paragraphs: [...document.querySelectorAll(".article-body p")].slice(0, 6).map((p) => ({ lang: p.getAttribute("lang"), text: p.textContent.trim().slice(0, 50) })),
    headings: [...document.querySelectorAll(".article-body h2")].map((h) => ({ lang: h.getAttribute("lang"), text: h.textContent.trim().slice(0, 40) })),
    aboutAside: (() => { const a = document.querySelector("aside[aria-label='About the author']"); return a ? a.getAttribute("lang") : null; })(),
  }));
  await page.goto(BASE + "/post/what-is-big-o-notation-my", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(600);
  out.bigoLang = await page.evaluate(() => ({
    html: document.documentElement.lang,
    title: document.title,
    headings: [...document.querySelectorAll(".article-body h2")].slice(0, 6).map((h) => ({ lang: h.getAttribute("lang"), text: h.textContent.trim().slice(0, 50) })),
    paragraphs: [...document.querySelectorAll(".article-body p")].slice(0, 5).map((p) => ({ lang: p.getAttribute("lang"), text: p.textContent.trim().slice(0, 60) })),
    tocLinks: [...document.querySelectorAll("[data-article-toc] a")].slice(0, 6).map((a) => ({ lang: a.getAttribute("lang"), text: a.textContent.trim().slice(0, 40), h: Math.round(a.getBoundingClientRect().height) })),
  }));
  // 404 console/status
  const bad = [];
  page.on("console", (m) => { if (m.type() === "error") bad.push(m.text()); });
  page.on("response", (r) => { if (r.status() >= 400) bad.push(`HTTP ${r.status()} ${r.url()}`); });
  await page.goto(BASE + "/404", { waitUntil: "networkidle" });
  await sleep(600);
  out.notFound = { bad, h1: await page.locator("h1").first().textContent(), title: await page.title() };
  // duplicate ids on home + project
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await sleep(500);
  out.duplicateIds = await page.evaluate(() => {
    const seen = new Map();
    for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) || 0) + 1);
    return [...seen].filter(([, n]) => n > 1);
  });
  // skip link activation
  await page.keyboard.press("Tab");
  const before = await page.evaluate(() => ({ active: document.activeElement?.textContent?.trim(), y: scrollY }));
  await page.keyboard.press("Enter");
  await sleep(900);
  out.skip = {
    before,
    after: await page.evaluate(() => ({ activeTag: document.activeElement?.tagName.toLowerCase(), activeId: document.activeElement?.id, y: Math.round(scrollY), hash: location.hash, targetTop: Math.round(document.getElementById("main-content").getBoundingClientRect().top) })),
  };
  await ctx.close();
}

// ── E. 320px header compression + first-screen composition ──────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 320, height: 844 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(800);
  out.narrow = await page.evaluate(() => {
    const nav = document.querySelector(".site-nav");
    const btn = document.querySelector("#theme-toggle");
    const cs = getComputedStyle(btn);
    return {
      nav: { w: Math.round(nav.getBoundingClientRect().width), scrollW: nav.scrollWidth, display: getComputedStyle(nav).display, gap: getComputedStyle(nav).gap },
      button: { w: Math.round(btn.getBoundingClientRect().width), h: Math.round(btn.getBoundingClientRect().height), flexShrink: cs.flexShrink, minWidth: cs.minWidth, padding: cs.padding, marginRight: cs.marginRight },
      children: [...nav.children].map((c) => ({ tag: c.tagName.toLowerCase(), text: (c.textContent || '').trim().slice(0, 12), w: Math.round(c.getBoundingClientRect().width), shrink: getComputedStyle(c).flexShrink })),
      headerInner: { w: Math.round(document.querySelector(".site-header-inner").getBoundingClientRect().width), gap: getComputedStyle(document.querySelector(".site-header-inner")).gap },
    };
  });
  await ctx.close();
}
for (const [w, h] of [[1440, 900], [390, 844], [320, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);
  out.firstScreen = out.firstScreen || [];
  out.firstScreen.push(await page.evaluate(({ w, h }) => {
    const r = (sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom) }; };
    const visibleText = [...document.querySelectorAll("main h1, main h2, main h3, main p, main a")].filter((el) => { const b = el.getBoundingClientRect(); return b.top < h && b.bottom > 0 && getComputedStyle(el).visibility !== "hidden"; }).map((el) => ({ tag: el.tagName.toLowerCase(), text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 55), top: Math.round(el.getBoundingClientRect().top) }));
    return { w, h, hero: r(".hero"), heroName: r("#hero-name"), heroSide: r(".hero-side"), header: r(".site-header"), projectsTop: Math.round(document.getElementById("projects").getBoundingClientRect().top + scrollY), visibleText: visibleText.slice(0, 18), pageHeight: document.documentElement.scrollHeight };
  }, { w, h }));
  await ctx.close();
}

// ── F. Anchor offsets for each home nav link ────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);
  out.anchors = [];
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  for (const label of ["Work", "Notes", "About"]) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => {
      const h = document.querySelector(".site-header");
      return !h.hasAttribute("data-hidden") && Math.abs(h.getBoundingClientRect().top) < 1;
    }, null, { timeout: 5000 }).catch(() => {});
    await sleep(200);
    await page.locator(".site-nav a", { hasText: label }).first().click({ timeout: 5000 }).catch(() => {});
    await sleep(1100);
    out.anchors.push(await page.evaluate((label) => {
      const id = label === "Work" ? "projects" : label === "Notes" ? "writing" : "about";
      const heading = document.querySelector(`#${id} h2`);
      const link = [...document.querySelectorAll(".site-nav a")].find((a) => a.textContent.trim() === label);
      const lr = link.getBoundingClientRect();
      const hit = document.elementFromPoint(lr.x + lr.width / 2, lr.y + lr.height / 2);
      return {
        label, hash: location.hash, sectionTop: Math.round(document.getElementById(id).getBoundingClientRect().top),
        headingTop: heading ? Math.round(heading.getBoundingClientRect().top) : null,
        headerHidden: document.querySelector(".site-header").hasAttribute("data-hidden"),
        headerTop: Math.round(document.querySelector(".site-header").getBoundingClientRect().top),
        active: document.querySelector("[data-current]")?.textContent?.trim() || null,
        navLinkClickable: !!hit && (hit === link || link.contains(hit)),
      };
    }, label));
  }
  await ctx.close();
}


// ── G. Anchor navigation: focus after jump, tab after jump, nav reachability ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await page.locator(".site-nav a", { hasText: "Work" }).first().click();
  await sleep(1200);
  const afterJump = await page.evaluate(() => {
    const a = document.activeElement;
    const r = a.getBoundingClientRect();
    const nav = document.querySelector(".site-nav");
    const nr = nav.getBoundingClientRect();
    const navLink = [...document.querySelectorAll(".site-nav a")].find((x) => x.textContent.trim() === "Notes");
    const lr = navLink.getBoundingClientRect();
    const hit = document.elementFromPoint(lr.x + lr.width / 2, lr.y + lr.height / 2);
    return {
      hash: location.hash, scrollY: Math.round(scrollY),
      active: { tag: a.tagName.toLowerCase(), text: (a.textContent || "").trim().slice(0, 30), href: a.getAttribute("href") },
      activeRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      activeInViewport: r.bottom > 0 && r.top < innerHeight,
      headerTop: Math.round(document.querySelector(".site-header").getBoundingClientRect().top),
      headerHidden: document.querySelector(".site-header").hasAttribute("data-hidden"),
      navRect: { y: Math.round(nr.y), h: Math.round(nr.height) },
      notesLinkRect: { x: Math.round(lr.x), y: Math.round(lr.y), w: Math.round(lr.width), h: Math.round(lr.height) },
      notesHit: hit ? { tag: hit.tagName.toLowerCase(), isLink: hit === navLink || navLink.contains(hit), text: (hit.textContent || "").trim().slice(0, 20) } : null,
    };
  });
  await page.keyboard.press("Tab");
  await sleep(150);
  const tab1 = await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return { text: (a.textContent || "").trim().slice(0, 30), y: Math.round(r.y), inViewport: r.bottom > 0 && r.top < innerHeight }; });
  await page.keyboard.press("Tab");
  await sleep(150);
  const tab2 = await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return { text: (a.textContent || "").trim().slice(0, 30), y: Math.round(r.y), inViewport: r.bottom > 0 && r.top < innerHeight }; });
  // reveal header by scrolling up, then jump to Notes
  await page.evaluate(() => window.scrollBy(0, -160));
  await sleep(700);
  await page.locator(".site-nav a", { hasText: "Notes" }).first().click();
  await sleep(1100);
  const notesJump = await page.evaluate(() => ({ hash: location.hash, headerHidden: document.querySelector(".site-header").hasAttribute("data-hidden"), headerTop: Math.round(document.querySelector(".site-header").getBoundingClientRect().top), writingTop: Math.round(document.getElementById("writing").getBoundingClientRect().top) }));
  out.anchorFocus = { afterJump, tab1, tab2, notesJump };
  await ctx.close();
}

// ── H. Article TOC: desktop rail links, collapse, jump ───────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/post/idempotency-keys-what-most-tutorials-dont-tell-you", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(800);
  const toc = await page.evaluate(() => {
    const d = document.querySelector("[data-article-toc]");
    const nav = d.querySelector("nav");
    const links = [...d.querySelectorAll("a")];
    return {
      open: d.open, rect: (() => { const r = d.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
      overflow: getComputedStyle(d).overflow, navRect: (() => { const r = nav.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
      links: links.map((a) => { const r = a.getBoundingClientRect(); const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { text: a.textContent.trim().slice(0, 30), href: a.getAttribute("href"), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, hit: hit ? (hit === a || a.contains(hit)) : false, current: a.getAttribute("aria-current") }; }),
    };
  });
  await page.locator("[data-article-toc] a").nth(1).click();
  await sleep(900);
  const tocJump = await page.evaluate(() => ({ hash: location.hash, headerTop: Math.round(document.querySelector(".site-header").getBoundingClientRect().top), headerHidden: document.querySelector(".site-header").hasAttribute("data-hidden"), targetTop: Math.round(document.getElementById("tldr").getBoundingClientRect().top), current: document.querySelector("[data-toc-link][aria-current]")?.textContent?.trim() }));
  await page.locator("[data-article-toc] summary").click();
  await sleep(250);
  const collapsed = await page.evaluate(() => { const d = document.querySelector("[data-article-toc]"); const a = d.querySelector("a"); const r = a.getBoundingClientRect(); return { open: d.open, linkVisible: r.width > 0 && r.height > 0, detailsH: Math.round(d.getBoundingClientRect().height) }; });
  await page.locator("[data-article-toc] summary").click();
  await sleep(250);
  out.articleToc = { toc, tocJump, collapsed };
  await ctx.close();
}

// ── I. Project rail, diagram mobile scroll/enlarge, next case study ──────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/project/gencourse", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(800);
  const rail = await page.evaluate(() => {
    const nav = document.querySelector("nav[aria-label='On this page']");
    const links = nav ? [...nav.querySelectorAll("a")] : [];
    return {
      display: nav ? getComputedStyle(nav).display : null,
      links: links.map((a) => { const r = a.getBoundingClientRect(); return { text: a.textContent.trim(), href: a.getAttribute("href"), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, current: a.getAttribute("aria-current") }; }),
      stickyTop: nav ? getComputedStyle(nav.parentElement).top : null,
      next: (() => { const a = [...document.querySelectorAll("main a")].find((x) => x.textContent.includes("Next case study")); return a ? { href: a.getAttribute("href"), rect: (() => { const r = a.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })() } : null; })(),
    };
  });
  await page.evaluate(() => document.getElementById("system-architecture")?.scrollIntoView({ block: "center" }));
  await sleep(700);
  const railScrolled = await page.evaluate(() => {
    const nav = document.querySelector("nav[aria-label='On this page']");
    const r = nav.getBoundingClientRect();
    return { navTop: Math.round(r.top), current: document.querySelector("[data-case-link][aria-current]")?.textContent?.trim() || null, headerHidden: document.querySelector(".site-header").hasAttribute("data-hidden") };
  });
  // diagram scroll + enlarge on desktop
  const frame = await page.evaluate(() => { const f = document.querySelector("[data-diagram]"); const b = document.querySelector("[data-diagram-enlarge]"); return { frame: { clientW: f.clientWidth, scrollW: f.scrollWidth, clientH: f.clientHeight, scrollH: f.scrollHeight, tabindex: f.tabIndex }, enlarge: { display: getComputedStyle(b).display, rect: (() => { const r = b.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })() } }; });
  await page.locator("[data-diagram-enlarge]").click();
  await sleep(600);
  const dialog = await page.evaluate(() => { const d = document.querySelector("[data-diagram-viewer]"); const c = d.querySelector("[data-diagram-canvas]"); const s = c.querySelector("svg"); const a = document.activeElement; return { open: d.open, closeFocused: a === d.querySelector("[data-diagram-close]"), canvas: { clientW: c.clientWidth, scrollW: c.scrollWidth, clientH: c.clientHeight, scrollH: c.scrollHeight }, svg: s ? { w: Math.round(s.getBoundingClientRect().width), h: Math.round(s.getBoundingClientRect().height) } : null }; });
  await page.keyboard.press("Escape");
  await sleep(500);
  const dialogClosed = await page.evaluate(() => ({ open: document.querySelector("[data-diagram-viewer]").open, focusReturned: document.activeElement === document.querySelector("[data-diagram-enlarge]") }));
  out.projectRail = { rail, railScrolled, frame, dialog, dialogClosed };
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/project/gencourse", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(800);
  const m = await page.evaluate(() => {
    const f = document.querySelector("[data-diagram]");
    const b = document.querySelector("[data-diagram-enlarge]");
    const nav = document.querySelector("nav[aria-label='On this page']");
    return {
      frame: { clientW: f.clientWidth, scrollW: f.scrollWidth },
      enlarge: { display: getComputedStyle(b).display, rect: (() => { const r = b.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })() },
      onThisPage: nav ? getComputedStyle(nav).display : null,
      next: (() => { const a = [...document.querySelectorAll("main a")].find((x) => x.textContent.includes("Next case study")); return a ? a.getAttribute("href") : null; })(),
    };
  });
  await page.locator("[data-diagram-enlarge]").click();
  await sleep(600);
  const dlg = await page.evaluate(() => { const d = document.querySelector("[data-diagram-viewer]"); const c = d.querySelector("[data-diagram-canvas]"); const s = c.querySelector("svg"); return { open: d.open, closeFocused: document.activeElement === d.querySelector("[data-diagram-close]"), canvas: { clientW: c.clientWidth, scrollW: c.scrollWidth }, svg: s ? { w: Math.round(s.getBoundingClientRect().width) } : null, dialog: (() => { const r = d.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })() }; });
  await page.keyboard.press("Escape");
  await sleep(500);
  const closed = await page.evaluate(() => ({ open: document.querySelector("[data-diagram-viewer]").open, focusReturned: document.activeElement === document.querySelector("[data-diagram-enlarge]") }));
  out.projectMobileRail = { m, dlg, closed };
  await ctx.close();
}

// ── J. Theme switch frames + light focus ring on header controls ─────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(800);
  await page.locator("#theme-toggle").click();
  const frames = [];
  for (const wait of [60, 120, 260, 500, 900]) {
    await sleep(wait === 60 ? 60 : wait - frames.at(-1).t);
    frames.push(await page.evaluate((t) => {
      const root = document.documentElement;
      const body = document.body;
      return {
        t,
        light: root.classList.contains("light"),
        switching: root.classList.contains("theme-switching"),
        htmlBg: getComputedStyle(root).backgroundColor,
        bodyBg: getComputedStyle(body).backgroundColor,
        bodyColor: getComputedStyle(body).color,
        label: document.querySelector("#theme-toggle")?.getAttribute("aria-label"),
        vt: [...document.getAnimations()].filter((a) => a.constructor.name === "CSSTransition" || a.effect?.pseudoElement?.includes("view-transition")).slice(0, 3).map((a) => ({ name: a.transitionProperty || a.animationName, pseudo: a.effect?.pseudoElement, play: a.playState, time: Math.round(a.currentTime || 0) })),
      };
    }, wait));
  }
  // light focus ring directly on header controls
  const lightFocus = await page.evaluate(() => {
    const out = [];
    for (const sel of ["#theme-toggle", ".site-nav a[data-nav-section='projects']", ".site-header a[href='/']"]) {
      const el = document.querySelector(sel);
      el.focus();
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.push({ sel, outline: cs.outline, offset: cs.outlineOffset, rect: { w: Math.round(r.width), h: Math.round(r.height) }, bg: getComputedStyle(document.documentElement).backgroundColor });
    }
    return out;
  });
  out.themeFrames = frames;
  out.lightFocus = lightFocus;
  await ctx.close();
}

// ── K. Home IA: section-level links to /writing and /about ──────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(800);
  out.homeIa = await page.evaluate(() => {
    const sec = (id) => document.getElementById(id);
    const links = (el) => [...el.querySelectorAll("a")].map((a) => ({ text: (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40), href: a.getAttribute("href") }));
    const writing = sec("writing");
    const about = sec("about");
    const footer = document.querySelector("footer");
    return {
      writingLinks: links(writing),
      aboutLinks: links(about),
      writingHasIndex: !!writing.querySelector("a[href='/writing']"),
      aboutHasPage: !!about.querySelector("a[href='/about']"),
      footerIndexLinks: [...footer.querySelectorAll("a")].filter((a) => ["/writing", "/about"].includes(a.getAttribute("href"))).map((a) => ({ text: a.textContent.trim().slice(0, 20), href: a.getAttribute("href") })),
      postCount: writing.querySelectorAll("article").length,
      noteHrefs: [...writing.querySelectorAll("a[href^='/post/']")].map((a) => a.getAttribute("href")),
    };
  });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 1));
