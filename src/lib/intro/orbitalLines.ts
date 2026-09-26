import * as THREE from "three";

/** Persistent page-space ribbons. Only their revealed length changes on scroll. */
export function createOrbitalLines() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
  const lines = [3.8, 3, 2.6].map((linewidth, i) => {
    const geometry = new THREE.BufferGeometry();
    const rgb = [[36, 87, 255], [105, 138, 255], [156, 173, 240]][i];
    const halfWidth = linewidth / 2 + 1;
    const material = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Vector3(...rgb.map(c => c / 255)) }, uHalfWidth: { value: halfWidth } },
      vertexShader: `attribute float side; varying float vSide;
        void main() { vSide=side; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uHalfWidth; varying float vSide;
        void main() { float alpha=clamp((1.0-abs(vSide))*uHalfWidth,0.0,1.0); gl_FragColor=vec4(uColor,alpha); }`,
      transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    });
    const line = new THREE.Mesh(geometry, material);
    line.frustumCulled = false;
    scene.add(line);
    return { line, geometry, material, halfWidth, count: 0 };
  });

  return {
    resize(w: number, h: number, heroHeight: number, studioHeight: number) {
      camera.right = w;
      camera.bottom = h;
      camera.updateProjectionMatrix();
      // Preserve the original section-2 SVG's xMaxYMax slice mapping.
      const scale = Math.max(w / 1600, studioHeight / 1000);
      const sx = w - 1600 * scale;
      const sy = heroHeight + studioHeight - 1000 * scale;
      const point = (x: number, y: number) => new THREE.Vector3(sx + x * scale, sy + y * scale, 0);
      lines.forEach((entry, index) => {
        const radius = [760, 520, 620][index];
        const cx = index === 2 ? 160 : 1340;
        const cy = index === 2 ? -260 : 1120;
        const startAngle = index === 2 ? 0.1 : Math.PI;
        const endAngle = index === 2 ? Math.PI * 0.92 : Math.PI + (index === 0 ? 0.847 : 0.48);
        const join = point(cx + Math.cos(startAngle) * radius, cy + Math.sin(startAngle) * radius);
        const start = new THREE.Vector3(w * (0.72 - index * 0.22), heroHeight * (0.1 + index * 0.08), 0);
        const boundary = new THREE.Vector3(w * (0.25 + index * 0.24), heroHeight * 0.95, 0);
        const path = new THREE.CurvePath<THREE.Vector3>();
        path.add(new THREE.CubicBezierCurve3(start,
          new THREE.Vector3(w * (1.1 - index * 0.3), heroHeight * 0.36, 0),
          new THREE.Vector3(w * (-0.15 + index * 0.3), heroHeight * 0.5, 0), boundary));
        path.add(new THREE.CubicBezierCurve3(boundary,
          new THREE.Vector3(boundary.x + w * 0.22, heroHeight * 1.2, 0),
          new THREE.Vector3(join.x, join.y - studioHeight * 0.35, 0), join));
        const points = path.getSpacedPoints(320);
        // Finish on the original section-2 arcs, including the blue endpoint.
        for (let i = 1; i <= 160; i++) {
          const angle = startAngle + (endAngle - startAngle) * i / 160;
          points.push(point(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius));
        }
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
      }
      renderer.render(scene, camera);
    },
    dispose() {
      for (const entry of lines) { entry.geometry.dispose(); entry.material.dispose(); }
    },
  };
}
