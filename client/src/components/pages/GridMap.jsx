import React, { useEffect, useMemo, useState } from "react";
import { createSplat, deleteSplat, fetchMe, fetchSplats } from "../../api/splats";
import { key } from "../grid/gridMath";
import GridCanvas from "../grid/GridCanvas";
import SplatForm from "../splats/SplatForm";
import SplatTooltip from "../splats/SplatTooltip";
import SplatModal from "../splats/SplatModal";
import "./GridMap.css";

export default function GridMap() {
  const [me, setMe] = useState(null);
  const [splats, setSplats] = useState([]);

  const [hover, setHover] = useState(null);
  const [activeSplat, setActiveSplat] = useState(null);

  const [selectedMap, setSelectedMap] = useState({});

  const selectedCells = useMemo(() => {
    return Object.keys(selectedMap).map((kstr) => {
      const parts = kstr.split(",");
      return { x: Number(parts[0]), y: Number(parts[1]) };
    });
  }, [selectedMap]);

  const [form, setForm] = useState({ name: "", lumaUrl: "", x: 1, y: 1, z: 1 });

  const myId = useMemo(() => {
    const id = me?._id || me?.id || null;
    return id ? String(id) : null;
  }, [me]);

  function isMineSplat(s) {
    if (!s) return false;
    const oid = s.ownerId?._id || s.ownerId || null;
    if (!oid || !myId) return false;
    return String(oid) === String(myId);
  }

  async function reloadSplatsSafe() {
    try {
      const list = await fetchSplats();
      if (Array.isArray(list)) setSplats(list);
    } catch (e) {
      console.log("reload splats failed", e);
    }
  }

  async function refreshSessionAndData() {
    try {
      const u = await fetchMe();
      setMe(u);
    } catch (e) {
      console.log("fetchMe failed", e);
      setMe(null);
    }

    await reloadSplatsSafe();
  }

  useEffect(() => {
    refreshSessionAndData();

    const onFocus = () => {
      refreshSessionAndData();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    setSelectedMap({});
    setActiveSplat(null);
    setHover(null);
  }, [myId]);

  function onToggleCell(cell) {
    const k = key(cell.x, cell.y);
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[k]) delete next[k];
      else next[k] = true;
      return next;
    });
  }

  async function onUpload() {
    if (selectedCells.length === 0) {
      alert("Select at least one square");
      return;
    }
    if (!form.name.trim()) {
      alert("Please enter a name");
      return;
    }
    if (!form.lumaUrl.trim()) {
      alert("Please enter a Luma url");
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
      setSelectedMap({});
      await reloadSplatsSafe();
    } catch (e) {
      alert(String(e?.message || e));
    }
  }

  async function onDeleteActive() {
    if (!activeSplat?._id) return;
    try {
      await deleteSplat(activeSplat._id);
      setActiveSplat(null);
      await reloadSplatsSafe();
    } catch (e) {
      alert(String(e?.message || e));
    }
  }

  const selectionCount = selectedCells.length;

  return (
    <div className="gridmapRoot gridmapSplit">
      <div className="gridmapLeft" style={{ position: "relative" }}>
        <GridCanvas
          splats={splats}
          selectedCells={selectedCells}
          isMineSplat={isMineSplat}
          onToggleCell={onToggleCell}
          onOpenSplat={setActiveSplat}
          onHover={setHover}
        />

        <div className="gridmapHud">
          <div className="gridmapHudTitle">Grid</div>
          <div className="gridmapHudSmall">
            Hover: {hover?.cell ? `${hover.cell.x}, ${hover.cell.y}` : "none"}
          </div>
          <div className="gridmapHudSmall">Selected: {selectionCount}</div>
          <div className="gridmapHudSmall">Pan: right click or middle click</div>
          <div className="gridmapHudSmall">Zoom: wheel</div>

          {selectionCount > 0 ? (
            <button className="gridmapHudBtn" onClick={() => setSelectedMap({})}>
              Clear selection
            </button>
          ) : null}
        </div>

        <SplatTooltip hover={hover} />
        <SplatModal
          splat={activeSplat}
          canDelete={isMineSplat(activeSplat)}
          onClose={() => setActiveSplat(null)}
          onDelete={onDeleteActive}
        />
      </div>

      <div className="gridmapRight">
        {selectionCount > 0 ? (
          <SplatForm
            selectedCount={selectionCount}
            form={form}
            setForm={setForm}
            onUpload={onUpload}
          />
        ) : (
          <div style={{ opacity: 0.75 }}>
            <div style={{ fontSize: 15, marginBottom: 8 }}>No selection</div>
            <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>
              Click one or more empty squares on the grid to start a new upload.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
