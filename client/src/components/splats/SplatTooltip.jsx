import React from "react";

function formatDate(v) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return "";
  }
}

export default function SplatTooltip({ hover }) {
  if (!hover?.splat) return null;

  const s = hover.splat;
  const dims = s.dimensions
    ? `${s.dimensions.x} by ${s.dimensions.y} by ${s.dimensions.z} m`
    : "Unknown";
  const size = s.fileSizeBytes ? `${Math.round(s.fileSizeBytes / 1024 / 1024)} MB` : "Unknown";

  return (
    <div
      style={{
        position: "fixed",
        left: hover.mouse.x + 14,
        top: hover.mouse.y + 14,
        background: "rgba(0,0,0,0.85)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 12,
        padding: 10,
        color: "rgba(255,255,255,0.92)",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontSize: 12,
        lineHeight: 1.35,
        pointerEvents: "none",
        maxWidth: 320,
        zIndex: 40,
      }}
    >
      <div style={{ fontSize: 13, marginBottom: 6 }}>{s.name}</div>
      <div>Owner: {s.ownerName || "Unknown"}</div>
      <div>Date: {formatDate(s.createdAt)}</div>
      <div>Dimensions: {dims}</div>
      <div>File size: {size}</div>
    </div>
  );
}
