import React from "react";

export default function SplatForm({ selectedCount, form, setForm, onUpload }) {
  return (
    <div>
      <div className="gridmapFormTitle">New Splat</div>
      <div className="gridmapFormSmall">{selectedCount} squares selected</div>

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
