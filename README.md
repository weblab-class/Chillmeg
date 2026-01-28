# PlaybackXR

https://playbackxr.onrender.com/

PlaybackXR is a collaborative, web based sandbox for building and exploring shared Gaussian Splat environments, designed for accessible cultural documentation and immersive spatial replay through WebXR.

---

## Project Summary

PlaybackXR is motivated by cultural and spatial preservation in the age of emerging 3D reconstruction. Gaussian Splats can capture fragile, remote, or culturally meaningful environments with high fidelity, but these reconstructions often stay locked inside specialized viewers and file based workflows. PlaybackXR reframes splats as shared spatial artifacts by indexing them on an infinite grid that anyone can understand: claim plots, attach captures, and collectively assemble a navigable world that works on desktop and in VR using WebXR.

The core UI innovation is the combination of a minimal two dimensional plot interface with immersive volumetric viewing. Each occupied plot becomes a stable spatial address for a 3D capture, lowering the cognitive barrier of 3D world building while still supporting WebXR entry for devices such as Meta Quest 3.

---

## What Is Gaussian Splatting

Gaussian Splatting is a real time 3D rendering technique that represents a scene as many volumetric Gaussian primitives rather than polygon meshes. It enables photoreal reconstruction from images or video and supports interactive viewpoint changes with strong visual fidelity.

PlaybackXR uses externally generated splat captures and focuses on how they are organized, navigated, and experienced collaboratively on the web.

---

## What Is WebXR

WebXR is a browser standard that enables immersive VR and AR experiences directly in web pages. PlaybackXR uses WebXR through Three.js so users can open a capture and enter VR in a compatible browser without installing a native app.

---

## User Tutorial

### 0 Log in

Sign in with Google. After login you land on the map.

### 1 Get a Luma capture

Create a capture by uploading a short video or image set, then copy the capture URL.

Create and find capture link from here: https://lumalabs.ai/dashboard/captures.

### 2 Select a plot and upload

Select one or more empty grid cells, then fill the right panel:

- Name
- Luma capture URL
- Optional dimensions as metadata

Submit to attach your capture to the selected plot.

### 3 Navigate and explore

- Pan with right click or middle click
- Zoom with the mouse wheel
- Hover to see basic metadata
- Click occupied plots to open the viewer

### 4 Navbar features

- PlaybackXR at top left returns to landing
- Tutorial button reopens this tutorial
- Land count lists your uploads and opens them
- Avatar shows current user

### 5 VR viewing on Quest 3

Open a splat and click Enter VR inside the viewer. Best experienced using Meta Quest Browser.

---

## Why This Matters

PlaybackXR blends high fidelity spatial capture with an accessible organizing metaphor to support collaborative memory spaces and heritage documentation. It reduces complex volumetric media to a simple social interface: a shared map, plot ownership, and web native immersive viewing.

---

## Technical Architecture

### Frontend

- React with Vite
- React Router for routing
- HTML Canvas based grid renderer for selection and navigation
- Three.js for 3D scene rendering and interaction
- WebXR via Three.js VRButton utilities
- Luma Web Library for rendering Luma Interactive Scenes captures
- Google OAuth UI for login

### Backend

- Node.js
- Express
- express-session for session cookies
- MongoDB with Mongoose for persistence
- REST endpoints for user session and splat records

### Hosting

- Render for hosting
- MongoDB Atlas for database

---

## Third Party Libraries and APIs

This section is written to satisfy requirements to include all third party code and APIs.

### Frontend libraries

- React  
  https://react.dev/
- Vite  
  https://vitejs.dev/
- React Router  
  https://reactrouter.com/en/main/routers/create-browser-router
- Three.js  
  https://threejs.org/docs/
- Three.js OrbitControls example module  
  https://threejs.org/docs/
- Three.js VRButton WebXR utility  
  https://threejs.org/docs/pages/VRButton.html
- Luma Web Library  
  https://lumalabs.ai/luma-web-library/

### Auth libraries and APIs

- @react-oauth/google  
  https://www.npmjs.com/package/@react-oauth/google  
  https://github.com/MomenSherif/react-oauth
- Google Identity Services  
  https://developers.google.com/identity

### Backend libraries

- Node.js  
  https://nodejs.org/
- Express  
  https://expressjs.com/
- express-session  
  https://www.npmjs.com/package/express-session
- MongoDB  
  https://www.mongodb.com/
- MongoDB Atlas  
  https://www.mongodb.com/atlas
- Mongoose  
  https://mongoosejs.com/

### Hosting and infrastructure

- Render  
  https://render.com/

### External content and services

- Luma Interactive Scenes capture links are user provided. PlaybackXR loads those captures for viewing through the Luma Web Library.  
  https://lumalabs.ai/interactive-scenes/

---

## AI Assistance Disclosure

AI tools were used as a development assistant for drafting, debugging, and refactoring support, similar to a Codex style coding companion. AI was treated as a tool, not an author. All project direction, interface decisions, interaction design, and conceptual framing, including the heritage protection motivation and the grid based UI approach, were developed and finalized by the project author.

---
