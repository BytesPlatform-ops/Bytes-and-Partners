"use client";

import { useEffect, useRef, useState } from "react";
import {
  INTRO_LINE_LAYOUTS, lineBreakpoint, lineSegments,
  type LineBreakpoint, type LinePoint,
} from "@/lib/intro/lineData";

type Props = { root: React.RefObject<HTMLDivElement | null> };
const round = (n: number) => Number(n.toFixed(4));
const serialize = (breakpoint: LineBreakpoint, points: readonly LinePoint[]) =>
  `${breakpoint}: [\n${points.map(([x, y]) => `  [${round(x)}, ${round(y)}],`).join("\n")}\n],`;

/** Dev overlay: drag the intro line's B-spline control points. */
export default function LineDrawingTool({ root }: Props) {
  const [breakpoint, setBreakpoint] = useState<LineBreakpoint>("desktop");
  const [nodes, setNodes] = useState<LinePoint[]>([...INTRO_LINE_LAYOUTS.desktop]);
  const [draggingPanel, setDraggingPanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [panel, setPanel] = useState({ x: 24, y: 24 });
  const drag = useRef<number | null>(null);
  const panelStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

  useEffect(() => {
    const next = lineBreakpoint(window.innerWidth);
    setBreakpoint(next);
    setNodes([...INTRO_LINE_LAYOUTS[next]]);
  }, []);

  const toNormalized = (event: React.PointerEvent) => {
    const bounds = root.current?.getBoundingClientRect();
    if (!bounds) return null;
    return [(event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height] as const;
  };

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const index = drag.current;
    const point = toNormalized(event);
    if (index === null || !point) return;
    setNodes(current => current.map((node, i) => (i === index ? point : node)));
  };

  const segments = lineSegments(nodes);
  const k = (v: number) => v * 1000;
  const d = segments.length
    ? `M${k(segments[0][0][0])},${k(segments[0][0][1])}` + segments
      .map(s => ` C${s.slice(1).map(([x, y]) => `${k(x)},${k(y)}`).join(" ")}`).join("")
    : "";
  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 z-[90] h-full w-full touch-none overflow-visible"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        onPointerMove={onMove}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <path d={d} fill="none" stroke="#ff3158" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="6 6" />
        <polyline points={nodes.map(([x, y]) => `${k(x)},${k(y)}`).join(" ")} fill="none" stroke="#ff3158" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {nodes.map(([x, y], i) => (
          <circle
            key={i}
            cx={k(x)} cy={k(y)} r={6}
            vectorEffect="non-scaling-stroke"
            className="pointer-events-auto cursor-grab"
            fill="#ff3158" stroke="#fff" strokeWidth={2}
            onPointerDown={event => {
              event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
              drag.current = i;
            }}
          />
        ))}
      </svg>

      <aside
        className="fixed z-[100] w-64 select-none rounded-2xl border border-black/15 bg-[#f8f6ef]/95 p-3 font-mono text-[11px] text-black shadow-2xl backdrop-blur"
        style={{ left: panel.x, top: panel.y }}
      >
        <div
          className={`mb-3 flex cursor-grab items-center justify-between rounded-xl bg-black px-3 py-2 text-white ${draggingPanel ? "cursor-grabbing" : ""}`}
          onPointerDown={event => {
            event.currentTarget.setPointerCapture(event.pointerId);
            panelStart.current = { x: event.clientX, y: event.clientY, left: panel.x, top: panel.y };
            setDraggingPanel(true);
          }}
          onPointerMove={event => {
            if (!draggingPanel) return;
            setPanel({
              x: Math.max(8, panelStart.current.left + event.clientX - panelStart.current.x),
              y: Math.max(8, panelStart.current.top + event.clientY - panelStart.current.y),
            });
          }}
          onPointerUp={() => setDraggingPanel(false)}
          onPointerCancel={() => setDraggingPanel(false)}
        >
          <span>LINE EDITOR</span><span aria-hidden>⠿</span>
        </div>
        <p className="mb-3 leading-relaxed text-black/55">
          Drag control points; the B-spline stays curvature-smooth. Even spacing gives the fairest curve. Paste into INTRO_LINE_LAYOUTS.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setNodes([...INTRO_LINE_LAYOUTS[breakpoint]])} className="rounded-lg bg-black/8 px-3 py-2">Reset</button>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(serialize(breakpoint, nodes));
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            }}
            className="rounded-lg bg-black px-3 py-2 text-white"
          >
            {copied ? "Copied" : "Copy data"}
          </button>
        </div>
        <p className="mt-3 text-black/45">{breakpoint} · {nodes.length} control points · {segments.length} Bézier segments</p>
      </aside>
    </>
  );
}
