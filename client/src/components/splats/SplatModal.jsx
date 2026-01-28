import React from "react";
import LumaWebViewer from "./LumaWebViewer";

function formatDate(v) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return "";
  }
}

export default function SplatModal({ splat, canDelete, onClose, onDelete }) {
  if (!splat) return null;

  const dims = splat.dimensions
    ? `${splat.dimensions.x} by ${splat.dimensions.y} by ${splat.dimensions.z} m`
    : "Unknown";

  const size = splat.fileSizeBytes
    ? `${Math.round(splat.fileSizeBytes / 1024 / 1024)} MB`
    : "Unknown";

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 60,
      }}
    >
      <div
        style={{
          width: "min(980px, 96vw)",
          height: "min(740px, 92vh)",
          background: "black",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 18,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 12,
            color: "rgba(255,255,255,0.92)",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          }}
        >
          <div>{splat.name}</div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(255,255,255,0.22)",
              padding: "6px 10px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div
          style={{
            flex: "0 0 56%",
            background: "black",
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <LumaWebViewer sourceUrl={splat.lumaUrl} />
        </div>

        <div
          style={{
            flex: "1 1 auto",
            overflow: "auto",
            padding: 16,
            color: "rgba(255,255,255,0.90)",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
            fontSize: 13,
          }}
        >
          <div style={{ opacity: 0.9 }}>
            Owner: {splat.ownerName || "Unknown"}
            <br />
            Date: {formatDate(splat.createdAt)}
            <br />
            Dimensions: {dims}
            <br />
            File size: {size}
            <br />
            Occupied squares: {(splat.cells || []).length}
          </div>

          <div style={{ marginTop: 12 }}>
            <a
              href={splat.lumaUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "rgba(255,255,255,0.92)",
                padding: "10px 12px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Open on Luma
            </a>
          </div>

          {canDelete ? (
            <button
              onClick={onDelete}
              style={{
                marginTop: 14,
                background: "rgba(255,0,0,0.18)",
                color: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(255,0,0,0.55)",
                padding: "10px 12px",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Delete my upload
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
