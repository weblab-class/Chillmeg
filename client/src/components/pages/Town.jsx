import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { LumaSplatsThree } from "@lumaai/luma-web";
import { useNavigate, useParams } from "react-router-dom";
import "./Town.css";

async function apiGetJson(url) {
  const res = await fetch(url, { credentials: "include" });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

function cellIndexToXY(i, gridSide) {
  return { x: i % gridSide, y: Math.floor(i / gridSide) };
}

function makeInvisibleOccluderMat() {
  return new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: true,
    depthTest: true,
    colorWrite: false,
    side: THREE.DoubleSide,
  });
}

function addSquareOccluders(scene, cx, cz, half, height = 40, thickness = 0.25) {
  const mat = makeInvisibleOccluderMat();

  const wallX = new THREE.BoxGeometry(thickness, height, half * 2 + thickness);
  const wallZ = new THREE.BoxGeometry(half * 2 + thickness, height, thickness);

  const left = new THREE.Mesh(wallX, mat);
  left.position.set(cx - half, height / 2, cz);

  const right = new THREE.Mesh(wallX, mat);
  right.position.set(cx + half, height / 2, cz);

  const front = new THREE.Mesh(wallZ, mat);
  front.position.set(cx, height / 2, cz - half);

  const back = new THREE.Mesh(wallZ, mat);
  back.position.set(cx, height / 2, cz + half);

  left.renderOrder = 1;
  right.renderOrder = 1;
  front.renderOrder = 1;
  back.renderOrder = 1;

  scene.add(left);
  scene.add(right);
  scene.add(front);
  scene.add(back);

  return [left, right, front, back];
}

export default function Town() {
  const { townId } = useParams();
  const navigate = useNavigate();
  const mountRef = useRef(null);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("Loading");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer = null;
    let scene = null;
    let camera = null;
    let controls = null;
    let raf = 0;

    const disposers = [];

    const init = async () => {
      setError("");
      setInfo("Loading");

      const gridSide = 3;
      const gridMode = gridSide * gridSide;

      const tileSize = 5.5;
      const tileThickness = 0.5;
      const spacing = 6;

      scene = new THREE.Scene();
      scene.background = new THREE.Color("#0a0a0a");

      const w = mount.clientWidth || 800;
      const h = mount.clientHeight || 600;

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

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      mount.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const sun = new THREE.DirectionalLight(0xffffff, 0.6);
      sun.position.set(10, 30, 10);
      scene.add(sun);

      const tileGeo = new THREE.BoxGeometry(tileSize, tileThickness, tileSize);
      const tileMat = new THREE.MeshStandardMaterial({
        color: 0x141414,
        roughness: 1,
        metalness: 0,
      });

      const borderMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
      });

      const tileCenters = new Map();

      for (let i = 0; i < gridSide * gridSide; i += 1) {
        const { x, y } = cellIndexToXY(i, gridSide);
        const worldX = (x - (gridSide - 1) / 2) * spacing;
        const worldZ = (y - (gridSide - 1) / 2) * spacing;

        tileCenters.set(i, { worldX, worldZ });

        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.position.set(worldX, -tileThickness / 2, worldZ);
        tile.rotation.y = 0;
        tile.renderOrder = 0;
        scene.add(tile);

        const edges = new THREE.EdgesGeometry(tileGeo);
        const border = new THREE.LineSegments(edges, borderMat);
        border.position.copy(tile.position);
        border.rotation.copy(tile.rotation);
        border.renderOrder = 0;
        scene.add(border);
      }

      let state = null;

      try {
        state = await apiGetJson(`/api/towns/${townId}/state?gridMode=${gridMode}`);
      } catch {
        state = await apiGetJson(
          `/api/maps/${(await apiGetJson("/api/maps"))?.maps?.[0]?._id}/state?gridMode=${gridMode}`
        );
      }

      const stateCells = state?.cells || [];
      const filled = stateCells.filter(
        (c) =>
          c?.status === "filled" &&
          c?.splat?.lumaCaptureUrl &&
          String(c.splat.lumaCaptureUrl).trim()
      );

      const half = (tileSize / 2) * 0.98;

      for (const c of filled) {
        const center = tileCenters.get(c.cellIndex);
        if (!center) continue;

        addSquareOccluders(scene, center.worldX, center.worldZ, half, 40, 0.25);

        const splat = new LumaSplatsThree({
          source: String(c.splat.lumaCaptureUrl).trim(),
          particleRevealEnabled: true,
        });

        splat.position.set(center.worldX, 0.02, center.worldZ);
        splat.scale.setScalar(0.6);
        splat.renderOrder = 2;

        scene.add(splat);
      }

      setInfo("Drag to orbit. Scroll to zoom.");

      const onResize = () => {
        if (!renderer || !camera) return;

        const ww = mount.clientWidth || 800;
        const hh = mount.clientHeight || 600;

        camera.left = (-viewSize * ww) / hh;
        camera.right = (viewSize * ww) / hh;
        camera.top = viewSize;
        camera.bottom = -viewSize;
        camera.updateProjectionMatrix();

        renderer.setSize(ww, hh);
      };

      window.addEventListener("resize", onResize);
      disposers.push(() => window.removeEventListener("resize", onResize));

      const loop = () => {
        raf = requestAnimationFrame(loop);
        controls.update();
        renderer.render(scene, camera);
      };
      loop();
    };

    init().catch((e) => {
      setError(String(e?.message || e));
      setInfo("");
    });

    return () => {
      disposers.forEach((fn) => fn());

      if (raf) cancelAnimationFrame(raf);

      if (controls) controls.dispose();

      if (scene) {
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose?.();
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => m?.dispose?.());
          }
        });
      }

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement?.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [townId]);

  return (
    <div className="townRoot">
      <div className="townHud">
        <div className="townTopRow">
          <div className="townTitle">Town</div>
          <button className="townBtn" onClick={() => navigate("/home")}>
            Back
          </button>
        </div>

        {info ? <div className="townInfo">{info}</div> : null}
        {error ? <div className="townError">{error}</div> : null}

        <div className="townSmall">Town id: {townId}</div>
      </div>

      <div ref={mountRef} className="townCanvasMount" />
    </div>
  );
}
