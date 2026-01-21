import React, { useEffect, useState } from "react";

async function apiGet(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiUploadPly({ mapId, cellId, file }) {
  const fd = new FormData();
  fd.append("asset", file);
  fd.append("mapId", mapId);
  fd.append("cellId", cellId);

  const res = await fetch("/api/upload/ply", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiAttachLuma({ mapId, cellId, lumaCaptureUrl }) {
  const res = await fetch("/api/luma/attach", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mapId, cellId, lumaCaptureUrl }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

function CellCard({ cell, onReserve }) {
  const clickable = cell.status === "empty";

  return (
    <div
      onClick={clickable ? onReserve : undefined}
      style={{
        border: "1px solid #333",
        borderRadius: 10,
        height: 140,
        background:
          cell.status === "empty" ? "#111" : cell.status === "reserved" ? "#332200" : "#002233",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: clickable ? "pointer" : "not-allowed",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {cell.status !== "filled" ? (
        <div>{cell.status.toUpperCase()}</div>
      ) : (
        <>
          <img
            src="/placeholder.png"
            alt="placeholder"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              fontSize: 12,
              background: "rgba(0,0,0,0.6)",
              padding: "4px 6px",
              borderRadius: 6,
            }}
          >
            FILLED
          </div>
        </>
      )}
    </div>
  );
}

export default function Maps() {
  const [maps, setMaps] = useState([]);
  const [mapId, setMapId] = useState("");
  const [cells, setCells] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lumaUrl, setLumaUrl] = useState("");

  const gridMode = 9;

  async function refreshCells(activeMapId) {
    const data = await apiGet(`/api/maps/${activeMapId}/cells?gridMode=${gridMode}`);
    setCells(data.cells || []);
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/api/maps");
        setMaps(data.maps || []);
        if ((data.maps || []).length > 0) setMapId(data.maps[0]._id);
      } catch (e) {
        setError(String(e.message || e));
      }
    })();
  }, []);

  useEffect(() => {
    if (!mapId) return;
    refreshCells(mapId).catch(() => {});
    const t = setInterval(() => refreshCells(mapId).catch(() => {}), 2000);
    return () => clearInterval(t);
  }, [mapId]);

  async function reserveCell(cell) {
    setBusy(true);
    setError("");
    try {
      const res = await apiPost(`/api/maps/${mapId}/cells/${cell.cellIndex}/reserve`, { gridMode });
      setSelectedCell(res.cell);
      await refreshCells(mapId);
    } catch (e) {
      setError("Cell not available");
    } finally {
      setBusy(false);
    }
  }

  async function upload() {
    if (!selectedCell || !file) return;
    setBusy(true);
    setError("");
    try {
      await apiUploadPly({ mapId, cellId: selectedCell._id, file });
      setSelectedCell(null);
      setFile(null);
      await refreshCells(mapId);
    } catch (e) {
      console.log("upload error", e);
      const msg = String(e?.message || e);

      try {
        const parsed = JSON.parse(msg);
        setError(parsed.error || msg);
      } catch {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function attachLuma() {
    if (!selectedCell || !lumaUrl.trim()) return;
    setBusy(true);
    setError("");
    try {
      await apiAttachLuma({
        mapId,
        cellId: selectedCell._id,
        lumaCaptureUrl: lumaUrl.trim(),
      });
      setSelectedCell(null);
      setLumaUrl("");
      await refreshCells(mapId);
    } catch (e) {
      const msg = String(e?.message || e);
      try {
        const parsed = JSON.parse(msg);
        setError(parsed.error || msg);
      } catch {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", color: "#fff" }}>
      <h1 style={{ marginTop: 0 }}>Starter Town</h1>

      {error && <div style={{ marginBottom: 12, color: "#ff7777" }}>{error}</div>}

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <label>
          Map
          <select
            value={mapId}
            onChange={(e) => setMapId(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            {maps.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <div style={{ opacity: 0.8 }}>{busy ? "Working" : ""}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {cells.map((c) => (
          <CellCard key={c._id} cell={c} onReserve={() => reserveCell(c)} />
        ))}
      </div>

      <div style={{ marginTop: 18, padding: 12, border: "1px solid #222", borderRadius: 10 }}>
        <div style={{ marginBottom: 8, opacity: 0.9 }}>
          {selectedCell
            ? `Selected cell ${selectedCell.cellIndex}`
            : "Click an empty cell to reserve it"}
        </div>

        <input
          type="text"
          value={lumaUrl}
          disabled={!selectedCell || busy}
          onChange={(e) => setLumaUrl(e.target.value)}
          placeholder="Paste Luma capture URL"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#0b0b0b",
            color: "#fff",
          }}
        />

        <button
          onClick={attachLuma}
          disabled={!selectedCell || !lumaUrl.trim() || busy}
          style={{ marginTop: 10 }}
        >
          Attach capture
        </button>
      </div>

      <div style={{ marginTop: 18, padding: 12, border: "1px solid #222", borderRadius: 10 }}>
        <div style={{ marginBottom: 8, opacity: 0.9 }}>
          {selectedCell
            ? `Selected cell ${selectedCell.cellIndex}`
            : "Click an empty cell to reserve it"}
        </div>

        <input
          type="file"
          accept=".ply"
          disabled={!selectedCell || busy}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={upload}
          disabled={!selectedCell || !file || busy}
          style={{ marginLeft: 10 }}
        >
          Upload
        </button>
      </div>
    </div>
  );
}
