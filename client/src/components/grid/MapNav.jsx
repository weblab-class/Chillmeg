import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function initials(name) {
  const s = String(name || "").trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "?";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

export default function MapNav({ me, mySplats, onOpenSplat }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const myName = useMemo(() => {
    return me?.name || me?.username || me?.email || "User";
  }, [me]);

  return (
    <div className="mapNavRoot">
      <button className="mapNavBrand" onClick={() => navigate("/")}>
        PlaybackXR
      </button>

      <div className="mapNavRight">
        <div className="mapNavDropdownWrap">
          <button className="mapNavDropdownBtn" onClick={() => setOpen((v) => !v)}>
            Land count: {mySplats.length}
          </button>

          {open ? (
            <div className="mapNavDropdownPanel">
              {mySplats.length === 0 ? (
                <div className="mapNavDropdownEmpty">No uploads yet</div>
              ) : (
                mySplats.map((s) => (
                  <button
                    key={s._id}
                    className="mapNavDropdownItem"
                    onClick={() => {
                      setOpen(false);
                      onOpenSplat(s);
                    }}
                  >
                    {s.name || "Untitled"}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="mapNavAvatar" title={myName}>
          {initials(myName)}
        </div>
      </div>
    </div>
  );
}
