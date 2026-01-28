import React, { useEffect, useRef } from "react";
import { WebGLRenderer, PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { LumaSplatsThree } from "@lumaai/luma-web";

export default function LumaWebViewer({ sourceUrl, enableVR = true }) {
  const canvasRef = useRef(null);
  const vrHostRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const vrHost = vrHostRef.current;
    if (!canvas || !vrHost || !sourceUrl) return;

    let disposed = false;

    const renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
    });

    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new Scene();

    const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 1.5, 2);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    const splats = new LumaSplatsThree({
      source: sourceUrl,
      particleRevealEnabled: true,
    });

    scene.add(splats);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    let vrButtonEl = null;

    if (enableVR) {
      renderer.xr.enabled = true;

      try {
        vrButtonEl = VRButton.createButton(renderer);
        vrButtonEl.style.position = "absolute";
        vrButtonEl.style.left = "16px";
        vrButtonEl.style.bottom = "16px";
        vrButtonEl.style.zIndex = "5";
        vrButtonEl.style.pointerEvents = "auto";
        vrHost.appendChild(vrButtonEl);
      } catch (e) {
        console.log("VRButton failed to init", e);
      }
    }

    const animate = () => {
      if (disposed) return;
      controls.update();
      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    return () => {
      disposed = true;

      window.removeEventListener("resize", resize);

      try {
        renderer.setAnimationLoop(null);
      } catch {}

      try {
        controls.dispose();
      } catch {}

      try {
        scene.remove(splats);
      } catch {}

      try {
        renderer.dispose();
      } catch {}

      if (vrButtonEl && vrButtonEl.parentNode) {
        vrButtonEl.parentNode.removeChild(vrButtonEl);
      }
    };
  }, [sourceUrl, enableVR]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "black" }}>
      <div ref={vrHostRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "black",
        }}
      />
    </div>
  );
}
