import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

async function apiGet(url) {
  const res = await fetch(url, { credentials: "include" });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
}

export default function Home() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [towns, setTowns] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    const u = await apiGet("/api/me");
    setMe(u.user);

    const t = await apiGet("/api/towns");
    setTowns(t.towns || []);
  }

  useEffect(() => {
    refresh().catch((e) => setError(String(e?.message || e)));
  }, []);

  async function createTown() {
    setBusy(true);
    setError("");
    try {
      const name = prompt("Town name", "Untitled Town");
      if (name === null) return;

      const res = await apiPost("/api/towns", { name });
      const townId = res?.town?._id;

      await refresh();

      if (townId) navigate(`/town/${townId}`);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="homePage">
      <div className="homeHeader">
        <div className="homeUser">
          {me?.picture ? (
            <img className="homeAvatar" src={me.picture} alt="avatar" />
          ) : (
            <div className="homeAvatarFallback">{(me?.name || "U").slice(0, 1).toUpperCase()}</div>
          )}

          <div>
            <div className="homeMetaTop">Signed in as</div>
            <div className="homeName">{me?.name || "User"}</div>
            <div className="homeEmail">{me?.email || ""}</div>
          </div>
        </div>

        <div className="homeActions">
          <button onClick={createTown} disabled={busy}>
            Create new town
          </button>
          <div className="homeBusy">{busy ? "Working" : ""}</div>
        </div>
      </div>

      {error ? <div className="homeError">{error}</div> : null}

      <div className="homeTable">
        <div className="homeRowHead">
          <div>Thumbnail</div>
          <div>Name</div>
          <div>Created</div>
        </div>

        {towns.length === 0 ? (
          <div className="homeEmpty">No towns yet. Create your first one.</div>
        ) : (
          towns.map((t) => (
            <div key={t._id} className="homeRow" onClick={() => navigate(`/town/${t._id}`)}>
              <div>
                <div className="homeThumbBox">
                  {t.thumbnailUrl ? (
                    <img className="homeThumbImg" src={t.thumbnailUrl} alt="thumb" />
                  ) : (
                    "No preview"
                  )}
                </div>
              </div>

              <div className="homeTownName">{t.name}</div>
              <div className="homeDate">{formatDate(t.createdAt)}</div>
            </div>
          ))
        )}
      </div>

      <div className="homeNote">Next: Town editor page at /town/:id</div>
    </div>
  );
}
