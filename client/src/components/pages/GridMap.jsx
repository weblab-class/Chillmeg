import React, { useEffect, useRef, useState } from "react";
import "./GridMap.css";

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function cellKeyXY(x, y) {
  return `${x},${y}`;
}

export default function GridMap() {
  const canvasRef = useRef(null);

  const camRef = useRef({
    offsetX: 0,
    offsetY: 0,
    scale: 60,
  });

  const [hoverCell, setHoverCell] = useState(null);
  const hoverRef = useRef(null);

  const [selectedCells, setSelectedCells] = useState([]);
  const selectedRef = useRef([]);

  const panRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

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
    const cam = camRef.current;
    return {
      x: (px - cam.offsetX) / cam.scale,
      y: (py - cam.offsetY) / cam.scale,
    };
  }

  function worldToScreen(wx, wy) {
    const cam = camRef.current;
    return {
      x: wx * cam.scale + cam.offsetX,
      y: wy * cam.scale + cam.offsetY,
    };
  }

  function drawSelectionMergedOutline(ctx) {
    const cam = camRef.current;
    const size = cam.scale;

    const sel = selectedRef.current;
    if (!sel || sel.length === 0) return;

    const set = new Set(sel.map((c) => cellKeyXY(c.x, c.y)));

    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();

    for (const c of sel) {
      const x = c.x;
      const y = c.y;

      const hasTop = set.has(cellKeyXY(x, y - 1));
      const hasBottom = set.has(cellKeyXY(x, y + 1));
      const hasLeft = set.has(cellKeyXY(x - 1, y));
      const hasRight = set.has(cellKeyXY(x + 1, y));

      const p = worldToScreen(x, y);
      const x0 = p.x;
      const y0 = p.y;
      const x1 = p.x + size;
      const y1 = p.y + size;

      if (!hasTop) {
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y0);
      }
      if (!hasRight) {
        ctx.moveTo(x1, y0);
        ctx.lineTo(x1, y1);
      }
      if (!hasBottom) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x0, y1);
      }
      if (!hasLeft) {
        ctx.moveTo(x0, y1);
        ctx.lineTo(x0, y0);
      }
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

    const cam = camRef.current;

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

    drawSelectionMergedOutline(ctx);

    if (hoverRef.current) {
      const c = hoverRef.current;
      const p = worldToScreen(c.x, c.y);
      const size = cam.scale;

      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
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
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function getCanvasPoint(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { px: e.clientX - rect.left, py: e.clientY - rect.top };
  }

  function updateHoverFromEvent(e) {
    const { px, py } = getCanvasPoint(e);
    const w = screenToWorld(px, py);
    const cell = { x: Math.floor(w.x), y: Math.floor(w.y) };
    hoverRef.current = cell;
    setHoverCell(cell);
  }

  function toggleSelect(cell) {
    setSelectedCells((prev) => {
      const map = new Map(prev.map((c) => [cellKeyXY(c.x, c.y), c]));
      const key = cellKeyXY(cell.x, cell.y);

      if (map.has(key)) {
        map.delete(key);
      } else {
        map.set(key, cell);
      }

      const next = Array.from(map.values());
      selectedRef.current = next;
      return next;
    });
  }

  function onMouseMove(e) {
    if (panRef.current.active) {
      const dx = e.clientX - panRef.current.startX;
      const dy = e.clientY - panRef.current.startY;

      camRef.current.offsetX = panRef.current.startOffsetX + dx;
      camRef.current.offsetY = panRef.current.startOffsetY + dy;

      draw();
      return;
    }

    updateHoverFromEvent(e);
    draw();
  }

  function onMouseDown(e) {
    if (e.button === 2 || e.button === 1) {
      panRef.current.active = true;
      panRef.current.startX = e.clientX;
      panRef.current.startY = e.clientY;
      panRef.current.startOffsetX = camRef.current.offsetX;
      panRef.current.startOffsetY = camRef.current.offsetY;
    }
  }

  function onMouseUp() {
    panRef.current.active = false;
  }

  function onWheel(e) {
    e.preventDefault();

    const { px, py } = getCanvasPoint(e);
    const before = screenToWorld(px, py);

    const zoom = Math.exp((-e.deltaY / 500) * 0.9);
    const nextScale = clamp(camRef.current.scale * zoom, 12, 140);

    camRef.current.scale = nextScale;
    camRef.current.offsetX = px - before.x * nextScale;
    camRef.current.offsetY = py - before.y * nextScale;

    draw();
  }

  function onClick(e) {
    if (panRef.current.active) return;

    const { px, py } = getCanvasPoint(e);
    const w = screenToWorld(px, py);
    const cell = { x: Math.floor(w.x), y: Math.floor(w.y) };

    toggleSelect(cell);
    draw();
  }

  function clearSelection() {
    selectedRef.current = [];
    setSelectedCells([]);
    draw();
  }

  return (
    <div className="gridmapRoot gridmapSplit">
      <div className="gridmapLeft">
        <canvas
          ref={canvasRef}
          className="gridmapCanvas"
          onContextMenu={(e) => e.preventDefault()}
          onMouseMove={onMouseMove}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onClick={onClick}
        />

        <div className="gridmapHud">
          <div className="gridmapHudTitle">Grid</div>
          <div className="gridmapHudSmall">
            Hover: {hoverCell ? `${hoverCell.x}, ${hoverCell.y}` : "none"}
          </div>
          <div className="gridmapHudSmall">Selected: {selectedCells.length}</div>
          <div className="gridmapHudSmall">Pan: right click or middle click</div>
          <div className="gridmapHudSmall">Zoom: wheel</div>

          {selectedCells.length > 0 ? (
            <button className="gridmapHudBtn" onClick={clearSelection}>
              Clear selection
            </button>
          ) : null}
        </div>
      </div>

      {selectedCells.length > 0 ? (
        <div className="gridmapRight">
          <div className="gridmapFormTitle">New Splat</div>
          <div className="gridmapFormSmall">{selectedCells.length} squares selected</div>

          <div className="gridmapFormHint">Phase 3 only. Upload form comes in Phase 4.</div>
        </div>
      ) : null}
    </div>
  );
}
