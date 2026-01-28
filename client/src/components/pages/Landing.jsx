import React from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const YT_ID = "jV_am1GXbGM";

  return (
    <div className="landingRoot">
      <div className="landingVideoLayer">
        <iframe
          title="bg"
          className="landingIframe"
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
        />
      </div>

      <div className="landingOverlay" />

      <div className="landingCenter">
        <div className="landingCard">
          <div className="landingBrand">PlaybackXR</div>
          <div className="landingTitle">Build an isometric splat town</div>
          <div className="landingDesc">
            Pick a plot, attach a Luma capture link, then explore the town.
          </div>

          <div className="landingLoginWrap">
            <Login onSuccess={() => navigate("/grid")} />
          </div>
        </div>
      </div>
    </div>
  );
}
