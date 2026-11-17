import { reducedMotion } from './spring';

/** A small celebratory burst: flat paper chips thrown upward from a point.
 * Each chip is a projectile under gravity with quadratic air drag (so it reaches a terminal velocity and flutters
 * down rather than dropping), tumbles about two axes, bounces once or twice on the window floor, and fades out.
 */

const GRAVITY = 2400;
// Quadratic drag, 1/px: a = −k·|v|·v. Paper is light, so drag dominates once it slows.
const DRAG = 0.0025;
const RESTITUTION = 0.35;
const COUNT = 22;

type Chip = {
  element: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  flip: number;
  flipSpeed: number;
  age: number;
  life: number;
};

export function burst(x: number, y: number) {
  if (reducedMotion.matches || document.hidden) return;
  const root = getComputedStyle(document.documentElement);
  const colors = [root.getPropertyValue('--focus').trim(), root.getPropertyValue('--text-heading').trim()].filter(Boolean);

  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483001;overflow:hidden';
  document.body.append(layer);

  const chips: Chip[] = Array.from({ length: COUNT }, (_, index) => {
    const element = document.createElement('span');
    const width = 5 + Math.random() * 5;
    element.style.cssText =
      `position:absolute;left:0;top:0;width:${width}px;height:${width * (1.3 + Math.random())}px;border-radius:1.5px;` +
      `background:${colors[index % colors.length] || 'currentColor'};will-change:transform,opacity`;
    layer.append(element);
    // A cone thrown upward, ±40° either side of straight up.
    const direction = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
    const speed = 900 + Math.random() * 600;
    return {
      element,
      x,
      y,
      vx: Math.cos(direction) * speed,
      vy: Math.sin(direction) * speed,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 24,
      flip: Math.random() * Math.PI,
      flipSpeed: 8 + Math.random() * 14,
      age: 0,
      life: 1.2 + Math.random() * 0.6,
    };
  });

  let last = performance.now();
  const tick = (time: number) => {
    const dt = Math.min((time - last) / 1000, 0.05);
    last = time;
    const floor = window.innerHeight - 4;
    let alive = 0;
    for (const chip of chips) {
      chip.age += dt;
      if (chip.age >= chip.life) { chip.element.style.opacity = '0'; continue; }
      alive++;
      const speed = Math.hypot(chip.vx, chip.vy);
      chip.vx += -DRAG * speed * chip.vx * dt;
      chip.vy += (GRAVITY - DRAG * speed * chip.vy) * dt;
      chip.x += chip.vx * dt;
      chip.y += chip.vy * dt;
      if (chip.y > floor && chip.vy > 0) {
        chip.y = floor;
        chip.vy *= -RESTITUTION;
        chip.vx *= 0.6;
        chip.spin *= 0.5;
      }
      chip.angle += chip.spin * dt;
      chip.flip += chip.flipSpeed * dt;
      const fade = Math.min(1, (chip.life - chip.age) / (chip.life * 0.4));
      chip.element.style.opacity = fade.toFixed(3);
      // Tumbling about its own axis shows as the chip's width narrowing and widening.
      chip.element.style.transform =
        `translate3d(${chip.x.toFixed(1)}px, ${chip.y.toFixed(1)}px, 0) rotate(${chip.angle.toFixed(3)}rad) scaleX(${Math.cos(chip.flip).toFixed(3)})`;
    }
    if (alive && !document.hidden) requestAnimationFrame(tick);
    else layer.remove();
  };
  requestAnimationFrame(tick);
}
