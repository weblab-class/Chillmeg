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

export default function MapNav({
  me,
  mySplats,
  likedSplats = [],
  onOpenSplat,
  onOpenTutorial,
  onOpenOwnerUploads,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openLiked, setOpenLiked] = useState(false);

  const myName = useMemo(() => {
    return me?.name || me?.username || me?.email || "User";
  }, [me]);

  return (
    <div className="mapNavRoot">
      <button className="mapNavBrand" onClick={() => navigate("/")}>
        PlaybackXR
      </button>

      <div className="mapNavRight">
        <button
          className="mapNavTutorialBtn"
          onClick={() => {
            setOpen(false);
            setOpenLiked(false);
            onOpenTutorial();
          }}
        >
          Tutorial
        </button>

        <div className="mapNavDropdownWrap">
          <button
            className="mapNavDropdownBtn"
            onClick={() => {
              setOpen(false);
              setOpenLiked((v) => !v);
            }}
          >
            Liked: {likedSplats.length}
          </button>

          {openLiked ? (
            <div className="mapNavDropdownPanel">
              {likedSplats.length === 0 ? (
                <div className="mapNavDropdownEmpty">No likes yet</div>
              ) : (
                likedSplats.map((s) => (
                  <button
                    key={s._id}
                    className="mapNavDropdownItem"
                    onClick={() => {
                      setOpenLiked(false);
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

        <div className="mapNavDropdownWrap">
          <button
            className="mapNavDropdownBtn"
            onClick={() => {
              setOpenLiked(false);
              setOpen((v) => !v);
            }}
          >
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

        <div
          className="mapNavAvatar"
          title={myName}
          onClick={() => {
            setOpen(false);
            setOpenLiked(false);
            if (onOpenOwnerUploads && me?._id) {
              onOpenOwnerUploads({
                ownerId: String(me._id),
                ownerName: myName,
              });
            }
          }}
          style={{ cursor: onOpenOwnerUploads ? "pointer" : "default" }}
        >
          {initials(myName)}
        </div>
      </div>
    </div>
  );
}
