/** Each letter is a small rigid body tethered at its base (the CSS transform-origin, 50% 80%).
 *
 * Translation, per axis, semi-implicit Euler at 120 Hz: m·a = F_body + F_base, where
 * - F_body acts at the centre of mass: the pointer's push and drag.
 * - F_base acts at the base: the damped anchor spring to rest, the links to neighbouring letters,
 *   and the travel limits, which are stiff damped contact springs (soft stops) that absorb momentum
 *   instead of deleting it.
 *
 * Rotation about the base, small angle: I·α = h·(F_body − m·a) − κ·θ − c·ω.
 * The centre of mass sits a lever h above the base, so a push leans a letter away from it, and a base
 * that is yanked sideways leaves the top behind (the −m·a pseudo-force) before it rocks upright.
 * I = m·(h² + r²) for an extended glyph with radius of gyration r. Lean is bounded by a soft rotational stop.
 *
 * Positions are pixels, time is seconds, masses are relative units, rotation is stored in degrees.
 */
export const PHYSICS_STEP = 1 / 120;
export type Spring = { value: number; velocity: number };
export type Body = { x: Spring; y: Spring; rotation: Spring; mass: number; line: number };
/** x/y: where the pointer's push would hold the letter (its push force is ANCHOR × that). force: drag, at the body. */
export type Target = { x: number; y: number; forceX: number; forceY: number };

const ANCHOR = 210;
const ANCHOR_DAMPING = 25;
const LINK = 115;
const LINK_DAMPING = 4;
// Soft stops: much stiffer than the anchor, damped near critical so a hard throw lands rather than bounces.
const STOP = ANCHOR * 30;
const STOP_DAMPING_RATIO = 0.8;
const LIMIT_EM = { x: 0.16, y: 0.13 } as const;
// Centre of mass above the base: the glyph's middle (50%) over its base (80%) of a ~0.92em line box.
const LEVER_EM = 0.28;
const GYRATION_EM = 0.3;
// Resting lean per em of push, matching the name's earlier look.
const TILT_DEG_PER_EM = 14;
const TILT_DAMPING_RATIO = 0.7;
// Neighbouring glyphs leave a letter only so much room to lean: past this it meets a soft rotational stop.
const TILT_LIMIT_DEG = 6;
// Stiff, but kept so its natural frequency stays well under the 120 Hz step's stability limit.
const TILT_STOP = 8;
const RADIANS = Math.PI / 180;
const AXES = ['x', 'y'] as const;

export function advanceChain(bodies: Body[], targets: Target[], size: number) {
  const lever = LEVER_EM * size;
  // Rotational stiffness chosen so a steady push of d px holds the letter at d / size × TILT_DEG_PER_EM degrees.
  const stiffness = lever * ANCHOR * size / (TILT_DEG_PER_EM * RADIANS);

  const forces = bodies.map((body, i) => {
    const target = targets[i];
    const base = { x: 0, y: 0 };
    const push = { x: ANCHOR * target.x + target.forceX, y: ANCHOR * target.y + target.forceY };
    for (const axis of AXES) {
      const { value, velocity } = body[axis];
      base[axis] = -ANCHOR * value - ANCHOR_DAMPING * velocity;
      const limit = LIMIT_EM[axis] * size;
      const depth = Math.abs(value) - limit;
      if (depth > 0) {
        const damping = 2 * STOP_DAMPING_RATIO * Math.sqrt(STOP * body.mass);
        base[axis] += -Math.sign(value) * STOP * depth - damping * velocity;
      }
    }
    return { base, push };
  });

  for (let i = 1; i < bodies.length; i++) {
    const a = bodies[i - 1];
    const b = bodies[i];
    if (a.line !== b.line) continue;
    for (const axis of AXES) {
      const force = LINK * (b[axis].value - a[axis].value) + LINK_DAMPING * (b[axis].velocity - a[axis].velocity);
      forces[i - 1].base[axis] += force;
      forces[i].base[axis] -= force;
    }
  }

  bodies.forEach((body, i) => {
    const { base, push } = forces[i];
    const accelerationX = (base.x + push.x) / body.mass;
    for (const axis of AXES) {
      const spring = body[axis];
      spring.velocity += (base[axis] + push[axis]) / body.mass * PHYSICS_STEP;
      spring.value += spring.velocity * PHYSICS_STEP;
    }

    const inertia = body.mass * (lever * lever + (GYRATION_EM * size) ** 2);
    const damping = 2 * TILT_DAMPING_RATIO * Math.sqrt(stiffness * inertia);
    const angle = body.rotation.value * RADIANS;
    const spin = body.rotation.velocity * RADIANS;
    let torque = lever * (push.x - body.mass * accelerationX) - stiffness * angle;
    let friction = damping;
    const lean = Math.abs(angle) - TILT_LIMIT_DEG * RADIANS;
    if (lean > 0) {
      const stop = stiffness * TILT_STOP;
      torque -= Math.sign(angle) * stop * lean;
      friction += 2 * STOP_DAMPING_RATIO * Math.sqrt(stop * inertia);
    }
    // Damping is integrated implicitly: it can only ever remove spin, however stiff the stop it comes with.
    const nextSpin = (spin + torque / inertia * PHYSICS_STEP) / (1 + friction / inertia * PHYSICS_STEP);
    body.rotation.velocity = nextSpin / RADIANS;
    body.rotation.value += body.rotation.velocity * PHYSICS_STEP;
  });
}
