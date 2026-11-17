// Renders each case-study architecture diagram to static SVG, once per theme, so the
// site ships no Mermaid JavaScript. Run `npm run diagrams` after editing a `diagram:`
// block in src/content/projects and commit the regenerated files.
//
// Uses the installed Google Chrome (or the browser at CHROME_PATH) through playwright-core.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = fileURLToPath(new URL("..", import.meta.url));
const projectsDir = join(root, "src/content/projects");
const outputDir = join(root, "src/generated/diagrams");
const mermaidPath = join(root, "node_modules/mermaid/dist/mermaid.min.js");
const globalCss = readFileSync(join(root, "src/styles/global.css"), "utf8");

// Same stack the page uses, so labels measure with the real web font.
const FONT = '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif';

// Reads the custom properties of one theme block from global.css, so diagram colors stay
// in step with the site palette.
function themeTokens(selector) {
  const start = globalCss.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Theme block "${selector}" not found in global.css`);
  const body = globalCss.slice(start, globalCss.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
}

function mermaidConfig(tokens) {
  return {
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    fontFamily: FONT,
    themeVariables: {
      background: tokens["bg"],
      primaryColor: tokens["text-heading"],
      primaryTextColor: tokens["bg"],
      primaryBorderColor: tokens["text-muted"],
      secondaryColor: tokens["bg"],
      secondaryTextColor: tokens["text-heading"],
      secondaryBorderColor: tokens["text-muted"],
      lineColor: tokens["text-muted"],
      textColor: tokens["text-heading"],
    },
    flowchart: { curve: "basis", htmlLabels: false, useMaxWidth: true },
  };
}

// Mermaid's static output embeds one <style> block covering every shape/feature the
// renderer knows about (clusters, icon-shapes, tooltips, error states, dash animations,
// "neo" look, katex, …), even when a given diagram uses none of them. Since these are
// frozen, non-interactive SVGs (no hover states, no JS), a rule whose selector never
// matches anything in the markup can only ever be dead weight. Strip those rules and
// collapse incidental whitespace; keep every rule that could possibly apply, so the
// diagram stays pixel-identical.
function minifySvg(svg) {
  const styleMatch = svg.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) return svg.replace(/>\s+</g, "><").trim();

  const markupWithoutStyle = svg.slice(0, styleMatch.index) + svg.slice(styleMatch.index + styleMatch[0].length);
  const usedClasses = new Set([...markupWithoutStyle.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)));
  const usedTags = new Set([...markupWithoutStyle.matchAll(/<([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
  const usedAttrs = new Set([...markupWithoutStyle.matchAll(/\s([\w-]+)=/g)].map((m) => m[1]));

  // A selector survives if every one of its comma-separated parts could match something
  // real: the diagram's own id/root selectors, an element tag that's actually in the
  // markup, a class that's actually applied, or an attribute selector that's in use.
  // Every rule here is prefixed with the diagram's own "#diagram-<id>-<theme>" id (so a
  // leading "#…" token is always live — it's not what makes a rule dead weight); pseudo-
  // classes, combinators and bracket text are stripped before the check so e.g.
  // ".node.clickable" is judged on "node" and "clickable", not the dot between them.
  function selectorIsLive(selector) {
    const trimmed = selector.trim();
    if (trimmed === "" || trimmed === ":root") return true;
    const tokens = trimmed
      .replace(/::?[\w-]+(\([^)]*\))?/g, "")
      .split(/[\s>+~]+/)
      .filter(Boolean);
    return tokens.every((token) => {
      if (token.startsWith("[")) {
        const attr = token.match(/\[([\w-]+)/)?.[1];
        return attr ? usedAttrs.has(attr) : true;
      }
      const parts = token.match(/[.#]?[\w-]+/g) ?? [];
      return parts.every((part) => {
        if (part.startsWith(".")) return usedClasses.has(part.slice(1));
        if (part.startsWith("#")) return true;
        return usedTags.has(part) || part === "*";
      });
    });
  }

  const css = styleMatch[1];
  const keptRules = [];
  const usedAnimationNames = new Set();

  // Split top-level rules (the style has no nested @media here, so brace-depth 0 is enough).
  let depth = 0;
  let ruleStart = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        const rule = css.slice(ruleStart, i + 1);
        ruleStart = i + 1;
        if (/^@keyframes/.test(rule.trim())) {
          keptRules.push({ rule, kind: "keyframes", name: rule.match(/^@keyframes\s+([\w-]+)/)?.[1] });
          continue;
        }
        const braceIndex = rule.indexOf("{");
        const selectorList = rule.slice(0, braceIndex);
        const body = rule.slice(braceIndex);
        const selectors = selectorList.split(",");
        const liveSelectors = selectors.filter(selectorIsLive);
        if (liveSelectors.length === 0) continue;
        for (const match of body.matchAll(/animation(?:-name)?:\s*([\w-]+)/g)) usedAnimationNames.add(match[1]);
        keptRules.push({ rule: liveSelectors.join(",") + body, kind: "rule" });
      }
    }
  }

  const minifiedCss = keptRules
    .filter((entry) => entry.kind === "rule" || usedAnimationNames.has(entry.name))
    .map((entry) => entry.rule)
    .join("");

  return (svg.slice(0, styleMatch.index) + `<style>${minifiedCss}</style>` + svg.slice(styleMatch.index + styleMatch[0].length))
    .replace(/>\s+</g, "><")
    .trim();
}

// The `diagram: |` block scalar in a project's frontmatter, dedented.
function extractDiagram(markdown) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => /^ {2}diagram: \|\s*$/.test(line));
  if (start === -1) return undefined;

  const block = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() !== "" && !/^ {4}/.test(line)) break;
    block.push(line);
  }
  const indent = Math.min(...block.filter((line) => line.trim()).map((line) => line.match(/^ */)[0].length));
  return block.map((line) => line.slice(indent)).join("\n").trim();
}

const diagrams = readdirSync(projectsDir)
  .filter((file) => /\.mdx?$/.test(file))
  .map((file) => ({ id: file.replace(/\.mdx?$/, ""), source: extractDiagram(readFileSync(join(projectsDir, file), "utf8")) }))
  .filter((entry) => entry.source);

const themes = {
  dark: mermaidConfig(themeTokens(":root")),
  light: mermaidConfig(themeTokens(":root.light")),
};

const executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch({ channel: executablePath ? undefined : "chrome", executablePath });

try {
  const page = await browser.newPage();
  await page.setContent(
    `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=block"></head><body></body></html>`,
    { waitUntil: "load" },
  );
  await page.addScriptTag({ path: mermaidPath });
  await page.evaluate(() => document.fonts.load('400 16px "Plus Jakarta Sans"'));

  mkdirSync(outputDir, { recursive: true });
  const expected = new Set();

  for (const { id, source } of diagrams) {
    for (const [theme, config] of Object.entries(themes)) {
      const svg = await page.evaluate(
        async ({ renderId, source, config }) => {
          mermaid.initialize(config);
          const { svg } = await mermaid.render(renderId, source);
          return svg;
        },
        { renderId: `diagram-${id}-${theme}`, source, config },
      );
      const file = `${id}.${theme}.svg`;
      expected.add(file);
      writeFileSync(join(outputDir, file), `${minifySvg(svg)}\n`);
      console.log(`rendered ${file}`);
    }
  }

  for (const file of readdirSync(outputDir)) {
    if (file.endsWith(".svg") && !expected.has(file)) rmSync(join(outputDir, file));
  }
} finally {
  await browser.close();
}
