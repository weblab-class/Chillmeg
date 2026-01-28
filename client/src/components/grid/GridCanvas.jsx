import React, { useEffect, useMemo, useRef } from "react";
import { clamp, centroid, key } from "./gridMath";

export default function GridCanvas({
  splats,
  selectedCells,
  isMineSplat,
  onToggleCell,
  onOpenSplat,
  onHover,
}) {
  const canvasRef = useRef(null);

  const camRef = useRef({ offsetX: 0, offsetY: 0, scale: 60 });
  const panRef = useRef({
    active: false,
    armed: false,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
    wasPan: false,
    cell: null,
  });

  const hoverCellRef = useRef(null);

  const occupiedCellToSplat = useMemo(() => {
    const map = new Map();
    for (const s of splats) {
      for (const c of s.cells || []) map.set(key(c.x, c.y), s);
    }
    return map;
  }, [splats]);

  function resizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function screenToWorld(px, py) {
    const c = camRef.current;
    return { x: (px - c.offsetX) / c.scale, y: (py - c.offsetY) / c.scale };
  }

  function worldToScreen(wx, wy) {
    const c = camRef.current;
    return { x: wx * c.scale + c.offsetX, y: wy * c.scale + c.offsetY };
  }

  function drawMergedOutline(ctx, cells, strokeStyle, lineWidth) {
    const size = camRef.current.scale;
    const set = new Set((cells || []).map((c) => key(c.x, c.y)));

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();

    for (const c of cells || []) {
      const p = worldToScreen(c.x, c.y);
      const x0 = p.x;
      const y0 = p.y;
      const x1 = p.x + size;
      const y1 = p.y + size;

      if (!set.has(key(c.x, c.y - 1))) {
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y0);
      }
      if (!set.has(key(c.x + 1, c.y))) {
        ctx.moveTo(x1, y0);
        ctx.lineTo(x1, y1);
      }
      if (!set.has(key(c.x, c.y + 1))) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x0, y1);
      }
      if (!set.has(key(c.x - 1, c.y))) {
        ctx.moveTo(x0, y1);
        ctx.lineTo(x0, y0);
      }
    }

    ctx.stroke();
  }

  function drawGrid(ctx) {
    const canvas = canvasRef.current;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    const tl = screenToWorld(0, 0);
    const br = screenToWorld(w, h);

    const startX = Math.floor(tl.x) - 2;
    const endX = Math.ceil(br.x) + 2;
    const startY = Math.floor(tl.y) - 2;
    const endY = Math.ceil(br.y) + 2;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();

    for (let x = startX; x <= endX; x += 1) {
      const p1 = worldToScreen(x, startY);
      const p2 = worldToScreen(x, endY);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }

    for (let y = startY; y <= endY; y += 1) {
      const p1 = worldToScreen(startX, y);
      const p2 = worldToScreen(endX, y);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }

    ctx.stroke();
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);

    drawGrid(ctx);

    for (const s of splats) {
      const mine = isMineSplat(s);
      const stroke = mine ? "rgba(255,0,0,0.90)" : "rgba(255,255,255,0.80)";
      const dot = mine ? "rgba(255,0,0,0.95)" : "rgba(255,255,255,0.90)";

      drawMergedOutline(ctx, s.cells, stroke, 3);

      const cen = centroid(s.cells || []);
      const p = worldToScreen(cen.x, cen.y);

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, camRef.current.scale * 0.06), 0, Math.PI * 2);
      ctx.fillStyle = dot;
      ctx.fill();
    }

    if (selectedCells.length > 0) {
      drawMergedOutline(ctx, selectedCells, "rgba(255,255,255,0.95)", 4);
    }

    const hc = hoverCellRef.current;
    if (hc) {
      const p = worldToScreen(hc.x, hc.y);
      const size = camRef.current.scale;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255,255,255,0.90)";
      ctx.strokeRect(p.x + 1, p.y + 1, size - 2, size - 2);
    }
  }

  useEffect(() => {
    resizeCanvas();
    draw();

    const onResize = () => {
      resizeCanvas();
      draw();
    };

    window.addEventListener("resize", onResize);

    const onWinMouseUp = () => {
      panRef.current.active = false;
      panRef.current.armed = false;
    };
    window.addEventListener("mouseup", onWinMouseUp);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseup", onWinMouseUp);
    };
  }, []);

  // Keep canvas sized with its parent (handles layout changes like the right panel appearing)
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent || typeof ResizeObserver === "undefined") return;

    const obs = new ResizeObserver(() => {
      resizeCanvas();
      draw();
    });
    obs.observe(parent);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    draw();
  }, [splats, selectedCells]);

  function getCanvasPoint(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { px: e.clientX - rect.left, py: e.clientY - rect.top };
  }

  function cellFromEvent(e) {
    const { px, py } = getCanvasPoint(e);
    const w = screenToWorld(px, py);
    return { x: Math.floor(w.x), y: Math.floor(w.y) };
  }

  return (
    <canvas
      ref={canvasRef}
      className="gridmapCanvas"
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={(e) => {
        const cell = cellFromEvent(e);
        hoverCellRef.current = cell;

        const splat = occupiedCellToSplat.get(key(cell.x, cell.y)) || null;
        onHover({ cell, splat, mouse: { x: e.clientX, y: e.clientY } });

        if (panRef.current.active) {
          camRef.current.offsetX = panRef.current.ox + (e.clientX - panRef.current.sx);
          camRef.current.offsetY = panRef.current.oy + (e.clientY - panRef.current.sy);
          draw();
          return;
        }

        if (panRef.current.armed && e.buttons & 1) {
          const dx = e.clientX - panRef.current.sx;
          const dy = e.clientY - panRef.current.sy;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            panRef.current.active = true;
            panRef.current.wasPan = true;
            panRef.current.ox = camRef.current.offsetX;
            panRef.current.oy = camRef.current.offsetY;
            camRef.current.offsetX = panRef.current.ox + dx;
            camRef.current.offsetY = panRef.current.oy + dy;
            draw();
            return;
          }
        }

        draw();
      }}
      onMouseDown={(e) => {
        const cell = cellFromEvent(e);
        hoverCellRef.current = cell;

        const splat = occupiedCellToSplat.get(key(cell.x, cell.y)) || null;
        onHover({ cell, splat, mouse: { x: e.clientX, y: e.clientY } });

        panRef.current.wasPan = false;
        panRef.current.cell = cell;

        if (e.button === 1 || e.button === 2) {
          panRef.current.active = true;
          panRef.current.sx = e.clientX;
          panRef.current.sy = e.clientY;
          panRef.current.ox = camRef.current.offsetX;
          panRef.current.oy = camRef.current.offsetY;
          return;
        }

        if (e.button === 0) {
          panRef.current.armed = true;
          panRef.current.sx = e.clientX;
          panRef.current.sy = e.clientY;
          panRef.current.ox = camRef.current.offsetX;
          panRef.current.oy = camRef.current.offsetY;
        }
      }}
      onMouseUp={(e) => {
        const wasPan = panRef.current.wasPan;
        const armed = panRef.current.armed;
        const cell = panRef.current.cell || cellFromEvent(e);
        const splat = occupiedCellToSplat.get(key(cell.x, cell.y)) || null;

        panRef.current.active = false;
        panRef.current.armed = false;
        panRef.current.cell = null;

        if (e.button === 0 && armed && !wasPan) {
          if (splat) {
            onOpenSplat(splat);
            return;
          }
          onToggleCell(cell);
        }
      }}
      onMouseLeave={() => {
        panRef.current.active = false;
        panRef.current.armed = false;
      }}
      onWheel={(e) => {
        e.preventDefault();

        const { px, py } = getCanvasPoint(e);
        const before = screenToWorld(px, py);

        const zoom = Math.exp((-e.deltaY / 500) * 0.9);
        const nextScale = clamp(camRef.current.scale * zoom, 12, 140);

        camRef.current.scale = nextScale;
        camRef.current.offsetX = px - before.x * nextScale;
        camRef.current.offsetY = py - before.y * nextScale;

        draw();
      }}
    />
  );
}
