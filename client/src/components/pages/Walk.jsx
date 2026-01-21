import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { LumaSplatsThree } from "@lumaai/luma-web";

async function apiGet(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function cellIndexToXY(i) {
  return { x: i % 3, y: Math.floor(i / 3) };
}

export default function Walk() {
  const mountRef = useRef(null);
  const [mapId, setMapId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/api/maps");
        if (data.maps?.length) setMapId(data.maps[0]._id);
      } catch (e) {
        setError(String(e.message || e));
      }
    })();
  }, []);

  useEffect(() => {
    if (!mapId) return;

    const mount = mountRef.current;
    let renderer;
    let scene;
    let camera;
    let controls;
    let raf = 0;

    const init = async () => {
      scene = new THREE.Scene();

      const w = mount.clientWidth;
      const h = mount.clientHeight;

      const viewSize = 14;
      camera = new THREE.OrthographicCamera(
        (-viewSize * w) / h,
        (viewSize * w) / h,
        viewSize,
        -viewSize,
        0.1,
        2000
      );

      camera.position.set(22, 22, 22);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: false });
      renderer.setSize(w, h);
      mount.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const sun = new THREE.DirectionalLight(0xffffff, 0.5);
      sun.position.set(10, 30, 10);
      scene.add(sun);

      const spacing = 6;
      const tileGeo = new THREE.BoxGeometry(5.5, 0.5, 5.5);
      const tileMat = new THREE.MeshStandardMaterial();

      for (let i = 0; i < 9; i += 1) {
        const { x, y } = cellIndexToXY(i);
        const worldX = (x - 1) * spacing;
        const worldZ = (y - 1) * spacing;

        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.position.set(worldX, -0.25, worldZ);
        scene.add(tile);
      }

      const state = await apiGet(`/api/maps/${mapId}/state?gridMode=9`);
      const filled = (state.cells || []).filter(
        (c) => c.status === "filled" && c.splat?.lumaCaptureUrl && c.splat.lumaCaptureUrl.trim()
      );

      for (const c of filled) {
        const { x, y } = cellIndexToXY(c.cellIndex);
        const worldX = (x - 1) * spacing;
        const worldZ = (y - 1) * spacing;

        const splat = new LumaSplatsThree({
          source: c.splat.lumaCaptureUrl.trim(),
          particleRevealEnabled: true,
        });

        splat.position.set(worldX, 0.02, worldZ);
        splat.scale.setScalar(0.5);
        scene.add(splat);
      }

      const onResize = () => {
        const ww = mount.clientWidth;
        const hh = mount.clientHeight;
        camera.left = (-viewSize * ww) / hh;
        camera.right = (viewSize * ww) / hh;
        camera.top = viewSize;
        camera.bottom = -viewSize;
        camera.updateProjectionMatrix();
        renderer.setSize(ww, hh);
      };
      window.addEventListener("resize", onResize);

      const loop = () => {
        raf = requestAnimationFrame(loop);
        controls.update();
        renderer.render(scene, camera);
      };
      loop();

      return () => window.removeEventListener("resize", onResize);
    };

    let cleanup = null;
    init()
      .then((c) => (cleanup = c))
      .catch((e) => setError(String(e.message || e)));

    return () => {
      if (cleanup) cleanup();
      if (raf) cancelAnimationFrame(raf);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement?.parentNode)
          renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [mapId]);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#000", color: "#fff" }}>
      <div
        style={{ position: "absolute", top: 12, left: 12, zIndex: 2, fontSize: 14, opacity: 0.9 }}
      >
        Drag to orbit. Scroll to zoom.
        {error ? <div style={{ color: "#ff7777", marginTop: 8 }}>{error}</div> : null}
      </div>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
