import React from "react";

const videoStyle = {
  width: "100%",
  display: "block",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "black",
};

const captionStyle = {
  marginTop: 8,
  fontSize: 12,
  opacity: 0.65,
  lineHeight: 1.45,
};

const sectionTitleStyle = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 8,
};

const sectionBodyStyle = {
  opacity: 0.86,
  fontSize: 13,
  lineHeight: 1.55,
};

const calloutStyle = {
  marginTop: 10,
  marginBottom: 10,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.04)",
  fontSize: 12,
  opacity: 0.9,
  lineHeight: 1.5,
};

const ulStyle = {
  marginTop: 8,
  marginBottom: 8,
  paddingLeft: 18,
};

const tutorialBase = (import.meta?.env?.BASE_URL || "/").replace(/\/?$/, "/");
const t = (file) => `${tutorialBase}Tutorial/${file}`;

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
          width: "min(900px, 96vw)",
          height: "min(780px, 92vh)",
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
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Quick tutorial</div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
              Scroll for the full walkthrough
            </div>
          </div>

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
          <div style={{ marginBottom: 18 }}>
            <div style={sectionTitleStyle}>0 Log in</div>
            <div style={sectionBodyStyle}>
              <p>Sign in with Google. After login you will land on the map.</p>

              <video autoPlay loop muted playsInline controls preload="metadata" style={videoStyle}>
                <source src={t("login.mov")} />
              </video>
              <div style={captionStyle}>Sign in, then redirect to the grid map.</div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={sectionTitleStyle}>1 Get a Luma capture</div>
            <div style={sectionBodyStyle}>
              <p>
                Create a Gaussian Splat in Luma by uploading a short video or a set of photos. When
                it is ready, copy the capture link.
              </p>

              <video autoPlay loop muted playsInline controls preload="metadata" style={videoStyle}>
                <source src={t("lumacaptureweb.mov")} />
              </video>
              <div style={captionStyle}>Where Luma captures live.</div>

              <div style={{ height: 10 }} />

              <video autoPlay loop muted playsInline controls preload="metadata" style={videoStyle}>
                <source src={t("createowncapture.mov")} />
              </video>
              <div style={captionStyle}>Creating your own capture.</div>

              <div style={{ height: 10 }} />

              <video autoPlay loop muted playsInline controls preload="metadata" style={videoStyle}>
                <source src={t("gettingCaptureURL.mov")} />
              </video>
              <div style={captionStyle}>Copy the capture URL.</div>

              <div style={calloutStyle}>
                Tip: steady motion, good lighting, and full coverage usually produce the best
                splats.
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={sectionTitleStyle}>2 Select a plot and upload</div>
            <div style={sectionBodyStyle}>
              <p>
                Click empty squares to select a plot. Then fill in the name and Luma link on the
                right panel and upload.
              </p>

              <ul style={ulStyle}>
                <li>Your uploads render red. Other people’s render white</li>
                <li>Occupied plots cannot be selected</li>
                <li>Dimensions are metadata for scale reference</li>
              </ul>

              <video autoPlay loop muted playsInline controls preload="metadata" style={videoStyle}>
                <source src={t("gridSelectionDataInput.mov")} />
              </video>
              <div style={captionStyle}>Selecting squares and filling out the upload form.</div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={sectionTitleStyle}>3 Navigate and explore</div>
            <div style={sectionBodyStyle}>
              <p>
                Pan and zoom to explore. Hover for details. Click an occupied plot to open the
                viewer.
              </p>

              <video autoPlay loop muted playsInline controls preload="metadata" style={videoStyle}>
                <source src={t("sceneNabDemo.mov")} />
              </video>
              <div style={captionStyle}>Panning and navigating the grid map.</div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={sectionTitleStyle}>4 Top bar features</div>
            <div style={sectionBodyStyle}>
              <p>
                PlaybackXR returns to the landing page. Land count lists your uploads and opens
                them.
              </p>

              <video autoPlay loop muted playsInline controls preload="metadata" style={videoStyle}>
                <source src={t("navbar.mov")} />
              </video>
              <div style={captionStyle}>Navbar overview with land count dropdown.</div>

              <div style={{ height: 10 }} />

              <video autoPlay loop muted playsInline controls preload="metadata" style={videoStyle}>
                <source src={t("backToLanding.mov")} />
              </video>
              <div style={captionStyle}>Return to landing page.</div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={sectionTitleStyle}>5 VR viewing on Quest 3</div>
            <div style={sectionBodyStyle}>
              <p>
                Open a splat, then press Enter VR inside the viewer. For best results, use the Quest
                Browser on Meta Quest 3.
              </p>

              <div style={calloutStyle}>
                If you do not see the VR button, your browser may not support WebXR or may not be in
                a secure context.
              </div>
            </div>
          </div>

          <div style={{ opacity: 0.6, fontSize: 12 }}>
            You can reopen this tutorial later from the top bar.
          </div>
        </div>
      </div>
    </div>
  );
}
