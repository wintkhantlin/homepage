import { spring, reducedMotion } from './spring';

/**
 * Selected-work filmstrip. Vertical scroll drives a sideways drift while the stage is pinned;
 * a full-stage WebGL pass bends the strip at the window edges (swell + twist + organic wave)
 * and splits the light there into a prismatic, gaussian-smeared fringe.
 * The real <img>s and links stay in the DOM; the canvas only paints over the images.
 */

/** How far a side bends while the strip is still, once a frame is cut off there (0 = flat at rest). The moving bend is separate. */
const REST_BEND = 0.5;

const FLAT_VERTEX = `
attribute vec2 aPos;
uniform vec4 uRect;   // x, y, w, h in canvas uv (y down)
uniform vec4 uCrop;   // offset.xy, scale.xy for object-fit: cover
varying vec2 vUv;
void main() {
  vec2 p = uRect.xy + aPos * uRect.zw;
  gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
  vUv = uCrop.xy + aPos * uCrop.zw;
}`;

const FLAT_FRAGMENT = `
precision mediump float;
uniform sampler2D uTex;
varying vec2 vUv;
void main() { gl_FragColor = texture2D(uTex, vUv); }`;

const WARP_VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos.x * 2.0 - 1.0, 1.0 - aPos.y * 2.0, 0.0, 1.0);
}`;

const WARP_FRAGMENT = `
precision highp float;
uniform sampler2D uScene;
uniform float uAspect; // canvas width / height
uniform vec2 uRest;    // resting bend per side (x = left, y = right): 0 where nothing is cut off
uniform float uSpeed;  // 0..1 drift speed
uniform float uVel;    // signed drift, -1..1
uniform float uTime;
uniform float uMid;    // vertical centre of the strip, canvas uv
varying vec2 vUv;

vec4 scene(vec2 uv) {
  vec2 m = step(vec2(0.0), uv) * step(uv, vec2(1.0));
  return texture2D(uScene, vec2(uv.x, 1.0 - uv.y)) * m.x * m.y;
}

vec3 spectrum(float h) {
  return clamp(vec3(abs(h * 6.0 - 3.0) - 1.0, 2.0 - abs(h * 6.0 - 2.0), 2.0 - abs(h * 6.0 - 4.0)), 0.0, 1.0);
}

void main() {
  vec2 uv = vUv;
  float sx = uv.x * 2.0 - 1.0;
  float side = sx < 0.0 ? -1.0 : 1.0;
  float e = smoothstep(0.45, 1.0, abs(sx));
  float rest = side < 0.0 ? uRest.x : uRest.y;
  float a = max(${REST_BEND.toFixed(3)} * rest, 0.5 * uSpeed) + 0.35 * uSpeed;
  if (e <= 0.0 || a <= 0.001) { gl_FragColor = scene(uv); return; }
  float e2 = e * e;

  // Displacement: the strip swells toward the edges, the left end sinks and the right end lifts,
  // and the drift direction tips the twist further.
  vec2 q = uv;
  q.y = uMid + (q.y - uMid) / (1.0 + 0.55 * a * e2);
  q.y += side * (0.085 * a + 0.035 * uVel) * e2;
  q.x -= side * 0.03 * a * e2;
  // Organic wave in the outline.
  q.y += sin(uv.x * 7.0 + uTime * 0.9) * 0.007 * a * e;
  q.x += sin(uv.y * 6.0 - uTime * 0.7) * 0.004 * a * e;

  // Prism: spectral taps along the bend direction, gaussian weighted, with a slight perpendicular smear.
  vec2 d = normalize(vec2(side, (uv.y - uMid) * 0.9));
  vec2 dir = d * vec2(1.0 / uAspect, 1.0);
  vec2 perp = vec2(-d.y, d.x) * vec2(1.0 / uAspect, 1.0);
  float spread = 0.028 * min(a, 0.75) * e;

  const int TAPS = 11;
  vec3 rgb = vec3(0.0);
  vec3 wsum = vec3(0.0);
  float alpha = 0.0;
  float asum = 0.0;
  for (int i = 0; i < TAPS; i++) {
    float t = float(i) / float(TAPS - 1);
    float c = t * 2.0 - 1.0;
    float g = exp(-c * c * 1.4);
    float jitter = (mod(float(i), 2.0) * 2.0 - 1.0) * 0.3;
    vec4 s = scene(q + dir * spread * c + perp * spread * jitter);
    vec3 w = spectrum(t * 0.78) * g;
    rgb += s.rgb * w;
    wsum += w;
    alpha += s.a * g;
    asum += g;
  }
  vec4 prism = vec4(rgb / wsum, alpha / asum);
  vec4 sharp = scene(q);
  vec4 color = mix(sharp, prism, clamp(e * 1.6, 0.0, 1.0));
  gl_FragColor = vec4(min(color.rgb, vec3(color.a)), color.a);
}`;

type Renderer = {
  start(): void;
  stop(): void;
  draw(velocity: number, rest: [number, number]): void;
};

function program(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const make = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'compile');
    return shader;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, make(gl.VERTEX_SHADER, vertex));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  return p;
}

function createRenderer(stage: HTMLElement, media: HTMLElement[]): Renderer | null {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;display:none';
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;

  let flat: WebGLProgram, warp: WebGLProgram;
  try {
    flat = program(gl, FLAT_VERTEX, FLAT_FRAGMENT);
    warp = program(gl, WARP_VERTEX, WARP_FRAGMENT);
  } catch (error) {
    console.warn('[drift] WebGL disabled:', error);
    return null;
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const bindQuad = (p: WebGLProgram) => {
    const loc = gl.getAttribLocation(p, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  };
  const flatU = { rect: gl.getUniformLocation(flat, 'uRect'), crop: gl.getUniformLocation(flat, 'uCrop') };
  const warpU = {
    aspect: gl.getUniformLocation(warp, 'uAspect'), rest: gl.getUniformLocation(warp, 'uRest'), speed: gl.getUniformLocation(warp, 'uSpeed'),
    vel: gl.getUniformLocation(warp, 'uVel'), time: gl.getUniformLocation(warp, 'uTime'), mid: gl.getUniformLocation(warp, 'uMid'),
  };

  const makeTexture = () => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return texture;
  };

  // Offscreen scene the warp pass reads from.
  const sceneTexture = makeTexture();
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTexture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const frames = media.map(element => {
    const img = element.querySelector('img')!;
    const frame = { element, img, texture: makeTexture(), ready: false };
    const upload = () => {
      if (!img.naturalWidth || lost) return;
      gl.bindTexture(gl.TEXTURE_2D, frame.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      frame.ready = true;
      if (running) img.style.opacity = '0';
      renderer.draw(lastVelocity, lastRest);
    };
    if (img.complete) queueMicrotask(upload);
    img.addEventListener('load', upload);
    return frame;
  });

  let running = false;
  let lost = false;
  let onScreen = false;
  let lastVelocity = 0;
  let lastRest: [number, number] = [0, 0];
  let width = 0, height = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, Math.round(stage.clientWidth * dpr));
    height = Math.max(1, Math.round(stage.clientHeight * dpr));
    canvas.width = width;
    canvas.height = height;
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    renderer.draw(lastVelocity, lastRest);
  };
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; renderer.draw(lastVelocity, lastRest); }).observe(stage);

  const restoreImages = () => { for (const frame of frames) frame.img.style.opacity = ''; };
  canvas.addEventListener('webglcontextlost', () => { lost = true; renderer.stop(); });
  stage.append(canvas);

  const renderer: Renderer = {
    start() {
      if (lost || running) return;
      running = true;
      canvas.style.display = 'block';
      for (const frame of frames) if (frame.ready) frame.img.style.opacity = '0';
      resize();
    },
    stop() {
      running = false;
      canvas.style.display = 'none';
      restoreImages();
    },
    draw(velocity, rest) {
      lastVelocity = velocity;
      lastRest = rest;
      if (!running || lost || !onScreen || !width) return;
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(flat);
      bindQuad(flat);
      let mid = 0.5;
      let midFound = false;
      for (const frame of frames) {
        const r = frame.element.getBoundingClientRect();
        if (r.right < box.left || r.left > box.right || !frame.ready) continue;
        if (!midFound) { mid = (r.top + r.height / 2 - box.top) / box.height; midFound = true; }
        const imageAspect = frame.img.naturalWidth / frame.img.naturalHeight;
        const boxAspect = r.width / r.height;
        const sx = imageAspect > boxAspect ? boxAspect / imageAspect : 1;
        const sy = imageAspect > boxAspect ? 1 : imageAspect / boxAspect;
        gl.uniform4f(flatU.rect, (r.left - box.left) / box.width, (r.top - box.top) / box.height, r.width / box.width, r.height / box.height);
        gl.uniform4f(flatU.crop, (1 - sx) / 2, (1 - sy) / 2, sx, sy);
        gl.bindTexture(gl.TEXTURE_2D, frame.texture);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(warp);
      bindQuad(warp);
      const speed = Math.min(1, Math.abs(velocity));
      gl.uniform1f(warpU.aspect, width / height);
      gl.uniform2f(warpU.rest, rest[0], rest[1]);
      gl.uniform1f(warpU.speed, speed);
      gl.uniform1f(warpU.vel, Math.max(-1, Math.min(1, velocity)));
      gl.uniform1f(warpU.time, performance.now() / 1000);
      gl.uniform1f(warpU.mid, mid);
      gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
  return renderer;
}

export function initDrift() {
  const section = document.querySelector<HTMLElement>('[data-drift]');
  if (!section) return;
  const stage = section.querySelector<HTMLElement>('[data-drift-stage]')!;
  const track = section.querySelector<HTMLElement>('[data-drift-track]')!;
  const viewport = section.querySelector<HTMLElement>('[data-drift-viewport]')!;
  const media = [...section.querySelectorAll<HTMLElement>('[data-drift-media]')];
  const counts = [...section.querySelectorAll<HTMLElement>('[data-drift-count]')];
  const progress = section.querySelector<HTMLElement>('[data-drift-progress]');
  const total = media.length;
  const roomy = window.matchMedia('(min-width: 768px) and (min-height: 520px)');

  let pinned = false;
  let distance = 0;
  let renderer: Renderer | null | undefined;
  let gutter = 0;
  // A side only bends at rest once a frame is actually cut off there.
  const rest = (value: number): [number, number] => {
    const ramp = gutter + 160;
    return [Math.min(1, Math.max(0, value / ramp)), Math.min(1, Math.max(0, (distance - value) / ramp))];
  };

  // "N / total": only touch the text when the frame number changes.
  let shown = 1;
  const show = (index: number) => {
    const next = Math.min(total, Math.max(1, index));
    if (next === shown) return;
    shown = next;
    for (const count of counts) count.textContent = String(next);
  };

  // Native strip (phones): the frame snapped at the start of the viewport, or the last one once the end is reached.
  let reading = 0;
  const readSwipe = () => {
    reading = 0;
    if (pinned) return;
    const items = track.children;
    const step = items.length > 1 ? (items[1] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft : 0;
    const end = viewport.scrollWidth - viewport.clientWidth;
    show(end > 0 && viewport.scrollLeft >= end - 2 ? total : step > 0 ? Math.round(viewport.scrollLeft / step) + 1 : 1);
  };
  viewport.addEventListener('scroll', () => { if (!pinned && !reading) reading = requestAnimationFrame(readSwipe); }, { passive: true });

  // The bend follows the strip's own momentum: the offset spring's velocity, normalised so ~1 is a brisk scroll.
  // It is continuous, so the bend eases in and out without sampling or smoothing, behaves the same at any refresh
  // rate, and reaches 0 exactly as the strip comes to rest.
  const offset = spring(0, (value, velocity) => {
    track.style.transform = pinned ? `translate3d(${-value}px, 0, 0)` : '';
    if (pinned) {
      // Progress rule and frame count ride the same spring as the strip: compositor-only transform, text only on change.
      const p = distance ? Math.min(1, Math.max(0, value / distance)) : 0;
      if (progress) progress.style.transform = `scaleX(${p})`;
      show(Math.round(p * (total - 1)) + 1);
    }
    renderer?.draw(velocity / 3200, rest(value));
  }, { mass: 1, stiffness: 140, damping: 22 });

  // Jumps (layout changes, keyboard focus) are not drift: land at once with no momentum, so they don't flash the bend.
  const snap = (value: number) => offset.jump(value);

  const scrollable = () => section.offsetHeight - window.innerHeight;
  const target = () => {
    const room = scrollable();
    if (room <= 0) return 0;
    const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / room));
    return progress * distance;
  };

  const measure = () => {
    if (!pinned) return;
    distance = Math.max(0, track.scrollWidth - stage.clientWidth);
    gutter = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    section.style.setProperty('--drift-height', `${window.innerHeight + distance}px`);
    // The stage is a full screen tall; let the next section start just under the captions instead of after the empty space.
    const used = track.getBoundingClientRect().bottom - stage.getBoundingClientRect().top;
    section.style.marginBottom = `${-Math.max(0, stage.clientHeight - used - 32)}px`;
    snap(target());
  };

  const apply = () => {
    const next = roomy.matches && !reducedMotion.matches;
    if (next !== pinned) {
      pinned = next;
      section.classList.toggle('is-pinned', pinned);
      if (pinned) {
        if (renderer === undefined) renderer = createRenderer(stage, media);
        renderer?.start();
      } else {
        renderer?.stop();
        section.style.removeProperty('--drift-height');
        section.style.marginBottom = '';
        snap(0);
        readSwipe();
      }
    }
    measure();
  };

  window.addEventListener('scroll', () => { if (pinned) offset.set(target()); }, { passive: true });
  window.addEventListener('resize', measure);
  new ResizeObserver(measure).observe(track);
  roomy.addEventListener('change', apply);
  reducedMotion.addEventListener('change', apply);
  apply();
  readSwipe();

  // Keyboard: the strip moves by transform, so focus can't scroll it. Scroll the page to the place that shows the focused frame.
  section.addEventListener('focusin', event => {
    if (!pinned || !distance) return;
    const item = (event.target as Element).closest('[data-drift-frame]')?.parentElement;
    if (!item) return;
    const left = item.offsetLeft;
    const right = left + item.offsetWidth;
    const view = stage.clientWidth;
    if (left >= offset.value + gutter * 0.5 && right <= offset.value + view - gutter * 0.5) return;
    const want = Math.min(distance, Math.max(0, left - gutter));
    const top = section.getBoundingClientRect().top + window.scrollY + (want / distance) * scrollable();
    window.scrollTo({ top, behavior: 'instant' });
    snap(want);
  });
}
