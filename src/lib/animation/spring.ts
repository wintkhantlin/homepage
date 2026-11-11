/** Exact solution of m*x'' + c*x' + k*(x-target) = 0.
 * Changing a target preserves velocity. One scheduler sleeps when all springs rest.
 */
type Options = { mass?: number; stiffness?: number; damping?: number };
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const active = new Set<ReturnType<typeof spring>>();
let frame = 0;
let previous = 0;
function tick(time: number) {
  const dt = Math.min((time - previous) / 1000, 0.05);
  previous = time;
  for (const item of active) item.advance(dt);
  frame = active.size ? requestAnimationFrame(tick) : 0;
}
function wake() {
  if (frame) return;
  previous = performance.now();
  frame = requestAnimationFrame(tick);
}
export function spring(initial: number, render: (value: number) => void, options: Options = {}) {
  const { mass = 1, stiffness = 210, damping = 23 } = options;
  const decay = damping / (2 * mass);
  const frequency = Math.sqrt(stiffness / mass - decay * decay);
  if (!(frequency > 0)) throw new Error('Spring must be underdamped');
  let value = initial;
  let velocity = 0;
  let target = initial;
  const controller = {
    get value() { return value; },
    set(next: number) {
      target = next;
      if (preference.matches || document.hidden) { controller.finish(); return; }
      active.add(controller);
      wake();
    },
    jump(next: number) { target = next; controller.finish(); },
    finish() { value = target; velocity = 0; render(value); active.delete(controller); },
    advance(dt: number) {
      const displacement = value - target;
      const coefficient = (velocity + decay * displacement) / frequency;
      const envelope = Math.exp(-decay * dt);
      const cosine = Math.cos(frequency * dt);
      const sine = Math.sin(frequency * dt);
      value = target + envelope * (displacement * cosine + coefficient * sine);
      velocity = envelope * (velocity * cosine - (decay * coefficient + frequency * displacement) * sine);
      if (Math.abs(value - target) + Math.abs(velocity) < 0.001) controller.finish();
      else render(value);
    },
  };
  render(initial);
  return controller;
}
function finishAll() { for (const item of active) item.finish(); cancelAnimationFrame(frame); frame = 0; }
preference.addEventListener('change', finishAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
window.addEventListener('pagehide', finishAll);
export { preference as reducedMotion };
