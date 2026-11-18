/**
 * Reads a case study's Mermaid flowchart (the `diagram:` block) and turns its pre-rendered SVG into a map keyed to its
 * legend: each node a component explains becomes a link to that component's legend item. Pure functions, no Astro
 * imports, so the content schema can use `parseDiagram` to check node ids at build time.
 */

export type NodeLabels = Record<string, string>;
export interface NodeTarget {
  href: string;
  label: string;
}
export interface Component {
  nodes: string[];
  detail: string;
}
export interface Feature {
  text: string;
  nodes: string[];
}
export interface Chapter {
  id: string;
  title: string;
  nodes: string[];
  detail: string;
  features: string[];
}
export interface ProductFeature {
  text: string;
  nodes: string[];
}

const ARROW = /\s*(?:<-->|-->|<-\.->|-\.->|---|==>)\s*/;
const STATEMENT = /^(flowchart|graph|subgraph|end|style|classDef|class|linkStyle|click|%%)\b/i;
const NODE = /^([A-Za-z_][\w-]*)\s*(?:\[\(\s*"([^"]*)"\s*\)\]|\[\s*"([^"]*)"\s*\]|\(\s*"([^"]*)"\s*\)|\{\s*"([^"]*)"\s*\})?$/;

/** Every node id in a flowchart, with its label ("" for a node that is only ever referred to). */
export function parseDiagram(source: string): NodeLabels {
  const nodes: NodeLabels = {};
  for (const raw of source.split("\n")) {
    const line = raw.trim();
    if (!line || STATEMENT.test(line)) continue;
    for (const part of line.replace(/\|[^|]*\|/g, "").split(ARROW)) {
      const match = part.trim().match(NODE);
      if (!match) continue;
      const label = match[2] ?? match[3] ?? match[4] ?? match[5];
      if (label !== undefined) nodes[match[1]] = label;
      else nodes[match[1]] ??= "";
    }
  }
  return nodes;
}

/**
 * Groups the case study's lines into legend items, one per component that names a node, plus the lines that stay out
 * of them. A feature lands in the first item that shares one of its nodes, otherwise it stays with the product (keeping
 * its nodes, so the map can still show where it lives).
 */
export function buildChapters(components: Component[], features: Feature[], labels: NodeLabels) {
  const used = new Set<string>();
  const chapters: Chapter[] = [];
  const tooling: string[] = [];

  components.forEach((component, index) => {
    if (!component.nodes.length) {
      tooling.push(component.detail);
      return;
    }
    let id = `component-${component.nodes[0]}`;
    if (used.has(id)) id += `-${index + 1}`;
    used.add(id);
    chapters.push({
      id,
      title: labels[component.nodes[0]] || component.nodes[0],
      nodes: component.nodes,
      detail: component.detail,
      features: [],
    });
  });

  const productFeatures: ProductFeature[] = [];
  for (const feature of features) {
    const home = feature.nodes.length ? chapters.find((chapter) => chapter.nodes.some((node) => feature.nodes.includes(node))) : undefined;
    if (home) home.features.push(feature.text);
    else productFeatures.push({ text: feature.text, nodes: feature.nodes });
  }

  // A node links to the first legend item that names it.
  const targets: Record<string, NodeTarget> = {};
  for (const chapter of chapters) {
    for (const node of chapter.nodes) targets[node] ??= { href: `#${chapter.id}`, label: labels[node] || node };
  }

  return { chapters, tooling, productFeatures, targets };
}

const escapeAttribute = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Marks every node of a pre-rendered diagram with `data-node` (so the legend can light it), and wraps each node that
 * has a legend item in a link to that item.
 */
export function enhanceDiagram(svg: string, options: { idBase: string; targets: Record<string, NodeTarget> }): string {
  const { idBase, targets } = options;
  const pattern = new RegExp(`<g class="node[^"]*" id="${idBase}-flowchart-(.+?)-\\d+"`, "g");
  let result = svg;

  for (const hit of [...svg.matchAll(pattern)].reverse()) {
    const start = hit.index ?? 0;
    const nodeId = hit[1];
    const target = targets[nodeId];

    const openEnd = result.indexOf(">", start) + 1;
    const tags = /<g\b|<\/g>/g;
    tags.lastIndex = openEnd;
    let depth = 1;
    let end = -1;
    for (let tag = tags.exec(result); tag; tag = tags.exec(result)) {
      depth += tag[0] === "</g>" ? -1 : 1;
      if (depth === 0) {
        end = tag.index + tag[0].length;
        break;
      }
    }
    if (end === -1) continue;

    const marked = `<g data-node="${escapeAttribute(nodeId)}"${result.slice(start + 2, end)}`;
    const wrapped = target ? `<a href="${target.href}" aria-label="${escapeAttribute(target.label)}">${marked}</a>` : marked;
    result = result.slice(0, start) + wrapped + result.slice(end);
  }

  return result;
}
