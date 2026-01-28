import React, { useEffect, useRef } from "react";
import { WebGLRenderer, PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { LumaSplatsThree } from "@lumaai/luma-web";

export default function LumaWebViewer({ sourceUrl }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceUrl) return;

    let stopped = false;

    const renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
    });

    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new Scene();

    const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2;

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

    const animate = () => {
      if (stopped) return;
      controls.update();
      renderer.render(scene, camera);
      renderer.setAnimationLoop(animate);
    };

    renderer.setAnimationLoop(animate);

    return () => {
      stopped = true;
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
    };
  }, [sourceUrl]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "black",
      }}
    />
  );
}
