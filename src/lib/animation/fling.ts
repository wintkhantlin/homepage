import { reducedMotion } from './spring';
import { emit, clearDebris, type DebrisKind } from './particles';

/** Letters you can pick up and throw, each a rigid body with its own shape and material.
 *
 * Shape is measured from the glyph itself: its ink gives the mass, the true centre of mass, the radius of gyration
 * (I = m·k²) and a convex hull for contact. An L hangs from its heavy foot; an o rolls.
 * Material sets density, restitution, friction and softness: iron lands dead, rubber bounces, cork floats down,
 * jelly squashes and wobbles.
 *
 * Held: the letter hangs from the exact point you grabbed, a rigid pendulum. Gravity and the hand's own acceleration
 *   swing it about that point: I_p·α = r × m(g − a_hand) − c·ω, with I_p = m(|r|² + k²).
 * Thrown: gravity, air drag in proportion to area over mass, and impulse contacts with the window's edges at the hull
 *   point that touches: normal impulse with restitution, Coulomb friction (|j_t| ≤ μ·j_n), so a letter landing on a
 *   corner tips over and a sliding one starts to roll.
 * Then its elastic tether takes up the slack and reels it home, slower for heavier letters.
 *
 * In flight the letter is a fixed-position stand-in, so no overflow can clip it; the original keeps its place, invisible.
 * Positions are viewport pixels, time is seconds, angles are radians, clockwise-positive as on screen.
 */

export type Material = {
  name: string;
  /** Relative to oak. */
  density: number;
  restitution: number;
  friction: number;
  /** 0 rigid … 1 jelly: how much an impact squashes it. */
  softness: number;
  /** Natural frequency of its squash, rad/s. */
  wobble: number;
  /** What a hard enough blow knocks off it, and how hard (approach speed, px/s) that blow has to be. */
  debris?: DebrisKind[];
  debrisAt?: number;
  /** Metal scraped fast along an edge throws sparks. */
  scrapes?: boolean;
  /** Rings after a blow: a fast vibration that dies away. */
  rings?: boolean;
  /** Sticks where it splats, slides down, then lets go. */
  sticky?: boolean;
  /** Cracks from where it is struck, and shatters under a hard enough blow. */
  brittle?: boolean;
};

export const MATERIALS: Record<string, Material> = {
  iron: { name: 'iron', density: 4, restitution: 0.2, friction: 0.45, softness: 0, wobble: 0, debris: ['spark'], debrisAt: 650, scrapes: true },
  steel: { name: 'steel', density: 3.8, restitution: 0.45, friction: 0.3, softness: 0, wobble: 0, debris: ['spark'], debrisAt: 650, scrapes: true, rings: true },
  concrete: { name: 'concrete', density: 2.3, restitution: 0.1, friction: 0.9, softness: 0, wobble: 0, debris: ['chip', 'dust'], debrisAt: 400 },
  glass: { name: 'glass', density: 2.5, restitution: 0.6, friction: 0.15, softness: 0, wobble: 0, brittle: true },
  oak: { name: 'oak', density: 1, restitution: 0.4, friction: 0.55, softness: 0.05, wobble: 60, debris: ['splinter'], debrisAt: 950 },
  rubber: { name: 'rubber', density: 1.2, restitution: 0.85, friction: 1, softness: 0.45, wobble: 32 },
  cork: { name: 'cork', density: 0.3, restitution: 0.5, friction: 0.7, softness: 0.15, wobble: 45, debris: ['crumb'], debrisAt: 450 },
  jelly: { name: 'jelly', density: 1, restitution: 0.3, friction: 0.9, softness: 1, wobble: 15, debris: ['droplet'], debrisAt: 900, sticky: true },
};
const ANY = Object.keys(MATERIALS);

const STEP = 1 / 120;
const GRAVITY = 2600;
// Linear air drag for oak, 1/s; lighter materials (more area per mass) drag more.
const AIR = 0.3;
const ANGULAR_AIR = 1;
// Below this approach speed a contact doesn't bounce, so resting letters sit still instead of buzzing.
const REST_SPEED = 90;
// The hand is a stiff, nearly critically damped grip, so the pivot's acceleration stays smooth enough to swing from.
const GRIP = 1400;
const GRIP_DAMPING = 2 * 0.9 * Math.sqrt(GRIP);
const SWING_DAMPING = 2.2;
// The tether engages after this long in the air, or once the letter has lain still on the floor briefly.
const RETURN_AFTER = 1.8;
const SETTLE_ON_FLOOR = 0.4;
// The tether's natural frequency at full tension for an oak letter of typical size, rad/s.
const TETHER = 13;
const TETHER_RAMP = 0.6;
// Mass of a typical glyph (ink area in em², times density): the reference the tether is tuned for.
const REFERENCE_MASS = 0.12;
const TURN = Math.PI * 2;
// Steel's ring: frequency (Hz) and how fast it dies away (1/s).
const RING_HZ = 26;
const RING_DECAY = 5;
// Glass cracks under a blow this hard, and shatters under one this hard (or once it is badly cracked).
const CRACK_AT = 600;
const SHATTER_AT = 1500;
const SHATTER_CRACKS = 3;
const SHARDS = 8;
// Shards lie where they fell this long before they are drawn back together.
const REASSEMBLE_AFTER = 1.1;
// Jelly holds onto a wall this long (the ceiling a little less) before it drops.
const STICK_WALL = 1.2;
const STICK_CEILING = 0.8;

type Point = [number, number];
type Shape = {
  width: number;
  height: number;
  /** Centre of mass, from the box centre. */
  cx: number;
  cy: number;
  /** Ink area in em². */
  area: number;
  /** Radius of gyration about the centre of mass, px. */
  gyration: number;
  /** Convex hull of the ink, about the centre of mass, unrotated. */
  hull: Point[];
};

type Hold = { pointer: number; handX: number; handY: number; pivotX: number; pivotY: number; pivotVX: number; pivotVY: number; rx: number; ry: number };

type Flight = {
  source: HTMLElement;
  ghost: HTMLElement;
  label: HTMLElement;
  shape: Shape;
  material: Material;
  mass: number;
  inertia: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  squash: number;
  squashSpeed: number;
  /** How much of the material's surface shows: all of it in the hand and in the air, none by the time it is home. */
  reveal: number;
  squashX: number;
  squashY: number;
  hold: Hold | null;
  airborne: number;
  onFloor: number;
  tether: number;
  ring: number;
  ringTime: number;
  stuck: { nx: number; ny: number; time: number } | null;
  cracks: string[];
};

type Impact = { speed: number; slide: number; x: number; y: number; nx: number; ny: number; rx: number; ry: number };

type Shard = { element: HTMLElement; sx: number; sy: number; x: number; y: number; vx: number; vy: number; angle: number; spin: number; radius: number };
type Shatter = { source: HTMLElement; shape: Shape; shards: Shard[]; age: number };
const shatters = new Map<HTMLElement, Shatter>();

const flights = new Map<HTMLElement, Flight>();
let frame = 0;
let lastTime = 0;
let accumulator = 0;

function materialOf(element: HTMLElement): Material {
  const named = element.dataset.material;
  if (named && MATERIALS[named]) return MATERIALS[named];
  // Every other letter still has a material of its own: the same character is always made of the same thing.
  let hash = 7;
  for (const character of element.textContent ?? '') hash = (hash * 31 + character.codePointAt(0)!) >>> 0;
  return MATERIALS[ANY[hash % ANY.length]];
}

function convexHull(points: Point[]): Point[] {
  const sorted = points.toSorted((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) return sorted;
  const cross = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (const p of sorted.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** Renders the glyph exactly as the page sets it and integrates its ink. */
function measure(element: HTMLElement, style: CSSStyleDeclaration): Shape {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const size = Number.parseFloat(style.fontSize);
  const box: Shape = {
    width, height, cx: 0, cy: 0, area: (width * height * 0.35) / (size * size), gyration: Math.min(width, height) * 0.35,
    hull: [[-width / 2, -height / 2], [width / 2, -height / 2], [width / 2, height / 2], [-width / 2, height / 2]],
  };
  const pad = Math.ceil(size * 0.4);
  const canvas = document.createElement('canvas');
  canvas.width = width + pad * 2;
  canvas.height = height + pad * 2;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const text = element.textContent ?? '';
  if (!context || !text.trim()) return box;

  // The hero swells its weight through font-variation-settings; the canvas takes that weight in the font shorthand.
  const variable = /"wght"\s+([\d.]+)/u.exec(style.fontVariationSettings)?.[1];
  context.font = `${style.fontStyle} ${variable ?? style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const metrics = context.measureText(text);
  // CSS half-leading: the font's ascent + descent sit centred in the line box.
  const baseline = (height - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent)) / 2 + metrics.fontBoundingBoxAscent;
  context.fillText(text, pad, pad + baseline);

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let mass = 0;
  let sumX = 0;
  let sumY = 0;
  let sumSquares = 0;
  const solid: Point[] = [];
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const alpha = data[(y * canvas.width + x) * 4 + 3] / 255;
      if (alpha < 0.02) continue;
      const px = x + 0.5;
      const py = y + 0.5;
      mass += alpha;
      sumX += alpha * px;
      sumY += alpha * py;
      sumSquares += alpha * (px * px + py * py);
      if (alpha > 0.5) solid.push([px, py]);
    }
  }
  if (mass < 1 || solid.length < 3) return box;
  const centreX = sumX / mass;
  const centreY = sumY / mass;
  return {
    width,
    height,
    cx: centreX - pad - width / 2,
    cy: centreY - pad - height / 2,
    area: mass / (size * size),
    // Parallel-axis theorem: Σr² about the centroid = Σ(x² + y²) − m·|c|².
    gyration: Math.sqrt(Math.max(1, sumSquares / mass - centreX * centreX - centreY * centreY)),
    hull: convexHull(solid).map(([px, py]) => [px - centreX, py - centreY] as Point),
  };
}

const home = (flight: Flight) => {
  const rect = flight.source.getBoundingClientRect();
  return { x: rect.left + rect.width / 2 + flight.shape.cx, y: rect.top + rect.height / 2 + flight.shape.cy };
};

function render(flight: Flight) {
  const { shape } = flight;
  const originX = shape.width / 2 + shape.cx;
  const originY = shape.height / 2 + shape.cy;
  // Squash runs along the impact's normal, in the window's axes, so it is applied after the letter's own rotation.
  const along = 1 - flight.squash;
  const across = 1 + flight.squash * 0.5;
  const scaleX = Math.abs(flight.squashX) > Math.abs(flight.squashY) ? along : across;
  const scaleY = Math.abs(flight.squashX) > Math.abs(flight.squashY) ? across : along;
  flight.ghost.style.setProperty('--reveal', flight.reveal.toFixed(3));
  flight.ghost.style.transformOrigin = `${originX.toFixed(2)}px ${originY.toFixed(2)}px`;
  flight.ghost.style.transform =
    `translate3d(${(flight.x - originX).toFixed(2)}px, ${(flight.y - originY).toFixed(2)}px, 0) ` +
    `scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)}) rotate(${(flight.angle + ringOffset(flight)).toFixed(4)}rad)`;
}

const ringOffset = (flight: Flight) => flight.ring * Math.sin(TURN * RING_HZ * flight.ringTime);

function land(flight: Flight) {
  flights.delete(flight.source);
  flight.ghost.remove();
  flight.label.remove();
  flight.source.style.removeProperty('visibility');
}

function stepHeld(flight: Flight, hold: Hold, dt: number) {
  const ax = GRIP * (hold.handX - hold.pivotX) - GRIP_DAMPING * hold.pivotVX;
  const ay = GRIP * (hold.handY - hold.pivotY) - GRIP_DAMPING * hold.pivotVY;
  hold.pivotVX += ax * dt;
  hold.pivotVY += ay * dt;
  hold.pivotX += hold.pivotVX * dt;
  hold.pivotY += hold.pivotVY * dt;

  const cos = Math.cos(flight.angle);
  const sin = Math.sin(flight.angle);
  const rx = hold.rx * cos - hold.ry * sin;
  const ry = hold.rx * sin + hold.ry * cos;
  // In the hand's accelerating frame the letter feels gravity minus the hand's acceleration, at its centre of mass.
  const torque = rx * (GRAVITY - ay) - ry * -ax;
  const inertia = rx * rx + ry * ry + flight.shape.gyration ** 2;
  flight.spin += (torque / inertia - SWING_DAMPING * flight.spin) * dt;
  flight.angle += flight.spin * dt;

  const cos2 = Math.cos(flight.angle);
  const sin2 = Math.sin(flight.angle);
  const nx = hold.rx * cos2 - hold.ry * sin2;
  const ny = hold.rx * sin2 + hold.ry * cos2;
  flight.x = hold.pivotX + nx;
  flight.y = hold.pivotY + ny;
  // The centre's velocity, carried into the throw: the pivot's, plus the swing's ω × r.
  flight.vx = hold.pivotVX - flight.spin * ny;
  flight.vy = hold.pivotVY + flight.spin * nx;
}

/** Impulse contact against one window edge (n·p ≥ d), at the hull point that reaches furthest past it. */
function contact(flight: Flight, nx: number, ny: number, d: number): Impact | null {
  const cos = Math.cos(flight.angle);
  const sin = Math.sin(flight.angle);
  const points = flight.shape.hull.map(([hx, hy]) => {
    const px = hx * cos - hy * sin;
    const py = hx * sin + hy * cos;
    return { px, py, gap: (flight.x + px) * nx + (flight.y + py) * ny - d };
  });
  const deepest = Math.min(...points.map((point) => point.gap));
  if (deepest >= 0) return null;
  // A flat face meets the edge at several hull points at once: act at their middle, as a real face contact would,
  // instead of rocking between its two ends and losing the bounce to spin.
  const touching = points.filter((point) => point.gap < deepest + 1.5);
  const rx = touching.reduce((sum, point) => sum + point.px, 0) / touching.length;
  const ry = touching.reduce((sum, point) => sum + point.py, 0) / touching.length;

  flight.x -= nx * deepest;
  flight.y -= ny * deepest;
  const { material, mass, inertia } = flight;
  const pointVX = flight.vx - flight.spin * ry;
  const pointVY = flight.vy + flight.spin * rx;
  const approach = pointVX * nx + pointVY * ny;
  if (approach >= 0) return null;

  const restitution = -approach < REST_SPEED ? 0 : material.restitution;
  const armN = rx * ny - ry * nx;
  const normal = -(1 + restitution) * approach / (1 / mass + armN * armN / inertia);
  flight.vx += normal * nx / mass;
  flight.vy += normal * ny / mass;
  flight.spin += armN * normal / inertia;

  // Coulomb friction along the edge, at most μ times the normal impulse: sliding turns into rolling.
  const tx = -ny;
  const ty = nx;
  const slide = (flight.vx - flight.spin * ry) * tx + (flight.vy + flight.spin * rx) * ty;
  const sliding = Math.abs(slide);
  const armT = rx * ty - ry * tx;
  const limit = material.friction * normal;
  const friction = Math.max(-limit, Math.min(limit, -slide / (1 / mass + armT * armT / inertia)));
  flight.vx += friction * tx / mass;
  flight.vy += friction * ty / mass;
  flight.spin += armT * friction / inertia;

  // Soft materials store some of the blow as a squash that springs back.
  if (material.softness && -approach > REST_SPEED) {
    flight.squashSpeed += material.softness * -approach / (flight.shape.height || 1) * 0.35;
    flight.squashX = nx;
    flight.squashY = ny;
  }
  return { speed: -approach, slide: sliding, x: flight.x + rx, y: flight.y + ry, nx, ny, rx, ry };
}

/** The contact point in the letter's own box (unrotated), where cracks start. */
function boxPoint(flight: Flight, rx: number, ry: number): [number, number] {
  const cos = Math.cos(flight.angle);
  const sin = Math.sin(flight.angle);
  const { shape } = flight;
  return [rx * cos + ry * sin + shape.width / 2 + shape.cx, -rx * sin + ry * cos + shape.height / 2 + shape.cy];
}

/** Jagged fractures radiating from the point of impact, drawn into the glass's surface. */
function crack(flight: Flight, impact: Impact) {
  const [bx, by] = boxPoint(flight, impact.rx, impact.ry);
  const reach = flight.shape.height * (0.45 + Math.min(1, impact.speed / SHATTER_AT) * 0.45);
  const rays = 5 + Math.floor(Math.random() * 3);
  for (let i = 0; i < rays; i++) {
    let angle = (i / rays) * TURN + Math.random() * 0.6;
    let x = bx;
    let y = by;
    let path = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const length = reach * (0.5 + Math.random() * 0.5);
    for (let segment = 0; segment < 3; segment++) {
      angle += (Math.random() - 0.5) * 0.7;
      x += Math.cos(angle) * length / 3;
      y += Math.sin(angle) * length / 3;
      path += `L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    flight.cracks.push(path);
  }
  const { width, height } = flight.shape;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>` +
    `<path d='${flight.cracks.join('')}' fill='none' stroke='white' stroke-opacity='0.9' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
  flight.ghost.style.setProperty('--cracks', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}

/** The glass gives: it breaks into wedges around the point of impact, each its own falling body. */
function shatter(flight: Flight, impact: Impact) {
  const { shape, source, ghost } = flight;
  const [bx, by] = boxPoint(flight, impact.rx, impact.ry);
  const originX = shape.width / 2 + shape.cx;
  const originY = shape.height / 2 + shape.cy;
  const cos = Math.cos(flight.angle);
  const sin = Math.sin(flight.angle);
  const far = Math.max(shape.width, shape.height) * 2;
  const start = Math.random() * TURN;
  const cuts = Array.from({ length: SHARDS + 1 }, (_, i) => start + (i / SHARDS) * TURN + (i % SHARDS ? (Math.random() - 0.5) * 0.5 : 0));
  const shards: Shard[] = [];
  for (let i = 0; i < SHARDS; i++) {
    const a = cuts[i];
    const b = cuts[i + 1];
    const middle = (a + b) / 2;
    const polygon = [[bx, by], [bx + Math.cos(a) * far, by + Math.sin(a) * far], [bx + Math.cos(middle) * far, by + Math.sin(middle) * far], [bx + Math.cos(b) * far, by + Math.sin(b) * far]];
    // The wedge's own centre, roughly: partway from the break toward the far side of the box.
    const toEdge = Math.min(
      Math.abs((Math.cos(middle) > 0 ? shape.width - bx : bx) / (Math.cos(middle) || 1e-6)),
      Math.abs((Math.sin(middle) > 0 ? shape.height - by : by) / (Math.sin(middle) || 1e-6)),
    );
    const sx = bx + Math.cos(middle) * toEdge * 0.55;
    const sy = by + Math.sin(middle) * toEdge * 0.55;
    const element = ghost.cloneNode(true) as HTMLElement;
    element.className = 'fling-shard';
    element.style.clipPath = `polygon(${polygon.map(([px, py]) => `${px.toFixed(1)}px ${py.toFixed(1)}px`).join(',')})`;
    element.style.transformOrigin = `${sx.toFixed(2)}px ${sy.toFixed(2)}px`;
    document.body.append(element);
    const lx = sx - originX;
    const ly = sy - originY;
    const rx = lx * cos - ly * sin;
    const ry = lx * sin + ly * cos;
    const kick = (180 + Math.random() * 320) * Math.min(1, impact.speed / SHATTER_AT);
    const outward = Math.atan2(Math.sin(middle) * cos + Math.cos(middle) * sin, Math.cos(middle) * cos - Math.sin(middle) * sin);
    shards.push({
      element, sx, sy,
      x: flight.x + rx,
      y: flight.y + ry,
      vx: flight.vx - flight.spin * ry + Math.cos(outward) * kick + impact.nx * 120,
      vy: flight.vy + flight.spin * rx + Math.sin(outward) * kick + impact.ny * 120,
      angle: flight.angle,
      spin: flight.spin + (Math.random() - 0.5) * 24,
      radius: Math.max(3, Math.min(shape.width, shape.height) * 0.12),
    });
  }
  emit('glint', impact.x, impact.y, impact.nx, impact.ny, Math.min(1, impact.speed / 3000));
  flights.delete(source);
  ghost.remove();
  flight.label.remove();
  shatters.set(source, { source, shape, shards, age: 0 });
}

/** How each material answers a blow. */
function react(flight: Flight, impact: Impact | null) {
  if (!impact) return;
  const { material } = flight;
  if (material.debris && material.debrisAt && impact.speed > material.debrisAt) {
    const strength = Math.min(1, (impact.speed - material.debrisAt) / 1500 + 0.15);
    for (const kind of material.debris) emit(kind, impact.x, impact.y, impact.nx, impact.ny, strength);
  }
  if (material.rings && impact.speed > 300) {
    flight.ring = Math.max(flight.ring, Math.min(0.05, impact.speed / 30000));
    flight.ringTime = 0;
  }
  if (material.sticky && impact.speed > 350 && flight.tether < 0 && impact.ny !== -1) {
    flight.stuck = { nx: impact.nx, ny: impact.ny, time: 0 };
    flight.vx = 0;
    flight.vy = 0;
    flight.spin = 0;
  }
  if (material.brittle && flight.tether < 0) {
    if (impact.speed > SHATTER_AT || (impact.speed > CRACK_AT && flight.cracks.length >= SHATTER_CRACKS * 5)) shatter(flight, impact);
    else if (impact.speed > CRACK_AT) crack(flight, impact);
  }
}

function stepFree(flight: Flight, target: { x: number; y: number }, dt: number) {
  const { material } = flight;
  flight.airborne += dt;
  if (flight.ring) {
    flight.ringTime += dt;
    flight.ring = flight.ring > 0.0005 ? flight.ring * Math.exp(-RING_DECAY * dt) : 0;
  }

  // Stuck jelly: held to the wall by its own adhesion, it creeps down a side wall, then lets go.
  const { stuck } = flight;
  if (stuck && flight.tether < 0) {
    stuck.time += dt;
    if (stuck.ny === 1) {
      flight.vx *= Math.exp(-8 * dt);
      flight.vy = 0;
    } else {
      flight.vx = 0;
      flight.vy = Math.min(Math.max(flight.vy, 0) + 90 * dt, 45);
    }
    flight.spin *= Math.exp(-10 * dt);
    flight.x += flight.vx * dt;
    flight.y += flight.vy * dt;
    // Flattened against the surface while it holds on.
    flight.squashX = stuck.nx;
    flight.squashY = stuck.ny;
    const w = material.wobble;
    flight.squashSpeed += (-w * w * (flight.squash - 0.18) - 2 * 0.3 * w * flight.squashSpeed) * dt;
    flight.squash += flight.squashSpeed * dt;
    if (stuck.time > (stuck.ny === 1 ? STICK_CEILING : STICK_WALL)) {
      flight.stuck = null;
      flight.vx = stuck.nx * 60;
      flight.vy = stuck.ny * 60;
      flight.squashSpeed -= 2;
    }
    return;
  }
  if (stuck) flight.stuck = null;
  const pull = flight.tether >= 0 ? Math.min(1, flight.tether / TETHER_RAMP) : 0;
  if (flight.tether >= 0) flight.tether += dt;

  // The tether lifts the letter as it tightens, so gravity hands over to it smoothly. Heavier letters answer it slower.
  const frequency = TETHER / Math.sqrt(Math.min(4, Math.max(0.3, flight.mass / REFERENCE_MASS)));
  let ax = 0;
  let ay = GRAVITY * (1 - pull);
  if (pull) {
    const stiffness = frequency * frequency * pull;
    const damping = 2 * 0.85 * frequency * Math.sqrt(pull);
    ax += stiffness * (target.x - flight.x) - damping * flight.vx;
    ay += stiffness * (target.y - flight.y) - damping * flight.vy;
  }
  const drag = Math.exp(-(AIR / material.density) * dt);
  flight.vx = (flight.vx + ax * dt) * drag;
  flight.vy = (flight.vy + ay * dt) * drag;
  flight.x += flight.vx * dt;
  flight.y += flight.vy * dt;

  if (pull) {
    // Upright again by the shortest way round, at the tether's pace.
    const upright = Math.round(flight.angle / TURN) * TURN;
    flight.spin += (-frequency * frequency * pull * (flight.angle - upright) - 2 * 0.9 * frequency * Math.sqrt(pull) * flight.spin) * dt;
  } else {
    flight.spin *= Math.exp(-(ANGULAR_AIR / material.density) * dt);
  }
  flight.angle += flight.spin * dt;

  // The window is the room: walls, ceiling and floor are solid, except a side the letter's home lies beyond
  // (scrolled out of view), so the tether can always reel it back.
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (target.x > 0) react(flight, contact(flight, 1, 0, 0));
  if (flights.has(flight.source) && target.x < width) react(flight, contact(flight, -1, 0, -width));
  if (flights.has(flight.source) && target.y > 0) react(flight, contact(flight, 0, 1, 0));
  if (!flights.has(flight.source)) return;
  let grounded = false;
  if (target.y < height) {
    const floor = contact(flight, 0, -1, -height);
    react(flight, floor);
    if (!flights.has(flight.source)) return;
    // Metal dragged fast along the floor throws a trickle of sparks.
    if (floor && material.scrapes && floor.slide > 450 && Math.random() < dt * 45) {
      emit('spark', floor.x, floor.y, 0, -1, 0.1, 1 + Math.floor(Math.random() * 2));
    }
    // Touching the floor: the deepest hull point is within a pixel of it.
    grounded = flight.shape.hull.some(([hx, hy]) =>
      flight.y + hx * Math.sin(flight.angle) + hy * Math.cos(flight.angle) > height - 1.5);
  }

  // Squash: a damped spring, lightly damped so jelly wobbles.
  if (material.softness) {
    const w = material.wobble;
    flight.squashSpeed += (-w * w * flight.squash - 2 * 0.22 * w * flight.squashSpeed) * dt;
    flight.squash = Math.max(-0.3, Math.min(0.35, flight.squash + flight.squashSpeed * dt));
  }

  const still = Math.hypot(flight.vx, flight.vy) < 40 && Math.abs(flight.spin) < 1;
  flight.onFloor = grounded && still ? flight.onFloor + dt : 0;
  if (flight.tether < 0 && (flight.airborne > RETURN_AFTER || flight.onFloor > SETTLE_ON_FLOOR)) flight.tether = 0;
}

/** Shards fall and settle like gravel, then, once they have lain a moment, are drawn back into the letter. */
function stepShatter(shatter: Shatter, box: DOMRect, dt: number) {
  shatter.age += dt;
  const { shape } = shatter;
  const gather = shatter.age > REASSEMBLE_AFTER ? Math.min(1, (shatter.age - REASSEMBLE_AFTER) / TETHER_RAMP) : 0;
  const frequency = TETHER * 0.9;
  const width = window.innerWidth;
  const height = window.innerHeight;
  for (const shard of shatter.shards) {
    let ax = 0;
    let ay = GRAVITY * (1 - gather);
    if (gather) {
      const goalX = box.left + box.width / 2 - shape.width / 2 + shard.sx;
      const goalY = box.top + box.height / 2 - shape.height / 2 + shard.sy;
      const stiffness = frequency * frequency * gather;
      const damping = 2 * 0.9 * frequency * Math.sqrt(gather);
      ax += stiffness * (goalX - shard.x) - damping * shard.vx;
      ay += stiffness * (goalY - shard.y) - damping * shard.vy;
      const upright = Math.round(shard.angle / TURN) * TURN;
      shard.spin += (-stiffness * (shard.angle - upright) - damping * shard.spin) * dt;
    } else {
      shard.spin *= Math.exp(-0.8 * dt);
    }
    const drag = Math.exp(-0.25 * dt);
    shard.vx = (shard.vx + ax * dt) * drag;
    shard.vy = (shard.vy + ay * dt) * drag;
    shard.x += shard.vx * dt;
    shard.y += shard.vy * dt;
    shard.angle += shard.spin * dt;
    if (!gather) {
      const r = shard.radius;
      if (shard.x < r) { shard.x = r; shard.vx = Math.abs(shard.vx) * 0.4; }
      if (shard.x > width - r) { shard.x = width - r; shard.vx = -Math.abs(shard.vx) * 0.4; }
      if (shard.y > height - r) {
        shard.y = height - r;
        shard.vy = shard.vy > REST_SPEED ? -shard.vy * 0.3 : 0;
        shard.vx *= Math.exp(-6 * dt);
        shard.spin *= Math.exp(-8 * dt);
      }
    }
  }
}

function renderShatter(shatter: Shatter, box: DOMRect): boolean {
  const { shape } = shatter;
  let home = true;
  for (const shard of shatter.shards) {
    const goalX = box.left + box.width / 2 - shape.width / 2 + shard.sx;
    const goalY = box.top + box.height / 2 - shape.height / 2 + shard.sy;
    const distance = Math.hypot(goalX - shard.x, goalY - shard.y);
    home &&= shatter.age > REASSEMBLE_AFTER + TETHER_RAMP && distance < 0.6 && Math.hypot(shard.vx, shard.vy) < 25 &&
      Math.abs(shard.angle - Math.round(shard.angle / TURN) * TURN) < 0.01;
    shard.element.style.setProperty('--reveal', (shatter.age > REASSEMBLE_AFTER ? Math.min(1, distance / (shape.height * 0.6)) : 1).toFixed(3));
    shard.element.style.transform =
      `translate3d(${(shard.x - shard.sx).toFixed(2)}px, ${(shard.y - shard.sy).toFixed(2)}px, 0) rotate(${shard.angle.toFixed(4)}rad)`;
  }
  return home;
}

function mend(shatter: Shatter) {
  shatters.delete(shatter.source);
  for (const shard of shatter.shards) shard.element.remove();
  shatter.source.style.removeProperty('visibility');
}

function tick(time: number) {
  accumulator += Math.min((time - lastTime) / 1000, 0.05) || 1 / 60;
  lastTime = time;
  const targets = new Map([...flights.values()].map((flight) => [flight, home(flight)]));
  const boxes = new Map([...shatters.values()].map((shatter) => [shatter, shatter.source.getBoundingClientRect()]));
  while (accumulator >= STEP) {
    accumulator -= STEP;
    for (const flight of flights.values()) {
      if (flight.hold) stepHeld(flight, flight.hold, STEP);
      else stepFree(flight, targets.get(flight)!, STEP);
    }
    for (const shatter of shatters.values()) stepShatter(shatter, boxes.get(shatter) ?? shatter.source.getBoundingClientRect(), STEP);
  }
  for (const shatter of [...shatters.values()]) {
    if (renderShatter(shatter, boxes.get(shatter) ?? shatter.source.getBoundingClientRect())) mend(shatter);
  }
  for (const flight of [...flights.values()]) {
    const target = targets.get(flight) ?? home(flight);
    flight.reveal = flight.tether < 0 ? 1
      : Math.min(1, Math.hypot(target.x - flight.x, target.y - flight.y) / (flight.shape.height * 0.6));
    const upright = Math.round(flight.angle / TURN) * TURN;
    if (!flight.hold && flight.tether > TETHER_RAMP &&
      Math.hypot(target.x - flight.x, target.y - flight.y) < 0.6 &&
      Math.hypot(flight.vx, flight.vy) < 25 && Math.abs(flight.angle - upright) < 0.01 && Math.abs(flight.squash) < 0.01 &&
      flight.ring < 0.002) {
      land(flight);
    } else {
      render(flight);
    }
  }
  frame = flights.size || shatters.size ? requestAnimationFrame(tick) : 0;
}

function wake() {
  if (frame) return;
  lastTime = performance.now();
  accumulator = 0;
  frame = requestAnimationFrame(tick);
}

function showLabel(flight: Flight, x: number, y: number) {
  flight.label.style.transform = `translate3d(${(x + 18).toFixed(1)}px, ${(y + 18).toFixed(1)}px, 0)`;
}

function grab(flight: Flight, event: PointerEvent) {
  const cos = Math.cos(-flight.angle);
  const sin = Math.sin(-flight.angle);
  const dx = flight.x - event.clientX;
  const dy = flight.y - event.clientY;
  flight.hold = {
    pointer: event.pointerId,
    handX: event.clientX,
    handY: event.clientY,
    pivotX: event.clientX,
    pivotY: event.clientY,
    // The pivot starts moving with the part of the letter under the hand.
    pivotVX: flight.vx + flight.spin * dy,
    pivotVY: flight.vy - flight.spin * dx,
    rx: dx * cos - dy * sin,
    ry: dx * sin + dy * cos,
  };
  flight.tether = -1;
  flight.airborne = 0;
  flight.onFloor = 0;
  flight.stuck = null;
  // Capture keeps the moves coming when the pointer outruns the letter; without it the hold still works.
  try { flight.ghost.setPointerCapture(event.pointerId); } catch { /* pointer already gone */ }
  flight.ghost.classList.add('is-held');
  flight.label.classList.add('is-shown');
  showLabel(flight, event.clientX, event.clientY);
  wake();
}

function launch(source: HTMLElement, event: PointerEvent) {
  const style = getComputedStyle(source);
  const rect = source.getBoundingClientRect();
  const shape = measure(source, style);
  const material = materialOf(source);
  const ghost = document.createElement('span');
  ghost.className = 'fling-ghost';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.textContent = source.textContent;
  ghost.dataset.material = material.name;
  ghost.dataset.char = source.textContent ?? '';
  Object.assign(ghost.style, {
    width: `${shape.width}px`,
    height: `${shape.height}px`,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontVariationSettings: style.fontVariationSettings,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    color: style.color,
  });
  const label = document.createElement('span');
  label.className = 'fling-label';
  label.setAttribute('aria-hidden', 'true');
  label.textContent = material.name;

  // The original's own lean carries over, so the hand-off is seamless.
  const angle = (Number.parseFloat(style.rotate) || 0) * Math.PI / 180;
  const mass = material.density * shape.area;
  const flight: Flight = {
    source,
    ghost,
    label,
    shape,
    material,
    mass,
    inertia: mass * shape.gyration ** 2,
    x: rect.left + rect.width / 2 + shape.cx * Math.cos(angle) - shape.cy * Math.sin(angle),
    y: rect.top + rect.height / 2 + shape.cx * Math.sin(angle) + shape.cy * Math.cos(angle),
    vx: 0,
    vy: 0,
    angle,
    spin: 0,
    squash: 0,
    squashSpeed: 0,
    reveal: 1,
    squashX: 0,
    squashY: 1,
    hold: null,
    airborne: 0,
    onFloor: 0,
    tether: -1,
    ring: 0,
    ringTime: 0,
    stuck: null,
    cracks: [],
  };
  document.body.append(ghost, label);
  render(flight);
  source.style.visibility = 'hidden';
  flights.set(source, flight);

  ghost.addEventListener('pointerdown', (next) => {
    if (next.button !== 0) return;
    next.preventDefault();
    grab(flight, next);
  });
  ghost.addEventListener('pointermove', (move) => {
    if (flight.hold?.pointer !== move.pointerId) return;
    flight.hold.handX = move.clientX;
    flight.hold.handY = move.clientY;
    showLabel(flight, move.clientX, move.clientY);
  });
  const release = (up: PointerEvent) => {
    if (flight.hold?.pointer !== up.pointerId) return;
    flight.hold = null;
    ghost.classList.remove('is-held');
    flight.label.classList.remove('is-shown');
    wake();
  };
  ghost.addEventListener('pointerup', release);
  ghost.addEventListener('pointercancel', release);

  grab(flight, event);
}

/** Lets each element be picked up with a mouse or pen and thrown. Touch keeps scrolling the page.
 * Set data-material (a key of MATERIALS) to choose what a letter is made of. */
export function makeThrowable(elements: Iterable<HTMLElement>) {
  for (const element of elements) {
    element.classList.add('throwable');
    element.dataset.material = materialOf(element).name;
    element.dataset.char = element.textContent ?? '';
    element.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' || event.button !== 0 || reducedMotion.matches || flights.has(element) || shatters.has(element)) return;
      event.preventDefault();
      launch(element, event);
    });
  }
}

function landAll() {
  for (const flight of [...flights.values()]) land(flight);
  for (const shatter of [...shatters.values()]) mend(shatter);
  clearDebris();
  cancelAnimationFrame(frame);
  frame = 0;
}
document.addEventListener('visibilitychange', () => { if (document.hidden) landAll(); });
reducedMotion.addEventListener('change', landAll);
window.addEventListener('pagehide', landAll);
