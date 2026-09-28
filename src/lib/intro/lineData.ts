export type LinePoint = readonly [x: number, y: number];

/** Change this to true to open the line drawing overlay in the browser. */
export const ENABLE_LINE_DRAWING_TOOL = false;

/**
 * Normalized against the full height of sections 1 + 2. Paste the output
 * from the drawing tool here; the WebGL line will use it at every viewport.
 */
export const INTRO_LINE_POINTS: readonly LinePoint[] = [
  [0.87, 0.105],
  [0.82, 0.16],
  [0.7, 0.22],
  [0.54, 0.27],
  [0.39, 0.32],
  [0.28, 0.38],
  [0.24, 0.44],
  [0.31, 0.51],
  [0.48, 0.59],
  [0.67, 0.66],
  [0.8, 0.68],
  [0.89, 0.72],
  [0.93, 0.79],
];
