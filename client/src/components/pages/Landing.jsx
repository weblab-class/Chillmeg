import React from "react";
import Login from "./Login";
import LandingTeaser from "./LandingTeaser";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landingRoot">
      <LandingTeaser />
      <div className="landingOverlay" />

      <div className="landingCenter">
        <div className="landingCard">
          <div className="landingBrand">PlaybackXR</div>

          <div className="landingTitle">Gaussian Splat Sandbox</div>

          <div className="landingDesc">
            Pick your squares, attach a Luma capture, and build a shared splat map.
          </div>

          <div className="landingMeta">VR ready. Open a splat, then enter VR on Meta Quest 3.</div>

          <div className="landingLoginWrap">
            <Login onSuccess={() => window.location.assign("/grid")} />
          </div>

          <div className="landingHint">Dots are live uploads. Claim a plot to add yours.</div>
        </div>
      </div>
    </div>
  );
}
