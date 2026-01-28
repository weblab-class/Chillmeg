import React, { useEffect, useRef, useState } from "react";
import { fetchSplats, createSplat } from "../../api/splats";
import "./GridMap.css";

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function key(x, y) {
  return `${x},${y}`;
}

function centroid(cells) {
  if (!cells || cells.length === 0) return { x: 0, y: 0 };
  let sx = 0;
  let sy = 0;
  for (const c of cells) {
    sx += c.x + 0.5;
    sy += c.y + 0.5;
  }
  return { x: sx / cells.length, y: sy / cells.length };
}

export default function GridMap() {
  const canvasRef = useRef(null);

  const camRef = useRef({ offsetX: 0, offsetY: 0, scale: 60 });
  const panRef = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  const hoverRef = useRef(null);

  const [hoverCell, setHoverCell] = useState(null);

  const [selectedCells, setSelectedCells] = useState([]);
  const selectedSetRef = useRef(new Set());

  const [splats, setSplats] = useState([]);
  const occupiedCellToSplatRef = useRef(new Map());

  const [form, setForm] = useState({
    name: "",
    lumaUrl: "",
    x: 1,
    y: 1,
    z: 1,
  });

  async function reloadSplats() {
    const list = await fetchSplats();
    setSplats(list);
  }

  useEffect(() => {
    reloadSplats();
  }, []);

  useEffect(() => {
    const map = new Map();
    for (const s of splats) {
      for (const c of s.cells || []) {
        map.set(key(c.x, c.y), s);
      }
    }
    occupiedCellToSplatRef.current = map;
    draw();
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
      drawMergedOutline(ctx, s.cells, "rgba(255,255,255,0.80)", 3);

      const cen = centroid(s.cells);
      const p = worldToScreen(cen.x, cen.y);

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, camRef.current.scale * 0.06), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.90)";
      ctx.fill();
    }

    if (selectedCells.length > 0) {
      drawMergedOutline(ctx, selectedCells, "rgba(255,255,255,0.95)", 4);
    }

    if (hoverRef.current) {
      const c = hoverRef.current;
      const p = worldToScreen(c.x, c.y);
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
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function getCanvasPoint(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { px: e.clientX - rect.left, py: e.clientY - rect.top };
  }

  function onMouseMove(e) {
    if (panRef.current.active) {
      camRef.current.offsetX = panRef.current.ox + (e.clientX - panRef.current.sx);
      camRef.current.offsetY = panRef.current.oy + (e.clientY - panRef.current.sy);
      draw();
      return;
    }

    const { px, py } = getCanvasPoint(e);
    const w = screenToWorld(px, py);
    const cell = { x: Math.floor(w.x), y: Math.floor(w.y) };

    hoverRef.current = cell;
    setHoverCell(cell);
    draw();
  }

  function onMouseDown(e) {
    if (e.button === 2 || e.button === 1) {
      panRef.current.active = true;
      panRef.current.sx = e.clientX;
      panRef.current.sy = e.clientY;
      panRef.current.ox = camRef.current.offsetX;
      panRef.current.oy = camRef.current.offsetY;
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

  function toggleSelect(cell) {
    const cellId = key(cell.x, cell.y);

    if (occupiedCellToSplatRef.current.has(cellId)) return;

    const nextSet = new Set(selectedSetRef.current);
    if (nextSet.has(cellId)) nextSet.delete(cellId);
    else nextSet.add(cellId);

    selectedSetRef.current = nextSet;

    const nextCells = Array.from(nextSet.values()).map((kstr) => {
      const parts = kstr.split(",");
      return { x: Number(parts[0]), y: Number(parts[1]) };
    });

    setSelectedCells(nextCells);
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
    selectedSetRef.current = new Set();
    setSelectedCells([]);
    draw();
  }

  async function onUpload() {
    if (!form.name.trim()) {
      alert("Please enter a name");
      return;
    }
    if (!form.lumaUrl.trim()) {
      alert("Please enter a Luma url");
      return;
    }
    if (selectedCells.length === 0) {
      alert("Select at least one square");
      return;
    }

    try {
      await createSplat({
        name: form.name.trim(),
        lumaUrl: form.lumaUrl.trim(),
        dimensions: { x: Number(form.x), y: Number(form.y), z: Number(form.z) },
        cells: selectedCells,
      });

      setForm({ name: "", lumaUrl: "", x: 1, y: 1, z: 1 });
      clearSelection();
      await reloadSplats();
    } catch (e) {
      alert(String(e?.message || e));
    }
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

          <div style={{ height: 12 }} />

          <label style={{ fontSize: 12, opacity: 0.85 }}>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
            placeholder="name"
          />

          <label style={{ fontSize: 12, opacity: 0.85, marginTop: 10 }}>Luma url</label>
          <input
            value={form.lumaUrl}
            onChange={(e) => setForm({ ...form, lumaUrl: e.target.value })}
            style={inputStyle}
            placeholder="https://..."
          />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, opacity: 0.85 }}>X m</label>
              <input
                value={form.x}
                onChange={(e) => setForm({ ...form, x: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, opacity: 0.85 }}>Y m</label>
              <input
                value={form.y}
                onChange={(e) => setForm({ ...form, y: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, opacity: 0.85 }}>Z m</label>
              <input
                value={form.z}
                onChange={(e) => setForm({ ...form, z: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <button className="gridmapHudBtn" style={{ marginTop: 14 }} onClick={onUpload}>
            Upload
          </button>
        </div>
      ) : null}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 6,
  background: "rgba(255,255,255,0.06)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.18)",
  padding: 10,
  borderRadius: 12,
  outline: "none",
};
