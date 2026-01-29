import React from "react";

function formatDate(v) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleDateString();
  } catch {
    return "";
  }
}

export default function OwnerUploadsModal({
  open,
  ownerName,
  uploads,
  onClose,
  onOpenSplat,
}) {
  if (!open) return null;

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
        zIndex: 70,
      }}
    >
      <div
        style={{
          width: "min(520px, 96vw)",
          maxHeight: "min(620px, 92vh)",
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 16,
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
            padding: "12px 14px",
            color: "rgba(255,255,255,0.92)",
            fontFamily:
              "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          }}
        >
          <div style={{ fontWeight: 600 }}>
            Uploads by {ownerName || "Unknown"}
          </div>
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
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflowY: "auto",
            color: "rgba(255,255,255,0.90)",
            fontFamily:
              "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
            fontSize: 13,
          }}
        >
          {uploads.length === 0 ? (
            <div
              style={{
                padding: 12,
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 12,
                textAlign: "center",
                opacity: 0.8,
              }}
            >
              No uploads from this owner yet.
            </div>
          ) : (
            uploads.map((s) => (
              <button
                key={s._id}
                onClick={() => {
                  onOpenSplat?.(s);
                  onClose();
                }}
                style={{
                  textAlign: "left",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 12,
                  padding: "10px 12px",
                  color: "rgba(255,255,255,0.92)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600 }}>{s.name || "Untitled"}</div>
                <div style={{ opacity: 0.8, marginTop: 4 }}>
                  {formatDate(s.createdAt)} · {s.cells?.length || 0} squares
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
