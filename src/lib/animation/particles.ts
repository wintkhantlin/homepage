/** Debris thrown off by impacts: sparks, concrete chips and dust, wood splinters, cork crumbs, jelly droplets.
 * Each particle is a point mass under gravity with linear air drag; heavy debris bounces on the window floor.
 * One fixed layer and one frame loop serve them all, and both go away when the last particle does.
 */

export type DebrisKind = 'spark' | 'glint' | 'chip' | 'dust' | 'splinter' | 'crumb' | 'droplet';

type Spec = {
  count: [number, number];
  speed: [number, number];
  /** Half-angle of the cone around the surface normal, radians. */
  spread: number;
  life: [number, number];
  gravity: number;
  drag: number;
  bounce: number;
  paint: (element: HTMLElement) => number;
};

const SPECS: Record<DebrisKind, Spec> = {
  // Hot metal shavings: fast, bright, short-lived, drawn as streaks along their velocity.
  spark: {
    count: [8, 18], speed: [350, 1100], spread: 1.35, life: [0.25, 0.6], gravity: 1800, drag: 2.5, bounce: 0.4,
    paint: (element) => {
      element.style.cssText += ';height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,#ffe7a8 40%,#ff9d2e);box-shadow:0 0 6px #ffae42';
      return 0;
    },
  },
  // Glass dust caught in the light as it breaks.
  glint: {
    count: [8, 14], speed: [200, 700], spread: 1.5, life: [0.35, 0.8], gravity: 1600, drag: 2, bounce: 0.3,
    paint: (element) => {
      const size = 1.5 + Math.random() * 2.5;
      element.style.cssText += `;width:${size}px;height:${size}px;transform-origin:center;background:#eaf7ff;box-shadow:0 0 5px rgb(170 225 255 / 0.9)`;
      return size;
    },
  },
  chip: {
    count: [5, 10], speed: [150, 520], spread: 1.1, life: [0.7, 1.3], gravity: 2400, drag: 0.8, bounce: 0.3,
    paint: (element) => {
      const size = 2 + Math.random() * 4;
      element.style.cssText += `;width:${size}px;height:${size * (0.7 + Math.random() * 0.6)}px;background:${Math.random() < 0.5 ? '#8f8e89' : '#b4b3ad'}`;
      return size;
    },
  },
  dust: {
    count: [3, 5], speed: [40, 160], spread: 1.5, life: [0.6, 1.1], gravity: -60, drag: 3, bounce: 0,
    paint: (element) => {
      const size = 14 + Math.random() * 16;
      element.style.cssText += `;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle,rgb(175 173 165 / 0.45),transparent 70%)`;
      return size;
    },
  },
  splinter: {
    count: [3, 6], speed: [200, 600], spread: 0.9, life: [0.8, 1.4], gravity: 2200, drag: 1.2, bounce: 0.25,
    paint: (element) => {
      element.style.cssText += `;width:${7 + Math.random() * 8}px;height:2px;border-radius:1px;background:${Math.random() < 0.5 ? '#a8713c' : '#c99460'}`;
      return 2;
    },
  },
  crumb: {
    count: [4, 8], speed: [80, 300], spread: 1.2, life: [0.8, 1.4], gravity: 1600, drag: 2.5, bounce: 0.35,
    paint: (element) => {
      const size = 2 + Math.random() * 2.5;
      element.style.cssText += `;width:${size}px;height:${size}px;border-radius:40%;background:${Math.random() < 0.5 ? '#c8955f' : '#8a5a2e'}`;
      return size;
    },
  },
  droplet: {
    count: [3, 7], speed: [150, 450], spread: 1.2, life: [0.7, 1.2], gravity: 2000, drag: 1, bounce: 0.15,
    paint: (element) => {
      const size = 4 + Math.random() * 5;
      element.style.cssText += `;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgb(255 255 255 / 0.85) 0 18%,rgb(60 215 125 / 0.85) 30%,rgb(20 150 90 / 0.9))`;
      return size;
    },
  },
};

type Particle = {
  element: HTMLElement;
  kind: DebrisKind;
  spec: Spec;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  age: number;
  life: number;
};

const MAX = 160;
const particles: Particle[] = [];
let layer: HTMLElement | null = null;
let frame = 0;
let last = 0;

const between = ([low, high]: [number, number]) => low + Math.random() * (high - low);

function tick(time: number) {
  const dt = Math.min((time - last) / 1000, 0.05);
  last = time;
  const floor = window.innerHeight;
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    const { spec } = particle;
    particle.age += dt;
    if (particle.age >= particle.life || document.hidden) {
      particle.element.remove();
      particles.splice(i, 1);
      continue;
    }
    const drag = Math.exp(-spec.drag * dt);
    particle.vx *= drag;
    particle.vy = (particle.vy + spec.gravity * dt) * drag;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    if (spec.bounce && particle.y > floor - particle.size && particle.vy > 0) {
      particle.y = floor - particle.size;
      particle.vy *= -spec.bounce;
      particle.vx *= 0.6;
      particle.spin *= 0.5;
    }
    particle.angle += particle.spin * dt;
    const remaining = 1 - particle.age / particle.life;
    let transform = `translate3d(${particle.x.toFixed(1)}px, ${particle.y.toFixed(1)}px, 0)`;
    if (particle.kind === 'spark') {
      // A streak as long as the distance it covers in a sliver of a frame, pointing where it is going.
      const speed = Math.hypot(particle.vx, particle.vy);
      particle.element.style.width = `${Math.max(3, Math.min(18, speed * 0.018)).toFixed(1)}px`;
      transform += ` rotate(${Math.atan2(particle.vy, particle.vx).toFixed(3)}rad)`;
    } else if (particle.kind === 'dust') {
      transform += ` scale(${(1 + particle.age / particle.life * 1.6).toFixed(3)})`;
    } else {
      transform += ` rotate(${particle.angle.toFixed(3)}rad)`;
    }
    particle.element.style.transform = transform;
    particle.element.style.opacity = (particle.kind === 'spark' ? remaining : Math.min(1, remaining * 2.5)).toFixed(3);
  }
  if (particles.length) frame = requestAnimationFrame(tick);
  else {
    frame = 0;
    layer?.remove();
    layer = null;
  }
}

/** Throws debris from (x, y) off a surface whose outward normal is (nx, ny); strength 0–1 scales how much. */
export function emit(kind: DebrisKind, x: number, y: number, nx: number, ny: number, strength: number, count?: number) {
  if (document.hidden) return;
  const spec = SPECS[kind];
  const amount = count ?? Math.round(spec.count[0] + (spec.count[1] - spec.count[0]) * Math.min(1, strength));
  if (!layer) {
    layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483001;overflow:hidden';
    document.body.append(layer);
  }
  const normal = Math.atan2(ny, nx);
  for (let i = 0; i < amount; i++) {
    if (particles.length >= MAX) particles.shift()?.element.remove();
    const element = document.createElement('span');
    element.style.cssText = 'position:absolute;left:0;top:0;will-change:transform,opacity';
    const size = spec.paint(element);
    layer.append(element);
    const direction = normal + (Math.random() * 2 - 1) * spec.spread;
    const speed = between(spec.speed) * (0.55 + 0.45 * Math.min(1, strength));
    particles.push({
      element,
      kind,
      spec,
      size,
      x,
      y,
      vx: Math.cos(direction) * speed,
      vy: Math.sin(direction) * speed,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 30,
      age: 0,
      life: between(spec.life),
    });
  }
  if (!frame) {
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
}

export function clearDebris() {
  for (const particle of particles) particle.element.remove();
  particles.length = 0;
}
