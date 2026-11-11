/** A damped mass–spring chain, integrated at 120 Hz with semi-implicit Euler.
 * F = -k(x - target) - cv; adjacent letters exchange equal/opposite spring forces.
 * Positions are pixels, time is seconds, masses are relative units.
 */
export const PHYSICS_STEP = 1 / 120;
export type Spring = { value: number; velocity: number };
export type Body = { x: Spring; y: Spring; rotation: Spring; mass: number; line: number };
export type Target = { x: number; y: number; forceX: number; forceY: number };

export function advanceChain(bodies: Body[], targets: Target[], size: number) {
  const forces = bodies.map((body, i) => ({
    x: 210 * (targets[i].x - body.x.value) - 25 * body.x.velocity + targets[i].forceX,
    y: 210 * (targets[i].y - body.y.value) - 25 * body.y.velocity + targets[i].forceY,
  }));
  for (let i = 1; i < bodies.length; i++) {
    const a = bodies[i - 1];
    const b = bodies[i];
    if (a.line !== b.line) continue;
    for (const axis of ['x', 'y'] as const) {
      const force = 115 * (b[axis].value - a[axis].value) + 4 * (b[axis].velocity - a[axis].velocity);
      forces[i - 1][axis] += force;
      forces[i][axis] -= force;
    }
  }
  bodies.forEach((body, i) => {
    for (const axis of ['x', 'y'] as const) {
      const spring = body[axis];
      spring.velocity += forces[i][axis] / body.mass * PHYSICS_STEP;
      spring.value += spring.velocity * PHYSICS_STEP;
      // Bound extreme input without feeding energy back into the system.
      const limit = size * (axis === 'x' ? 0.16 : 0.13);
      if (Math.abs(spring.value) > limit) {
        spring.value = Math.sign(spring.value) * limit;
        spring.velocity = 0;
      }
    }
    const angle = body.x.value / size * 14;
    body.rotation.velocity += (150 * (angle - body.rotation.value) - 21 * body.rotation.velocity) / body.mass * PHYSICS_STEP;
    body.rotation.value += body.rotation.velocity * PHYSICS_STEP;
  });
}
