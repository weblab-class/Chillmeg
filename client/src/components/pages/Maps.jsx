import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
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

async function apiDeleteSplat(splatId) {
  const res = await fetch(`/api/splats/${splatId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

function CellCard({ cell, onReserve, onSelectFilled, isSelected }) {
  const isEmpty = cell.status === "empty";
  const isFilled = cell.status === "filled";

  const onClick = isEmpty ? onReserve : isFilled ? onSelectFilled : undefined;

  return (
    <div
      onClick={onClick}
      style={{
        border: isSelected ? "2px solid #ffffff" : "1px solid #333",
        borderRadius: 12,
        height: 140,
        background: isEmpty ? "#111" : cell.status === "reserved" ? "#332200" : "#002233",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isEmpty || isFilled ? "pointer" : "not-allowed",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {cell.status !== "filled" ? (
        <div style={{ opacity: 0.9 }}>{cell.status.toUpperCase()}</div>
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
  const navigate = useNavigate();

  const [maps, setMaps] = useState([]);
  const [mapId, setMapId] = useState("");

  const [cells, setCells] = useState([]);
  const [stateCells, setStateCells] = useState([]);

  const [selectedEmptyCell, setSelectedEmptyCell] = useState(null);

  const [filledSelected, setFilledSelected] = useState(null);

  const [file, setFile] = useState(null);
  const [lumaUrl, setLumaUrl] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const gridMode = 9;

  function showError(e) {
    const msg = String(e?.message || e);
    try {
      const parsed = JSON.parse(msg);
      setError(parsed.error || parsed.message || msg);
    } catch {
      setError(msg);
    }
  }

  async function refreshAll(activeMapId) {
    const data = await apiGet(`/api/maps/${activeMapId}/cells?gridMode=${gridMode}`);
    setCells(data.cells || []);

    const st = await apiGet(`/api/maps/${activeMapId}/state?gridMode=${gridMode}`);
    setStateCells(st.cells || []);
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/api/maps");
        setMaps(data.maps || []);
        if ((data.maps || []).length > 0) setMapId(data.maps[0]._id);
      } catch (e) {
        showError(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!mapId) return;

    refreshAll(mapId).catch(() => {});
    const t = setInterval(() => refreshAll(mapId).catch(() => {}), 2000);
    return () => clearInterval(t);
  }, [mapId]);

  async function reserveCell(cell) {
    setBusy(true);
    setError("");
    try {
      const res = await apiPost(`/api/maps/${mapId}/cells/${cell.cellIndex}/reserve`, { gridMode });
      setSelectedEmptyCell(res.cell);
      setFilledSelected(null);
      await refreshAll(mapId);
    } catch (e) {
      setError("Cell not available");
    } finally {
      setBusy(false);
    }
  }

  async function attachLuma() {
    if (!selectedEmptyCell || !lumaUrl.trim()) return;

    setBusy(true);
    setError("");
    try {
      await apiAttachLuma({
        mapId,
        cellId: selectedEmptyCell._id,
        lumaCaptureUrl: lumaUrl.trim(),
      });
      setSelectedEmptyCell(null);
      setLumaUrl("");
      await refreshAll(mapId);
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  async function uploadPly() {
    if (!selectedEmptyCell || !file) return;

    setBusy(true);
    setError("");
    try {
      await apiUploadPly({ mapId, cellId: selectedEmptyCell._id, file });
      setSelectedEmptyCell(null);
      setFile(null);
      await refreshAll(mapId);
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  async function deleteSelectedSplat() {
    const splatId = filledSelected?.splat?._id;
    if (!splatId) return;

    setBusy(true);
    setError("");
    try {
      await apiDeleteSplat(splatId);
      setFilledSelected(null);
      await refreshAll(mapId);
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  const renderedCells = stateCells.length ? stateCells : cells;

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto", color: "#fff" }}>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>PlaybackXR</div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Starter Town</h1>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>Map</span>
            <select value={mapId} onChange={(e) => setMapId(e.target.value)}>
              {maps.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <button onClick={() => navigate("/walk")} disabled={!mapId}>
            Walk
          </button>

          <div style={{ fontSize: 12, opacity: 0.8 }}>{busy ? "Working" : ""}</div>
        </div>
      </div>

      {error ? <div style={{ marginTop: 12, color: "#ff7777" }}>{error}</div> : null}

      <div
        style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
      >
        {renderedCells.map((c) => (
          <CellCard
            key={c._id}
            cell={c}
            onReserve={() => reserveCell(c)}
            onSelectFilled={() => {
              setFilledSelected(c);
              setSelectedEmptyCell(null);
            }}
            isSelected={
              (selectedEmptyCell && c._id === selectedEmptyCell._id) ||
              (filledSelected && c._id === filledSelected._id)
            }
          />
        ))}
      </div>

      <div style={{ marginTop: 18, padding: 14, border: "1px solid #222", borderRadius: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 10 }}>
          {selectedEmptyCell
            ? `Reserved cell ${selectedEmptyCell.cellIndex}. Paste a Luma capture URL to fill it.`
            : "Click an empty cell to reserve it."}
        </div>

        <input
          type="text"
          value={lumaUrl}
          disabled={!selectedEmptyCell || busy}
          onChange={(e) => setLumaUrl(e.target.value)}
          placeholder="https://lumalabs.ai/capture/..."
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #333",
            background: "#0b0b0b",
            color: "#fff",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
          <button onClick={attachLuma} disabled={!selectedEmptyCell || !lumaUrl.trim() || busy}>
            Attach capture
          </button>

          <button
            onClick={() => {
              setSelectedEmptyCell(null);
              setLumaUrl("");
              setFile(null);
            }}
            disabled={busy}
          >
            Clear selection
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
          Tip: the capture must be public for it to render in Walk.
        </div>
      </div>

      <div style={{ marginTop: 14, padding: 14, border: "1px solid #222", borderRadius: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 10 }}>
          Click a filled cell to select it, then delete it.
        </div>

        <button onClick={deleteSelectedSplat} disabled={!filledSelected?.splat?._id || busy}>
          Delete selected splat
        </button>
      </div>

      <div style={{ marginTop: 14, padding: 14, border: "1px solid #222", borderRadius: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 10 }}>
          Optional: upload a .ply instead of Luma.
        </div>

        <input
          type="file"
          accept=".ply"
          disabled={!selectedEmptyCell || busy}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={uploadPly}
          disabled={!selectedEmptyCell || !file || busy}
          style={{ marginLeft: 10 }}
        >
          Upload .ply
        </button>
      </div>
    </div>
  );
}
