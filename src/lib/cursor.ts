/** A cartoon pointer for mouse and trackpad users, moved by a small rigid-body simulation.
 *
 * Each drawing is pinned at its hotspot on a springy hinge and has a centre of mass somewhere below it
 * (data-com, in px from the hotspot). The hotspot follows the pointer exactly, so the body feels the
 * pointer's acceleration as an inertial force: it lags behind when the pointer sets off, swings past
 * when it stops, and wobbles back upright on the hinge. Fast movement also stretches it along the
 * direction of travel (area-preserving), and a press squashes it like a rubber stamp.
 *
 * Shapes say what the thing under them does — an arrow, a pointing glove to open, an open hand to grab a
 * letter, a fist while holding one, a magnifier on photos. Touch, pen and keyboard users never see it;
 * text fields keep the native I-beam. With reduced motion the body stays rigid and upright.
 */
import { reducedMotion } from './animation/spring';

type State = 'default' | 'link' | 'grab' | 'grabbing' | 'zoom' | 'disabled' | 'text';

const FINE = window.matchMedia('(hover: hover) and (pointer: fine)');
const TEXT = 'input:not([type=button], [type=submit], [type=reset], [type=checkbox], [type=radio], [type=range], [type=color], [type=file]), textarea, select, [contenteditable]:not([contenteditable=false])';
const DISABLED = ':disabled, [aria-disabled="true"]';
const GRAB = '.throwable, .fling-ghost';
const ZOOM = '[data-cursor="zoom"], .photo-open';
const LINK = 'a[href], button, summary, label[for], [role="button"], [role="link"], [role="tab"], [data-cursor="link"]';

/** Which drawing each state uses; a disabled control keeps the arrow, faded. */
const SHAPE: Record<State, string> = {
  default: 'default',
  link: 'link',
  grab: 'grab',
  grabbing: 'grabbing',
  zoom: 'zoom',
  disabled: 'default',
  text: 'default',
};

// Hinge: angular stiffness (1/s²) and damping (1/s). Underdamped, so it wobbles a few times.
const HINGE_K = 210;
const HINGE_C = 7.5;
// Spread of the body's mass around its centre (px), which sets how readily it turns.
const GYRATION = 16;
// How strongly the pointer's acceleration reaches the body: below 1 it is a little heavier than drawn.
const INERTIA = 0.35;
const MAX_SWING = (50 * Math.PI) / 180;
// Velocity stretch: px/s for full stretch, and how far it goes.
const STRETCH_SPEED = 3200;
const MAX_STRETCH = 0.22;
// Press squash: a stiff, bouncy spring on scale.
const SQUASH_K = 520;
const SQUASH_C = 14;
const MAX_ACCEL = 40000;
const STEP = 1 / 240;
const POPS = 6;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function stateOf(target: Element | null, pressed: boolean): State {
  if (!target) return 'default';
  if (target.closest(TEXT)) return 'text';
  if (target.closest(DISABLED)) return 'disabled';
  const grab = target.closest(GRAB);
  if (grab) return pressed || grab.classList.contains('is-held') ? 'grabbing' : 'grab';
  if (target.closest(ZOOM)) return 'zoom';
  if (target.closest(LINK)) return 'link';
  return 'default';
}

type Shape = { svg: SVGSVGElement; comX: number; comY: number };

export function mountCursor(root: HTMLElement) {
  const body = root.querySelector<HTMLElement>('[data-cursor-body]')!;
  const html = document.documentElement;

  // Each drawing is offset so its hotspot lands on the pointer, and carries its centre of mass.
  const shapes = new Map<string, Shape>();
  for (const svg of root.querySelectorAll<SVGSVGElement>('[data-shape]')) {
    const [hx, hy] = (svg.dataset.hot ?? '0,0').split(',').map(Number);
    const [comX, comY] = (svg.dataset.com ?? '0,12').split(',').map(Number);
    svg.style.left = `${-hx}px`;
    svg.style.top = `${-hy}px`;
    shapes.set(svg.dataset.shape!, { svg, comX, comY });
  }

  // Pointer.
  let x = -100;
  let y = -100;
  let pressed = false;
  let visible = false;
  let target: Element | null = null;
  let state: State | null = null;
  let shape: Shape | undefined;

  // Simulation.
  let angle = 0; // rad, clockwise on screen
  let spin = 0; // rad/s
  let scale = 1;
  let scaleVelocity = 0;
  let scaleTarget = 1;
  let lastX = x;
  let lastY = y;
  let vx = 0;
  let vy = 0;
  let ax = 0;
  let ay = 0;
  let frame = 0;
  let previous = 0;
  let carry = 0;

  const still = () => reducedMotion.matches || document.hidden;

  const place = () => {
    const speed = Math.hypot(vx, vy);
    let transform = `translate3d(${x}px, ${y}px, 0)`;
    const stretch = still() ? 0 : Math.min(speed / STRETCH_SPEED, 1) * MAX_STRETCH;
    if (stretch > 0.004) {
      const direction = Math.atan2(vy, vx);
      transform += ` rotate(${direction}rad) scale(${1 + stretch}, ${1 / (1 + stretch)}) rotate(${-direction}rad)`;
    }
    // A press flattens the shape down and out from the hotspot.
    const sx = 1 + (1 - scale) * 0.5;
    transform += ` rotate(${angle}rad) scale(${sx}, ${scale})`;
    body.style.transform = transform;
  };

  /** One fixed physics step of dt seconds, with the pointer's acceleration (ax, ay) already measured. */
  const step = (dt: number) => {
    if (shape) {
      // Centre of mass, turned with the body.
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rx = shape.comX * cos - shape.comY * sin;
      const ry = shape.comX * sin + shape.comY * cos;
      // In the pointer's accelerating frame the body feels -a at its centre of mass: torque = r × (-a).
      const torque = ry * ax - rx * ay;
      const inertia = rx * rx + ry * ry + GYRATION * GYRATION;
      const acceleration = (INERTIA * torque) / inertia - HINGE_K * angle - HINGE_C * spin;
      spin += acceleration * dt;
      angle += spin * dt;
      if (Math.abs(angle) > MAX_SWING) {
        angle = Math.sign(angle) * MAX_SWING;
        spin *= -0.35; // a soft bump against the hinge's stop
      }
    }
    const squash = -SQUASH_K * (scale - scaleTarget) - SQUASH_C * scaleVelocity;
    scaleVelocity += squash * dt;
    scale += scaleVelocity * dt;
  };

  const settled = () =>
    Math.abs(angle) + Math.abs(spin) * 0.05 < 0.0005 &&
    Math.abs(scale - scaleTarget) + Math.abs(scaleVelocity) * 0.05 < 0.0005 &&
    Math.hypot(vx, vy) < 1;

  const tick = (time: number) => {
    const dt = Math.min((time - previous) / 1000, 0.05);
    previous = time;

    if (dt > 0) {
      // Measure the pointer once per frame and smooth it: raw event deltas are too jittery to differentiate.
      const rawVx = (x - lastX) / dt;
      const rawVy = (y - lastY) / dt;
      lastX = x;
      lastY = y;
      const blend = 1 - Math.exp(-dt * 28);
      const nextVx = vx + (rawVx - vx) * blend;
      const nextVy = vy + (rawVy - vy) * blend;
      const rawAx = (nextVx - vx) / dt;
      const rawAy = (nextVy - vy) / dt;
      ax = clamp(ax + (rawAx - ax) * blend, -MAX_ACCEL, MAX_ACCEL);
      ay = clamp(ay + (rawAy - ay) * blend, -MAX_ACCEL, MAX_ACCEL);
      vx = nextVx;
      vy = nextVy;

      carry += dt;
      while (carry >= STEP) {
        step(STEP);
        carry -= STEP;
      }
    }

    place();
    if (settled()) {
      angle = spin = scaleVelocity = vx = vy = ax = ay = 0;
      scale = scaleTarget;
      place();
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (still()) {
      angle = spin = scaleVelocity = vx = vy = ax = ay = 0;
      scale = scaleTarget;
      lastX = x;
      lastY = y;
      place();
      return;
    }
    if (frame) return;
    previous = performance.now();
    carry = 0;
    frame = requestAnimationFrame(tick);
  };

  const halt = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    angle = spin = scaleVelocity = vx = vy = ax = ay = 0;
    scale = scaleTarget;
    place();
  };

  const show = (on: boolean) => {
    if (on === visible) return;
    visible = on;
    root.toggleAttribute('data-visible', on);
    if (!on) halt();
  };

  const apply = () => {
    const next = stateOf(target, pressed);
    if (next === state) return;
    state = next;
    root.dataset.state = next;
    const nextShape = shapes.get(SHAPE[next]);
    if (nextShape !== shape) {
      shape?.svg.classList.remove('is-current');
      nextShape?.svg.classList.add('is-current');
      shape = nextShape;
      // Boing: the new shape pops in small and overshoots, with a little twist to set it wobbling.
      if (!pressed && visible && !still()) {
        scale = 0.55;
        scaleVelocity = 0;
        spin += 5;
        wake();
      }
    }
  };

  const burst = () => {
    if (still()) return;
    const offset = Math.random() * 60;
    for (let i = 0; i < POPS; i += 1) {
      const line = document.createElement('span');
      line.className = 'cursor-pop';
      line.style.setProperty('--x', `${x}px`);
      line.style.setProperty('--y', `${y}px`);
      line.style.setProperty('--a', `${offset + (360 / POPS) * i}deg`);
      line.addEventListener('animationend', () => line.remove(), { once: true });
      root.append(line);
    }
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') {
      show(false);
      return;
    }
    x = event.clientX;
    y = event.clientY;
    target = event.target instanceof Element ? event.target : null;

    if (!visible) {
      // Arrive at rest where the pointer is, not with a jolt from wherever it last left.
      lastX = x;
      lastY = y;
      show(true);
      apply();
      place();
      return;
    }
    apply();
    // Draw at the new position now, so the shape never trails the pointer by a frame.
    place();
    wake();
  };

  const onDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    pressed = true;
    if (event.target instanceof Element) target = event.target;
    apply();
    scaleTarget = 0.78;
    spin -= 3; // a little nod as it presses
    burst();
    wake();
  };
  const onUp = () => {
    if (!pressed) return;
    pressed = false;
    // A thrown letter's ghost drops its held class on release; read the pointer's target afresh.
    target = document.elementFromPoint(x, y);
    apply();
    scaleTarget = 1;
    wake();
  };
  const onLeave = (event: MouseEvent) => {
    if (!event.relatedTarget) show(false);
  };
  const onBlur = () => show(false);
  // Content can move under a still pointer while the page scrolls: re-read what it is over.
  const onScroll = () => {
    if (!visible) return;
    target = document.elementFromPoint(x, y);
    apply();
  };

  const listeners: Array<[EventTarget, string, EventListener, AddEventListenerOptions?]> = [
    [window, 'pointermove', onMove as EventListener, { passive: true }],
    [window, 'pointerdown', onDown as EventListener, { passive: true }],
    [window, 'pointerup', onUp, { passive: true }],
    [window, 'pointercancel', onUp, { passive: true }],
    [document, 'mouseout', onLeave as EventListener, { passive: true }],
    [window, 'blur', onBlur],
    [window, 'scroll', onScroll, { passive: true }],
  ];

  // Modal dialogs render in the browser's top layer, above any z-index, and the native cursor is hidden,
  // so the pointer would vanish under them. The cursor is a popover in that same layer instead; whatever
  // enters the top layer after it (a dialog opening, another popover) is stacked higher, so it climbs
  // back on top each time. Without popover support it hands the native cursor back while a modal is open.
  const layered = typeof root.showPopover === 'function';
  if (!layered) root.removeAttribute('popover');
  let enabled = false;

  const raise = () => {
    if (!enabled || !layered) return;
    try {
      if (root.matches(':popover-open')) root.hidePopover();
      root.showPopover();
    } catch {}
  };
  const onTopLayerChange = () => {
    if (!enabled) return;
    if (layered) raise();
    else html.toggleAttribute('data-custom-cursor', !document.querySelector('dialog:modal'));
  };
  const dialogs = new MutationObserver((records) => {
    if (records.some((record) => record.target instanceof HTMLDialogElement)) onTopLayerChange();
  });
  const onToggle = (event: Event) => {
    if (event.target !== root && (event as ToggleEvent).newState === 'open') onTopLayerChange();
  };

  const enable = () => {
    enabled = true;
    html.setAttribute('data-custom-cursor', '');
    for (const [where, type, fn, options] of listeners) where.addEventListener(type, fn, options);
    dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
    document.addEventListener('toggle', onToggle, true);
    raise();
  };
  const disable = () => {
    enabled = false;
    html.removeAttribute('data-custom-cursor');
    show(false);
    for (const [where, type, fn] of listeners) where.removeEventListener(type, fn);
    dialogs.disconnect();
    document.removeEventListener('toggle', onToggle, true);
    if (layered && root.matches(':popover-open')) root.hidePopover();
  };

  reducedMotion.addEventListener('change', halt);
  document.addEventListener('visibilitychange', () => { if (document.hidden) halt(); });

  apply();
  if (FINE.matches) enable();
  FINE.addEventListener('change', () => (FINE.matches ? enable() : disable()));
}
