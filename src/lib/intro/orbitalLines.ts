import * as THREE from "three";
import { INTRO_LINE_LAYOUTS, SERVICES_LINE_LAYOUTS, lineBreakpoint, lineSegments, type LinePoint } from "./lineData";

/** Path pixels drawn per pixel scrolled, at least. */
const REVEAL_MIN_SPEED = 8;
/** Let the drawing tip lead just beyond the viewport so the shortened
 * services handoff can reveal its complete lower sweep without dead scroll. */
const REVEAL_LEAD = 1.1;
/** Scroll offset at which each sample is drawn at a steady pace along the
 * path, while allowing the configured viewport lead. */
function revealSchedule(points: THREE.Vector3[], step: number, viewport: number) {
  const schedule = [0];
  let deepest = points[0].y;
  for (let i = 1; i < points.length; i++) {
    deepest = Math.max(deepest, points[i].y);
    schedule.push(Math.max(schedule[i - 1] + step, deepest - viewport * REVEAL_LEAD));
  }
  return schedule;
}

/**
 * One persistent, antialiased page-space curve built from tangent-continuous
 * cubic Béziers. Its rounded tip follows the reveal along the path.
 */
export function createOrbitalLines() {
  const scene = new THREE.Scene();
  const capGeometry = new THREE.CircleGeometry(1, 48);
  const capRadii = new Float32Array(capGeometry.attributes.position.count);
  for (let i = 0; i < capRadii.length; i++) {
    const p = capGeometry.attributes.position;
    capRadii[i] = Math.min(1, Math.hypot(p.getX(i), p.getY(i)));
  }
  capGeometry.setAttribute("radius", new THREE.BufferAttribute(capRadii, 1));
  const capMaterial = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Vector3(36 / 255, 87 / 255, 1) } },
    vertexShader: `attribute float radius; varying float vRadius;
      void main(){vRadius=radius;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform vec3 uColor; varying float vRadius;
      void main(){float aa=max(fwidth(vRadius),0.001);float alpha=1.0-smoothstep(1.0-aa,1.0,vRadius);gl_FragColor=vec4(uColor,alpha);}`,
    // The y-down camera flips winding; without DoubleSide the caps are culled.
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
  });
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
  const lines = [18].map((linewidth) => {
    const geometry = new THREE.BufferGeometry();
    const rgb = [36, 87, 255];
    const halfWidth = linewidth / 2;
    const material = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Vector3(...rgb.map(c => c / 255)) }, uHalfWidth: { value: halfWidth } },
      vertexShader: `attribute float side; varying float vSide;
        void main() { vSide=side; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; varying float vSide;
        void main(){float aa=max(fwidth(vSide),0.001);float alpha=1.0-smoothstep(1.0-aa,1.0,abs(vSide));gl_FragColor=vec4(uColor,alpha);}`,
      transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    });
    const line = new THREE.Mesh(geometry, material);
    line.frustumCulled = false;
    scene.add(line);
    const startCap = new THREE.Mesh(capGeometry, capMaterial);
    const endCap = new THREE.Mesh(capGeometry, capMaterial);
    startCap.visible = false;
    endCap.visible = false;
    scene.add(startCap, endCap);
    return { line, geometry, material, linewidth, halfWidth, count: 0, points: [] as THREE.Vector3[], schedule: [] as number[], startCap, endCap };
  });

  return {
    /** Fraction of the path drawn at this scroll offset into the intro. */
    progressAtScroll(scroll: number) {
      const { schedule, count } = lines[0];
      if (!count || scroll <= 0) return 0;
      let lo = 0;
      let hi = schedule.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (schedule[mid] <= scroll) lo = mid; else hi = mid - 1;
      }
      return lo / count;
    },
    resize(w: number, h: number, heroHeight: number, studioHeight: number, servicesHeight: number) {
      camera.right = w;
      camera.bottom = h;
      camera.updateProjectionMatrix();
      lines.forEach((entry) => {
        const introHeight = heroHeight + studioHeight;
        // Viewport width, like the CSS breakpoints that lay out the content.
        const breakpoint = lineBreakpoint(window.innerWidth);
        const introPoints = INTRO_LINE_LAYOUTS[breakpoint].map(([x, y]) => [x * w, y * introHeight] as LinePoint);
        const servicePoints = SERVICES_LINE_LAYOUTS[breakpoint].map(([x, y]) => [x * w, introHeight + y * servicesHeight] as LinePoint);
        const pagePoints = [...introPoints, ...servicePoints];
        const curve = new THREE.CurvePath<THREE.Vector3>();
        for (const segment of lineSegments(pagePoints)) {
          const [a, b, c, d] = segment.map(([x, y]) => new THREE.Vector3(x, y, 0));
          curve.add(new THREE.CubicBezierCurve3(a, b, c, d));
        }
        entry.halfWidth = (breakpoint === "mobile" ? entry.linewidth * 0.8 : entry.linewidth) / 2;
        entry.startCap.scale.setScalar(entry.halfWidth);
        entry.endCap.scale.setScalar(entry.halfWidth);
        // Arc-length spacing of ~2px keeps the strip smooth on the widest turns.
        const points = curve.getSpacedPoints(Math.max(512, Math.ceil(curve.getLength() / 2)));
        entry.points = points;
        // Find the slowest pace (never under REVEAL_MIN_SPEED) that still
        // finishes in the final portion of Services, so the same line keeps
        // drawing through the hero, reel and service-card composition.
        const spacing = curve.getLength() / (points.length - 1);
        const finish = introHeight + servicesHeight * 0.82;
        let slow = REVEAL_MIN_SPEED;
        let fast = 200;
        if (revealSchedule(points, spacing / slow, h).at(-1)! > finish) {
          for (let i = 0; i < 24; i++) {
            const mid = (slow + fast) / 2;
            if (revealSchedule(points, spacing / mid, h).at(-1)! > finish) slow = mid; else fast = mid;
          }
          slow = fast;
        }
        entry.schedule = revealSchedule(points, spacing / slow, h);
        // A single joined triangle strip avoids overlapping segment caps and
        // their dark/dotted seams when thick lines use transparency.
        const positions: number[] = [];
        const sides: number[] = [];
        const indices: number[] = [];
        points.forEach((p, i) => {
          const before = points[Math.max(0, i - 1)];
          const after = points[Math.min(points.length - 1, i + 1)];
          const tangent = after.clone().sub(before).normalize();
          const nx = -tangent.y * entry.halfWidth;
          const ny = tangent.x * entry.halfWidth;
          positions.push(p.x + nx, p.y + ny, 0, p.x - nx, p.y - ny, 0);
          sides.push(1, -1);
          if (i < points.length - 1) {
            const j = i * 2;
            indices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2);
          }
        });
        entry.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        entry.geometry.setAttribute("side", new THREE.Float32BufferAttribute(sides, 1));
        entry.geometry.setIndex(indices);
        entry.count = points.length - 1;
      });
    },
    render(renderer: THREE.WebGLRenderer, pageOffset: number, progress: number) {
      camera.position.y = pageOffset;
      for (const entry of lines) {
        const count = Math.floor(entry.count * THREE.MathUtils.clamp(progress, 0, 1));
        entry.geometry.setDrawRange(0, count * 6);
        entry.line.visible = count > 0;
        entry.startCap.visible = count > 0;
        entry.endCap.visible = count > 0;
        if (count > 0) {
          entry.startCap.position.copy(entry.points[0]);
          entry.endCap.position.copy(entry.points[count]);
        }
      }
      renderer.render(scene, camera);
    },
    dispose() {
      for (const entry of lines) { entry.geometry.dispose(); entry.material.dispose(); }
      capGeometry.dispose();
      capMaterial.dispose();
    },
  };
}
