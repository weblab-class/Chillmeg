import React, { useEffect, useMemo, useRef, useState } from "react";

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function fmtDate(v) {
  if (!v) return "";
  try {
    const d = new Date(v);
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

function shortUrl(u) {
  if (!u) return "";
  try {
    const url = new URL(u);
    const host = url.hostname.replace("www.", "");
    const path = url.pathname.split("/").filter(Boolean);
    const tail = path[path.length - 1] || "";
    return `${host}/${tail}`;
  } catch {
    const s = String(u);
    if (s.length <= 32) return s;
    return s.slice(0, 18) + "…" + s.slice(-10);
  }
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

function boundsOfCells(splats) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const s of splats) {
    for (const c of s.cells || []) {
      if (c.x < minX) minX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.x > maxX) maxX = c.x;
      if (c.y > maxY) maxY = c.y;
    }
  }

  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX: maxX + 1, maxY: maxY + 1 };
}

function drawStar(ctx, x, y, rOuter, rInner, points, alpha) {
  const p = Math.max(4, points || 6);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  for (let i = 0; i < p * 2; i += 1) {
    const ang = (Math.PI * i) / p;
    const r = i % 2 === 0 ? rOuter : rInner;
    ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function LandingTeaser() {
  const canvasRef = useRef(null);

  const [splats, setSplats] = useState([]);

  const points = useMemo(() => {
    return (splats || []).map((s) => {
      const c = centroid(s.cells || []);
      return {
        id: s._id || `${c.x},${c.y}`,
        x: c.x,
        y: c.y,
        name: s.name || "Untitled",
        date: fmtDate(s.createdAt),
        url: shortUrl(s.lumaUrl),
      };
    });
  }, [splats]);

  const worldBounds = useMemo(() => boundsOfCells(splats || []), [splats]);

  useEffect(() => {
    let canceled = false;

    async function load() {
      try {
        const res = await fetch("/api/splats", { credentials: "include" });
        const data = await res.json();
        if (canceled) return;
        setSplats(Array.isArray(data?.splats) ? data.splats : []);
      } catch {
        if (canceled) return;
        setSplats([]);
      }
    }

    load();
    const t = window.setInterval(load, 12000);

    return () => {
      canceled = true;
      window.clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    let stopped = false;

    const state = {
      t0: performance.now(),
      offsetX: 0,
      offsetY: 0,
      scale: 44,
    };

    function resize() {
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

      const margin = 2.5;
      const desired = worldBounds
        ? {
            cx: (worldBounds.minX + worldBounds.maxX) * 0.5,
            cy: (worldBounds.minY + worldBounds.maxY) * 0.5,
            w: Math.max(1, worldBounds.maxX - worldBounds.minX + margin),
            h: Math.max(1, worldBounds.maxY - worldBounds.minY + margin),
          }
        : { cx: 0, cy: 0, w: 18, h: 12 };

      const scaleX = w / desired.w;
      const scaleY = h / desired.h;
      state.scale = clamp(Math.min(scaleX, scaleY), 18, 80);

      state.offsetX = w * 0.5 - desired.cx * state.scale;
      state.offsetY = h * 0.52 - desired.cy * state.scale;
    }

    function worldToScreen(wx, wy) {
      return {
        x: wx * state.scale + state.offsetX,
        y: wy * state.scale + state.offsetY,
      };
    }

    function draw(now) {
      if (stopped) return;

      const ctx = canvas.getContext("2d");
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      const t = (now - state.t0) / 1000;

      const driftX = Math.cos(t * 0.12) * 22 + Math.cos(t * 0.031) * 10;
      const driftY = Math.sin(t * 0.1) * 18 + Math.sin(t * 0.027) * 8;

      const ox = state.offsetX + driftX;
      const oy = state.offsetY + driftY;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, w, h);

      const gridAlpha = worldBounds ? 0.24 : 0.18;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255,255,255,${gridAlpha})`;

      const tlx = -ox / state.scale;
      const tly = -oy / state.scale;
      const brx = (w - ox) / state.scale;
      const bry = (h - oy) / state.scale;

      const startX = Math.floor(tlx) - 2;
      const endX = Math.ceil(brx) + 2;
      const startY = Math.floor(tly) - 2;
      const endY = Math.ceil(bry) + 2;

      ctx.beginPath();
      for (let x = startX; x <= endX; x += 1) {
        const p1 = { x: x * state.scale + ox, y: startY * state.scale + oy };
        const p2 = { x: x * state.scale + ox, y: endY * state.scale + oy };
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      for (let y = startY; y <= endY; y += 1) {
        const p1 = { x: startX * state.scale + ox, y: y * state.scale + oy };
        const p2 = { x: endX * state.scale + ox, y: y * state.scale + oy };
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        const sx = p.x * state.scale + ox;
        const sy = p.y * state.scale + oy;

        const pulse = 0.55 + 0.45 * Math.sin(t * 2.2 + i * 0.7);
        const rOuter = Math.max(4, state.scale * (0.09 + 0.05 * pulse));
        const rInner = rOuter * 0.48;

        ctx.fillStyle = "rgba(255,255,255,0.9)";
        drawStar(ctx, sx, sy, rOuter, rInner, 6, 0.35 + 0.5 * pulse);

        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(2, state.scale * 0.05), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fill();

        const labelX = sx + 12;
        const labelY = sy - 10;

        ctx.font = "12px system-ui";
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillText(p.name, labelX, labelY);

        ctx.font = "11px system-ui";
        ctx.fillStyle = "rgba(255,255,255,0.62)";
        const line2 = p.date ? `${p.date}   ${p.url}` : p.url;
        ctx.fillText(line2, labelX, labelY + 15);
      }

      const vignette = ctx.createRadialGradient(
        w * 0.5,
        h * 0.45,
        80,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.7
      );
      vignette.addColorStop(0, "rgba(0,0,0,0.15)");
      vignette.addColorStop(1, "rgba(0,0,0,0.82)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      stopped = true;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [points, worldBounds]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
