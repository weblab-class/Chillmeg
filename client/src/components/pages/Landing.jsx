import React from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

export default function Landing() {
  const navigate = useNavigate();
  const YT_ID = "jV_am1GXbGM";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* YouTube background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <iframe
          title="bg"
          src={
            "https://www.youtube.com/embed/" +
            YT_ID +
            "?autoplay=1" +
            "&mute=1" +
            "&controls=0" +
            "&rel=0" +
            "&modestbranding=1" +
            "&playsinline=1" +
            "&loop=1" +
            "&playlist=" +
            YT_ID
          }
          allow="autoplay; encrypted-media; picture-in-picture"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "200vw",
            height: "112.5vw",
            minWidth: "177.78vh",
            minHeight: "100vh",
            transform: "translate(-50%, -50%)",
            border: 0,
            opacity: 0.55,
          }}
        />
      </div>

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />

      {/* Center card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "min(520px, 100%)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 18,
            padding: 22,
            backdropFilter: "blur(10px)",
            background: "rgba(10,10,10,0.55)",
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 6 }}>PlaybackXR</div>
          <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>
            Build an isometric splat town
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.85, marginBottom: 16 }}>
            Pick a plot, attach a Luma capture link, then walk the town.
          </div>

          {/* Option A: render your existing Login component right here */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <Login onSuccess={() => navigate("/maps")} />
          </div>

          {/* If your Login component does not support onSuccess yet,
              scroll down to Step 3 where I show how to add it. */}
        </div>
      </div>
    </div>
  );
}
