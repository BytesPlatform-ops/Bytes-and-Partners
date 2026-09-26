/** Local SVG displacement keeps the studio copy live HTML and selectable. */
export function createTextLiquid(element: HTMLElement) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  const id = `studio-liquid-${Math.random().toString(36).slice(2)}`;
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  svg.innerHTML = `<defs><filter id="${id}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-color="rgb(128,128,128)" result="neutral"/>
    <feTurbulence type="fractalNoise" baseFrequency=".012 .021" numOctaves="2" seed="7" result="noise"/>
    <feImage preserveAspectRatio="none" result="mask"/>
    <feGaussianBlur in="mask" stdDeviation="16" result="softMask"/>
    <feComposite in="noise" in2="softMask" operator="in" result="localNoise"/>
    <feComposite in="localNoise" in2="neutral" operator="over" result="field"/>
    <feDisplacementMap in="SourceGraphic" in2="field" scale="32" xChannelSelector="R" yChannelSelector="G"/>
  </filter></defs>`;
  document.body.append(svg);
  const filter = svg.querySelector("filter")!;
  const image = svg.querySelector("feImage")!;
  const noise = svg.querySelector("feTurbulence")!;
  const history: Array<{ x: number; y: number; age: number }> = [];
  let lastX = -1;
  let lastY = -1;
  let elapsed = 0;
  let pending = 0;
  return {
    update(dt: number, x: number, y: number, active: boolean) {
      elapsed += dt;
      pending += dt;
      history.forEach(point => { point.age += dt; });
      while (history[0]?.age > 1.2) history.shift();
      if (active && (Math.abs(x - lastX) + Math.abs(y - lastY) > 2)) {
        history.push({ x, y, age: 0 });
        if (history.length > 18) history.shift();
      }
      lastX = x;
      lastY = y;
      if (!active || !history.length) { element.style.filter = ""; return; }
      if (pending < 1 / 30) return;
      pending = 0;
      const rect = element.getBoundingClientRect();
      if (!history.some(p => p.x > rect.left - 100 && p.x < rect.right + 100 && p.y > rect.top - 100 && p.y < rect.bottom + 100)) {
        element.style.filter = "";
        return;
      }
      const w = rect.width + 64;
      const h = rect.height + 64;
      for (const node of [filter, image]) {
        node.setAttribute("x", "-32"); node.setAttribute("y", "-32");
        node.setAttribute("width", String(w)); node.setAttribute("height", String(h));
      }
      const marks = history.map((p, i) => {
        const x = p.x - rect.left, y = p.y - rect.top;
        const prev = history[Math.max(0, i - 1)];
        return `<path d="M${prev.x - rect.left} ${prev.y - rect.top}L${x} ${y}" stroke="white" stroke-width="${70 + 25 * Math.sin(i * 1.7)}" stroke-linecap="round" opacity="${Math.max(0, 1 - p.age / 1.2)}"/>`;
      }).join("");
      image.setAttribute("href", `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="${ns}" viewBox="-32 -32 ${w} ${h}">${marks}</svg>`)}`);
      noise.setAttribute("baseFrequency", `${0.012 + Math.sin(elapsed * 0.7) * 0.003} ${0.021 + Math.cos(elapsed * 0.6) * 0.004}`);
      element.style.filter = `url(#${id})`;
    },
    dispose() { element.style.filter = ""; svg.remove(); },
  };
}
