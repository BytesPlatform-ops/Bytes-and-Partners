"use client";

import { useRef, useState } from "react";
import { INTRO_LINE_POINTS, type LinePoint } from "@/lib/intro/lineData";

type Props = { root: React.RefObject<HTMLDivElement | null> };

const serialize = (points: readonly LinePoint[]) =>
  `export const INTRO_LINE_POINTS = [\n${points
    .map(([x, y]) => `  [${x.toFixed(4)}, ${y.toFixed(4)}],`)
    .join("\n")}\n] as const;`;

export default function LineDrawingTool({ root }: Props) {
  const [points, setPoints] = useState<LinePoint[]>([...INTRO_LINE_POINTS]);
  const [drawing, setDrawing] = useState(false);
  const [draggingPanel, setDraggingPanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [panel, setPanel] = useState({ x: 24, y: 24 });
  const drawingRef = useRef(false);
  const panelStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

  const pointFromEvent = (event: React.PointerEvent<SVGSVGElement>): LinePoint | null => {
    const bounds = root.current?.getBoundingClientRect();
    if (!bounds) return null;
    return [
      Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    ];
  };

  const addPoint = (event: React.PointerEvent<SVGSVGElement>) => {
    const next = pointFromEvent(event);
    if (!next) return;
    setPoints(current => {
      const previous = current.at(-1);
      if (previous && Math.hypot((next[0] - previous[0]) * innerWidth, (next[1] - previous[1]) * innerHeight) < 5) return current;
      return [...current, next];
    });
  };

  return (
    <>
      <svg
        className={`absolute inset-0 z-[90] h-full w-full touch-none ${drawing ? "cursor-crosshair pointer-events-auto" : "pointer-events-none"}`}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        onPointerDown={event => {
          if (!drawing) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          drawingRef.current = true;
          addPoint(event);
        }}
        onPointerMove={event => { if (drawingRef.current) addPoint(event); }}
        onPointerUp={event => {
          drawingRef.current = false;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { drawingRef.current = false; }}
      >
        <polyline
          points={points.map(([x, y]) => `${x * 1000},${y * 1000}`).join(" ")}
          fill="none"
          stroke="#ff3158"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
          <span>LINE DRAWER</span><span aria-hidden>⠿</span>
        </div>
        <p className="mb-3 leading-relaxed text-black/55">
          Draw a portion, turn Draw off to scroll, then continue. Clear starts a new line.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setDrawing(value => !value)} className={`rounded-lg px-3 py-2 ${drawing ? "bg-blue text-white" : "bg-black/8"}`}>
            {drawing ? "Drawing on" : "Draw"}
          </button>
          <button type="button" onClick={() => setPoints(value => value.slice(0, -1))} className="rounded-lg bg-black/8 px-3 py-2">Undo point</button>
          <button type="button" onClick={() => setPoints([])} className="rounded-lg bg-black/8 px-3 py-2">Clear</button>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(serialize(points));
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            }}
            className="rounded-lg bg-black px-3 py-2 text-white"
          >
            {copied ? "Copied" : "Copy data"}
          </button>
        </div>
        <p className="mt-3 text-black/45">{points.length} points · normalized x/y</p>
      </aside>
    </>
  );
}
