export type LinePoint = readonly [x: number, y: number];

/**
 * The intro line is a cubic B-spline through these control points, normalized:
 * x against the viewport width, y against the full height of sections 1 + 2.
 * A B-spline is curvature-continuous everywhere, so bends ease in and out
 * instead of snapping between arcs and straights — no corners, even at loops.
 * The curve stays inside the control polygon; evenly spaced points give the
 * fairest curve, and points on a circle give a round loop.
 */
export type LineLayout = readonly LinePoint[];

/** Change this to true to open the line editor overlay in the browser. */
export const ENABLE_LINE_DRAWING_TOOL = false;

/**
 * One continuous stroke: a broad arc enters from the right, curls through a
 * large loop, crosses itself, sweeps down and curls once more — a smaller
 * cursive loop — before rising out to the right. Points outside 0–1 on x sit
 * off-screen. Desktop loops beside the section 2 copy; on tablet/mobile the
 * copy is full width, so the big loop moves into the open top of the hero,
 * the line runs down the left margin past the copy and the small loop sits in
 * the gap above the video.
 */
export const INTRO_LINE_LAYOUTS = {
  desktop: [
    [1.0365, 0.1187], [0.8333, 0.121], [0.651, 0.1519], [0.5104, 0.2183], [0.4271, 0.3132],
    [0.3896, 0.4271], [0.4197, 0.5724], [0.433, 0.6545], [0.3711, 0.7202], [0.2703, 0.731],
    [0.1897, 0.6806], [0.1764, 0.5985], [0.2383, 0.5328], [0.3391, 0.522], [0.4583, 0.5411],
    [0.5208, 0.6217], [0.5781, 0.7024], [0.6458, 0.7641], [0.7135, 0.7916], [0.8012, 0.7622],
    [0.8318, 0.7375], [0.8387, 0.6998], [0.8187, 0.6666], [0.7813, 0.6535], [0.7438, 0.6666],
    [0.7238, 0.6998], [0.7307, 0.7375], [0.7613, 0.7622], [0.8542, 0.7954], [0.9219, 0.7897],
    [0.9896, 0.7727], [1.0573, 0.7523], [1.1042, 0.738],
  ],
  tablet: [
    [1.0976, 0.0369], [0.9512, 0.0395], [0.8293, 0.057], [0.7805, 0.0871], [0.7766, 0.1364],
    [0.7342, 0.1839], [0.5689, 0.2101], [0.3775, 0.1995], [0.2722, 0.1585], [0.3146, 0.1109],
    [0.4799, 0.0847], [0.8049, 0.0938], [0.9146, 0.1407], [0.878, 0.201], [0.6829, 0.2647],
    [0.4146, 0.3216], [0.1707, 0.3786], [0.0549, 0.4355], [0.0488, 0.4925], [0.1098, 0.5494],
    [0.2439, 0.5997], [0.4146, 0.6298], [0.5488, 0.6298], [0.7246, 0.6274], [0.7885, 0.6121],
    [0.803, 0.5886], [0.7613, 0.568], [0.6829, 0.5598], [0.6045, 0.568], [0.5628, 0.5886],
    [0.5773, 0.6121], [0.6412, 0.6274], [0.8293, 0.6352], [0.9756, 0.6365], [1.122, 0.6315],
    [1.2683, 0.6248],
  ],
  mobile: [
    [1.2051, 0.0281], [1.0385, 0.029], [0.8718, 0.0412], [0.7692, 0.0749], [0.7136, 0.1501],
    [0.666, 0.1893], [0.4806, 0.2109], [0.266, 0.2022], [0.148, 0.1684], [0.1955, 0.1292],
    [0.3809, 0.1076], [0.6154, 0.1007], [0.8462, 0.1171], [0.9436, 0.178], [0.8462, 0.2529],
    [0.6154, 0.3279], [0.3333, 0.3981], [0.1154, 0.4637], [0.0564, 0.5293], [0.0769, 0.5948],
    [0.2308, 0.6426], [0.4359, 0.6614], [0.7484, 0.6497], [0.8344, 0.6361], [0.8539, 0.6152],
    [0.7978, 0.5969], [0.6923, 0.5897], [0.5868, 0.5969], [0.5307, 0.6152], [0.5502, 0.6361],
    [0.6362, 0.6497], [0.8718, 0.6642], [1.0769, 0.6614], [1.2821, 0.6548], [1.4872, 0.6487],
  ],
} satisfies Record<string, LineLayout>;

export type LineBreakpoint = keyof typeof INTRO_LINE_LAYOUTS;

/**
 * Continuation through the services section. Its first point begins above the
 * section boundary, where the intro curve ends, so both parts become one
 * spline instead of two strokes meeting at a seam.
 */
export const SERVICES_LINE_LAYOUTS = {
  desktop: [
    [1.104, -0.2], [1.055, -0.11], [0.99, -0.025], [0.92, 0.055], [0.82, 0.105],
    [0.73, 0.145], [0.67, 0.19], [0.65, 0.235], [0.67, 0.275], [0.73, 0.31],
    [0.81, 0.34], [0.89, 0.345], [0.94, 0.32], [0.955, 0.28], [0.94, 0.24],
    [0.9, 0.215], [0.86, 0.22], [0.835, 0.255], [0.845, 0.3], [0.89, 0.36],
    [0.93, 0.42], [0.94, 0.485], [0.89, 0.535], [0.79, 0.57], [0.66, 0.575],
    [0.52, 0.55], [0.38, 0.515], [0.24, 0.485], [0.12, 0.495], [0.04, 0.545],
    [-0.005, 0.625], [0.005, 0.705], [0.06, 0.78], [0.16, 0.835], [0.29, 0.86],
    [0.43, 0.85], [0.58, 0.87], [0.73, 0.9], [0.88, 0.945], [1.06, 1.04],
  ],
  tablet: [
    [1.268, -0.18], [1.1, -0.08], [0.96, 0.015], [0.82, 0.075], [0.72, 0.12],
    [0.67, 0.17], [0.68, 0.22], [0.75, 0.255], [0.84, 0.27], [0.92, 0.255],
    [0.955, 0.22], [0.94, 0.18], [0.89, 0.16], [0.85, 0.18], [0.845, 0.22],
    [0.88, 0.275], [0.93, 0.33], [0.92, 0.375], [0.84, 0.405], [0.7, 0.41],
    [0.54, 0.385], [0.37, 0.35], [0.2, 0.335], [0.07, 0.37], [-0.01, 0.445],
    [0.01, 0.535], [0.1, 0.61], [0.25, 0.65], [0.43, 0.64], [0.61, 0.67],
    [0.79, 0.72], [0.96, 0.8], [1.14, 0.92],
  ],
  mobile: [
    [1.487, -0.17], [1.18, -0.075], [0.98, 0.01], [0.82, 0.065], [0.72, 0.105],
    [0.67, 0.145], [0.68, 0.19], [0.75, 0.22], [0.84, 0.23], [0.92, 0.215],
    [0.955, 0.18], [0.94, 0.145], [0.89, 0.125], [0.85, 0.145], [0.845, 0.18],
    [0.88, 0.23], [0.93, 0.275], [0.92, 0.315], [0.83, 0.345], [0.68, 0.35],
    [0.5, 0.325], [0.32, 0.295], [0.15, 0.3], [0.03, 0.35], [-0.015, 0.43],
    [0.02, 0.515], [0.13, 0.58], [0.3, 0.61], [0.49, 0.605], [0.68, 0.65],
    [0.86, 0.72], [1.04, 0.82], [1.22, 0.94],
  ],
} satisfies Record<LineBreakpoint, LineLayout>;

export const lineBreakpoint = (width: number): LineBreakpoint =>
  width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";

/**
 * Exact cubic Bézier segments [start, handle, handle, end] of the uniform
 * B-spline, clamped so it starts and ends on the first and last points.
 */
export function lineSegments(points: LineLayout) {
  const q = [points[0], points[0], ...points, points.at(-1)!, points.at(-1)!];
  const mix = (weights: number[], ps: readonly LinePoint[]) =>
    [0, 1].map(k => weights.reduce((sum, w, i) => sum + w * ps[i][k], 0)) as [number, number];
  const segments: [number, number][][] = [];
  for (let i = 0; i + 3 < q.length; i++) {
    const [a, b, c, d] = q.slice(i, i + 4);
    segments.push([
      mix([1 / 6, 4 / 6, 1 / 6], [a, b, c]),
      mix([2 / 3, 1 / 3], [b, c]),
      mix([1 / 3, 2 / 3], [b, c]),
      mix([1 / 6, 4 / 6, 1 / 6], [b, c, d]),
    ]);
  }
  return segments;
}
