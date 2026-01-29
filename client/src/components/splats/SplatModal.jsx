import React, { useState } from "react";
import LumaWebViewer from "./LumaWebViewer";

function formatDate(v) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return "";
  }
}

export default function SplatModal({
  splat,
  canDelete,
  onClose,
  onDelete,
  onOpenOwnerUploads,
}) {
  if (!splat) return null;

  const [copyMsg, setCopyMsg] = useState("");
  const [liked, setLiked] = useState(false);

  const ownerId = splat.ownerId?._id || splat.ownerId || null;
  const ownerName = splat.ownerName || "Unknown";

  const dims = splat.dimensions
    ? `${splat.dimensions.x} by ${splat.dimensions.y} by ${splat.dimensions.z} m`
    : "Unknown";

  const size = splat.fileSizeBytes
    ? `${Math.round(splat.fileSizeBytes / 1024 / 1024)} MB`
    : "Unknown";

  const handleShare = async () => {
    const text = splat.lumaUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg("Link copied to clipboard");
    } catch {
      setCopyMsg("Copy failed");
    }
    setTimeout(() => setCopyMsg(""), 1800);
  };

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
            fontFamily: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
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
          <LumaWebViewer sourceUrl={splat.lumaUrl} enableVR={true} />
        </div>

        <div
          style={{
            flex: "1 1 auto",
            overflow: "auto",
            padding: 16,
            color: "rgba(255,255,255,0.90)",
            fontFamily: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
            fontSize: 13,
          }}
        >
          <div style={{ opacity: 0.9 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>Owner:</span>
                {onOpenOwnerUploads && ownerId ? (
                  <button
                    onClick={() => onOpenOwnerUploads({ ownerId, ownerName })}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.20)",
                      color: "rgba(255,255,255,0.95)",
                      padding: "6px 10px",
                      borderRadius: 10,
                      cursor: "pointer",
                    }}
                  >
                    {ownerName}
                  </button>
                ) : (
                  <span>{ownerName}</span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={handleShare}
                  title="Share"
                  style={{
                    width: 42,
                    height: 42,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 12,
                    color: "rgba(255,255,255,0.95)",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  🔗
                </button>
                <button
                  onClick={() => setLiked((v) => !v)}
                  title="Like"
                  style={{
                    width: 42,
                    height: 42,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: liked
                      ? "rgba(255,0,100,0.22)"
                      : "rgba(255,255,255,0.08)",
                    border: liked
                      ? "1px solid rgba(255,0,100,0.55)"
                      : "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 12,
                    color: liked ? "#ff4f8b" : "rgba(255,255,255,0.95)",
                    fontSize: 18,
                    cursor: "pointer",
                    transition: "all 120ms ease",
                  }}
                >
                  {liked ? "❤️" : "🤍"}
                </button>
              </div>
            </div>
            {copyMsg ? (
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6, textAlign: "right" }}>
                {copyMsg}
              </div>
            ) : null}
            Date: {formatDate(splat.createdAt)}
            <br />
            Dimensions: {dims}
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
