import * as THREE from "three";
import { INTRO_LINE_POINTS } from "./lineData";

/** One persistent, antialiased page-space curve. Its rounded tip follows the reveal. */
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
    transparent: true, depthTest: false, depthWrite: false,
  });
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
  const lines = [12].map((linewidth) => {
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
    startCap.scale.setScalar(halfWidth);
    endCap.scale.setScalar(halfWidth);
    startCap.visible = false;
    endCap.visible = false;
    scene.add(startCap, endCap);
    return { line, geometry, material, halfWidth, count: 0, points: [] as THREE.Vector3[], startCap, endCap };
  });

  return {
    resize(w: number, h: number, heroHeight: number, studioHeight: number) {
      camera.right = w;
      camera.bottom = h;
      camera.updateProjectionMatrix();
      lines.forEach((entry) => {
        const totalHeight = heroHeight + studioHeight;
        const controlPoints = INTRO_LINE_POINTS.map(([x, y]) => new THREE.Vector3(x * w, y * totalHeight, 0));
        const curve = new THREE.CatmullRomCurve3(controlPoints, false, "centripetal", 0.35);
        const points = curve.getSpacedPoints(1024);
        entry.points = points;
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
