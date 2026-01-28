import React from "react";

export default function SplatForm({ selectedCount, form, setForm, onUpload }) {
  return (
    <div>
      <div className="gridmapPanelHeader">
        <div className="gridmapPanelTitle">New Splat</div>
        <div className="gridmapPanelSub">{selectedCount} squares selected</div>
      </div>

      <div className="gridmapField">
        <label className="gridmapLabel">Name</label>
        <input
          className="gridmapInput"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="name"
        />
      </div>

      <div className="gridmapField">
        <label className="gridmapLabel">Luma url</label>
        <input
          className="gridmapInput"
          value={form.lumaUrl}
          onChange={(e) => setForm({ ...form, lumaUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="gridmapRow3">
        <div>
          <label className="gridmapLabel">X m</label>
          <input
            className="gridmapInput"
            value={form.x}
            onChange={(e) => setForm({ ...form, x: e.target.value })}
          />
        </div>

        <div>
          <label className="gridmapLabel">Y m</label>
          <input
            className="gridmapInput"
            value={form.y}
            onChange={(e) => setForm({ ...form, y: e.target.value })}
          />
        </div>

        <div>
          <label className="gridmapLabel">Z m</label>
          <input
            className="gridmapInput"
            value={form.z}
            onChange={(e) => setForm({ ...form, z: e.target.value })}
          />
        </div>
      </div>

      <button className="gridmapPrimaryBtn" onClick={onUpload}>
        Upload
      </button>
    </div>
  );
}
