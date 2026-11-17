import { advanceChain, PHYSICS_STEP, type Body, type Target } from './namePhysics';
import { reducedMotion } from './spring';
import { makeThrowable } from './fling';

/** Display text that behaves like a row of small tethered objects, through the same rigid-body chain as the hero name.
 * The pointer's presence pushes nearby letters aside (they lean away from it), its movement drags them along,
 * and a tap pokes them with an impulse. Letters in a word are linked; separate words move on their own.
 * Opt in with `data-physics-text` on an element that holds plain text.
 */

const PUSH_REACH_EM = 1.2;
const PUSH_EM = 0.1;
const DRAG_REACH_EM = 0.7;
const DRAG = 2.5;
// Peak speed a tap gives the letter right under it, in em per second.
const POKE_EM = 4.5;
const POKE_REACH_EM = 1.1;
// Per-letter boxes would break the shaping of scripts whose glyphs join (Myanmar, Arabic, Devanagari…).
const SPLITTABLE = /^[\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]*$/u;

type Letter = Body & { element: HTMLElement; cx: number; cy: number };

function split(root: HTMLElement): Letter[] | null {
  const node = root.firstChild;
  if (root.childNodes.length !== 1 || node?.nodeType !== Node.TEXT_NODE) return null;
  const raw = node.textContent ?? '';
  const text = raw.trim();
  if (!text || !SPLITTABLE.test(text)) return null;

  const size = Number.parseFloat(getComputedStyle(root).fontSize);
  const start = raw.indexOf(text);
  const range = document.createRange();
  // Measured from the real text before it is split, so kerning survives and nothing shifts.
  const widths = [...text].map((_, index) => {
    range.setStart(node, start + index);
    range.setEnd(node, start + index + 1);
    return range.getBoundingClientRect().width;
  });

  const letters: Letter[] = [];
  const fragment = document.createDocumentFragment();
  let index = 0;
  text.split(/(\s+)/u).forEach((part, wordIndex) => {
    if (!part) return;
    if (/^\s+$/u.test(part)) {
      fragment.append(' ');
      index += part.length;
      return;
    }
    const word = document.createElement('span');
    word.className = 'physics-word';
    word.setAttribute('aria-hidden', 'true');
    for (const character of part) {
      const width = widths[index++];
      const element = document.createElement('span');
      element.className = 'physics-letter';
      element.textContent = character;
      element.style.width = `${width / size}em`;
      word.append(element);
      letters.push({
        element,
        line: wordIndex,
        x: { value: 0, velocity: 0 },
        y: { value: 0, velocity: 0 },
        rotation: { value: 0, velocity: 0 },
        mass: 0.9 + (width / size) * 0.35,
        cx: 0,
        cy: 0,
      });
    }
    fragment.append(word);
  });

  root.setAttribute('aria-label', text.replace(/\s+/gu, ' '));
  root.replaceChildren(fragment);
  return letters;
}

function animate(root: HTMLElement) {
  const letters = split(root);
  if (!letters) return;
  makeThrowable(letters.map((letter) => letter.element));

  let size = Number.parseFloat(getComputedStyle(root).fontSize);
  let frame = 0;
  let lastTime = 0;
  let accumulator = 0;
  let inside = false;
  let strength = 0;
  let pointerX = 0;
  let pointerY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let lastMove = 0;

  // Rest centres relative to the text box. Subtracting the live offset lets this run mid-motion.
  const measure = () => {
    size = Number.parseFloat(getComputedStyle(root).fontSize);
    const box = root.getBoundingClientRect();
    for (const letter of letters) {
      const rect = letter.element.getBoundingClientRect();
      letter.cx = rect.left + rect.width / 2 - box.left - letter.x.value;
      letter.cy = rect.top + rect.height / 2 - box.top - letter.y.value;
    }
  };

  const settle = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    inside = false;
    strength = accumulator = velocityX = velocityY = 0;
    for (const letter of letters) {
      letter.x = { value: 0, velocity: 0 };
      letter.y = { value: 0, velocity: 0 };
      letter.rotation = { value: 0, velocity: 0 };
      letter.element.style.removeProperty('translate');
      letter.element.style.removeProperty('rotate');
    }
  };

  const tick = (time: number) => {
    // Fixed substeps keep the coupled solver stable and identical at any refresh rate.
    accumulator += Math.min((time - lastTime) / 1000, 0.05) || 1 / 60;
    lastTime = time;
    const box = root.getBoundingClientRect();
    while (accumulator >= PHYSICS_STEP) {
      const dt = PHYSICS_STEP;
      accumulator -= dt;
      strength += ((inside ? 1 : 0) - strength) * (1 - Math.exp(-8 * dt));
      velocityX *= Math.exp(-9 * dt);
      velocityY *= Math.exp(-9 * dt);
      const targets: Target[] = letters.map((letter) => {
        const dx = box.left + letter.cx - pointerX;
        const dy = box.top + letter.cy - pointerY;
        const distance = Math.hypot(dx, dy);
        const ratio = distance / (PUSH_REACH_EM * size);
        const push = strength * PUSH_EM * size * ratio * Math.exp(-(ratio ** 2));
        const near = strength * Math.exp(-((distance / (DRAG_REACH_EM * size)) ** 2));
        return {
          x: distance ? (dx / distance) * push : 0,
          y: distance ? (dy / distance) * push : 0,
          forceX: velocityX * DRAG * near,
          forceY: velocityY * DRAG * near,
        };
      });
      advanceChain(letters, targets, size);
    }

    // A still pointer holds the letters where they are; the loop sleeps until something moves again.
    let restless = Math.abs((inside ? 1 : 0) - strength) > 0.002 || Math.abs(velocityX) + Math.abs(velocityY) > 0.1;
    for (const letter of letters) {
      restless ||= Math.abs(letter.x.velocity) + Math.abs(letter.y.velocity) + Math.abs(letter.rotation.velocity) > 0.1 ||
        (!inside && Math.abs(letter.x.value) + Math.abs(letter.y.value) > 0.05);
      letter.element.style.translate = `${letter.x.value.toFixed(2)}px ${letter.y.value.toFixed(2)}px`;
      letter.element.style.rotate = `${letter.rotation.value.toFixed(3)}deg`;
    }
    if (restless) frame = requestAnimationFrame(tick);
    else if (inside) frame = 0;
    else settle();
  };

  const run = () => {
    if (frame || document.hidden || reducedMotion.matches) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  };

  root.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    measure();
    pointerX = event.clientX;
    pointerY = event.clientY;
    lastMove = 0;
    inside = true;
    run();
  });

  root.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || !inside) return;
    const now = performance.now();
    const elapsed = (now - lastMove) / 1000;
    if (lastMove && elapsed > 0 && elapsed < 0.1) {
      const limit = size * 14;
      velocityX = Math.max(-limit, Math.min(limit, (event.clientX - pointerX) / elapsed));
      velocityY = Math.max(-limit, Math.min(limit, (event.clientY - pointerY) / elapsed));
    }
    lastMove = now;
    pointerX = event.clientX;
    pointerY = event.clientY;
    run();
  });

  root.addEventListener('pointerleave', () => {
    inside = false;
    run();
  });

  // A touch has no hover, so a tap is a poke: an impulse that throws nearby letters away from the finger.
  root.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch' || reducedMotion.matches) return;
    measure();
    const box = root.getBoundingClientRect();
    for (const letter of letters) {
      const dx = box.left + letter.cx - event.clientX;
      const dy = box.top + letter.cy - event.clientY;
      const distance = Math.hypot(dx, dy) || 1;
      const speed = POKE_EM * size * Math.exp(-((distance / (POKE_REACH_EM * size)) ** 2)) / letter.mass;
      letter.x.velocity += (dx / distance) * speed;
      letter.y.velocity += (dy / distance) * speed;
    }
    run();
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
  reducedMotion.addEventListener('change', settle);
  window.addEventListener('pagehide', settle);
}

// Letter widths are measured, so they have to be measured in the real font.
document.fonts.ready.then(() => {
  for (const element of document.querySelectorAll<HTMLElement>('[data-physics-text]')) animate(element);
});
