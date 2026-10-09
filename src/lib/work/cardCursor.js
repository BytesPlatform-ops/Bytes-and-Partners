import * as THREE from 'three';

// A small transparent WebGL surface keeps the fluid cursor independent of the
// shared scene's camera and post-processing. It renders only while visible.
export function createCardCursor(reducedMotion) {
  const element = document.createElement('div');
  element.className = 'work-card-cursor';
  element.setAttribute('aria-hidden', 'true');
  element.innerHTML = '<span class="work-card-cursor-icon"><svg viewBox="0 0 32 32" fill="none"><path d="M8 24 24 8M8 8h16v16" /></svg></span>';
  document.body.appendChild(element);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(160, 160);
    renderer.setClearColor(0, 0);
    element.prepend(renderer.domElement);
  } catch {
    element.classList.add('work-card-cursor--fallback');
  }
  const uniforms = {
    uOpen: { value: 0 }, uTime: { value: 0 },
    uVelocity: { value: new THREE.Vector2() },
  };
  const material = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false, uniforms,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
    fragmentShader: `varying vec2 vUv;
      uniform float uOpen, uTime;
      uniform vec2 uVelocity;
      void main() {
        vec2 p = (vUv - .5) * 2.;
        float speed = min(length(uVelocity), 1.);
        vec2 direction = normalize(uVelocity + vec2(.0001));
        vec2 perpendicular = vec2(-direction.y, direction.x);
        p = vec2(dot(p, direction) / (1. + speed * .2), dot(p, perpendicular) * (1. + speed * .12));
        float angle = atan(p.y, p.x);
        float liquid = sin(angle * 3. + uTime * 2.2) * .022 + sin(angle * 5. - uTime * 1.7) * .009;
        float opening = sin(clamp(uOpen, 0., 1.) * 3.14159);
        float radius = .64 * uOpen + liquid * uOpen * (.3 + speed + opening * 1.5);
        float alpha = 1. - smoothstep(radius - .012, radius, length(p));
        if (uOpen < .003) discard;
        gl_FragColor = vec4(vec3(.969, .969, .98), alpha);
      }`,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.Camera();
  const target = new THREE.Vector2();
  const current = new THREE.Vector2();
  let positioned = false;
  let visible = false;
  let frame = 0;
  let lastTime = 0;
  let opening = 0;
  let disposed = false;
  function tick(time) {
    frame = 0;
    if (disposed) return;
    const dt = Math.min((time - (lastTime || time - 16)) / 1000, .05);
    lastTime = time;
    const follow = reducedMotion.matches ? 1 : 1 - Math.exp(-10 * dt);
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    current.lerp(target, follow);
    opening = reducedMotion.matches ? Number(visible) : THREE.MathUtils.damp(opening, Number(visible), visible ? 11 : 16, dt);
    uniforms.uOpen.value = opening;
    uniforms.uTime.value = reducedMotion.matches ? 0 : time * .001;
    uniforms.uVelocity.value.set(reducedMotion.matches ? 0 : dx / 100, reducedMotion.matches ? 0 : -dy / 100);
    element.style.transform = `translate3d(${current.x - 80}px, ${current.y - 80}px, 0)`;
    element.style.setProperty('--cursor-open', opening.toFixed(4));
    renderer?.render(scene, camera);
    if (visible || opening > .003) frame = requestAnimationFrame(tick);
    else { element.style.visibility = 'hidden'; positioned = false; lastTime = 0; }
  }
  return {
    move(x, y) {
      target.set(x, y);
      if (!positioned) { current.copy(target); positioned = true; }
    },
    show(available = true) {
      element.dataset.available = String(available);
      visible = true;
      element.classList.add('is-visible');
      element.style.visibility = 'visible';
      if (!frame) frame = requestAnimationFrame(tick);
    },
    hide() {
      visible = false;
      element.classList.remove('is-visible');
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      geometry.dispose(); material.dispose(); renderer?.dispose();
      element.remove();
    },
  };
}
