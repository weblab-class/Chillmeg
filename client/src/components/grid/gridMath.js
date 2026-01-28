export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function key(x, y) {
  return `${x},${y}`;
}

export function centroid(cells) {
  if (!cells || cells.length === 0) return { x: 0, y: 0 };
  let sx = 0;
  let sy = 0;
  for (const c of cells) {
    sx += c.x + 0.5;
    sy += c.y + 0.5;
  }
  return { x: sx / cells.length, y: sy / cells.length };
}
