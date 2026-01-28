import React from "react";

export default function TutorialModal({ open, onClose }) {
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
        padding: 18,
        zIndex: 80,
      }}
    >
      <div
        style={{
          width: "min(860px, 96vw)",
          height: "min(760px, 92vh)",
          background: "rgba(0,0,0,0.92)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 18,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          color: "rgba(255,255,255,0.92)",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600 }}>Quick tutorial</div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(255,255,255,0.22)",
              padding: "8px 10px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Close
          </button>
        </div>

        <div style={{ padding: 16, overflow: "auto" }}>
          <Section
            title="1  Get a Luma capture"
            body={
              <>
                <p>
                  Create a Gaussian Splat with Luma by uploading a short video or a set of photos.
                  When it is ready, copy the capture link and paste it into the right panel.
                </p>
                <Callout>
                  Paste a link that looks like:
                  <br />
                  lumalabs.ai/capture/...
                </Callout>
                <MediaPlaceholder label="Optional: add a gif showing where to copy the link" />
              </>
            }
          />

          <Section
            title="2  Select a grid plot"
            body={
              <>
                <p>
                  Click empty squares to select a plot. Your selection is outlined as one continuous
                  shape.
                </p>
                <ul style={ulStyle}>
                  <li>White outline means selected</li>
                  <li>Occupied plots cannot be selected</li>
                  <li>Your uploads are red, other people’s are white</li>
                </ul>
                <MediaPlaceholder label="Optional: add a gif showing selection" />
              </>
            }
          />

          <Section
            title="3  Fill the right panel"
            body={
              <>
                <p>
                  Add a name, paste the Luma link, and set approximate dimensions. Then click
                  Upload.
                </p>
                <ul style={ulStyle}>
                  <li>Name shows up on hover and in the landing teaser</li>
                  <li>Dimensions are for metadata and scale reference</li>
                </ul>
                <MediaPlaceholder label="Optional: add a screenshot of the form" />
              </>
            }
          />

          <Section
            title="4  View splats and enter VR"
            body={
              <>
                <p>
                  Hover a plot to see details. Click an occupied plot to open the viewer. If you are
                  on a Quest 3, click Enter VR in the viewer.
                </p>
                <Callout>
                  Quest 3 tip: open PlaybackXR in the Quest Browser for WebXR support.
                </Callout>
                <MediaPlaceholder label="Optional: add a gif showing the modal and VR button" />
              </>
            }
          />

          <div style={{ height: 6 }} />
          <div style={{ opacity: 0.6, fontSize: 12 }}>
            You can reopen this tutorial later from the top bar.
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, body }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ opacity: 0.86, fontSize: 13, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

function Callout({ children }) {
  return (
    <div
      style={{
        marginTop: 10,
        marginBottom: 10,
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.04)",
        fontSize: 12,
        opacity: 0.9,
      }}
    >
      {children}
    </div>
  );
}

function MediaPlaceholder({ label }) {
  return (
    <div
      style={{
        marginTop: 10,
        borderRadius: 16,
        border: "1px dashed rgba(255,255,255,0.22)",
        background: "rgba(255,255,255,0.03)",
        padding: 14,
        fontSize: 12,
        opacity: 0.65,
      }}
    >
      {label}
    </div>
  );
}

const ulStyle = {
  marginTop: 8,
  marginBottom: 8,
  paddingLeft: 18,
};
