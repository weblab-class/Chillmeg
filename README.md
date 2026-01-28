# PlaybackXR

https://playbackxr.onrender.com/

PlaybackXR is a collaborative, web-based sandbox for building and exploring shared Gaussian Splat environments, designed to make advanced 3D reconstruction and immersive viewing accessible directly through the browser and WebXR.

---

## Project Summary

PlaybackXR enables users to claim spatial plots on a shared infinite grid, attach Gaussian Splat captures generated from real-world video, and collectively assemble a navigable virtual environment.  
The project reframes Gaussian Splats not as isolated visual artifacts, but as spatially indexed, shared pieces of a growing world that can be explored on desktop or in VR using WebXR.

The system emphasizes accessibility, collaboration, and cultural preservation by lowering the technical barrier to creating, sharing, and experiencing volumetric spatial media.

---

## What Is Gaussian Splatting?

Gaussian Splatting is a real-time 3D rendering technique that represents scenes as millions of oriented 3D Gaussian primitives instead of traditional polygon meshes.

Compared to meshes or point clouds, Gaussian Splats:

- Preserve fine visual detail from video-based captures
- Render efficiently on the GPU
- Avoid complex mesh cleanup workflows
- Accurately reconstruct irregular or culturally significant spaces

PlaybackXR uses Gaussian Splats generated externally via Luma AI and focuses on how these reconstructions are spatially organized, navigated, and shared.

---

## What Is WebXR?

WebXR is a browser standard that enables immersive VR and AR experiences directly on the web without native applications.

PlaybackXR integrates WebXR to:

- Enable immersive viewing on devices such as Meta Quest 3
- Maintain a single codebase for desktop and VR
- Allow users to enter VR directly from the browser
- Remove the need for app installation or platform lock-in

This allows volumetric content to remain widely accessible while still supporting high-end immersive hardware.

---

## User Walkthrough

### 1. Log In

Users authenticate via Google OAuth. After login, they are taken directly to the shared grid map.

### 2. Create a Gaussian Splat

Users generate a Gaussian Splat using Luma AI by uploading a short video or image set. Once processing is complete, they copy the capture URL.

### 3. Claim a Plot

Users select one or more empty grid cells on the map. The selection merges into a single outlined region, reinforcing the idea of spatial ownership rather than discrete pixels.

### 4. Upload

Users enter:

- A name for the splat
- The Luma capture URL
- Optional dimensional metadata

The splat is then attached to the selected plot.

### 5. Explore

- Pan and zoom across the grid
- Hover to see metadata
- Click occupied plots to open an embedded viewer

### 6. VR Viewing

Inside the viewer, users can enter VR using WebXR. PlaybackXR is optimized for Meta Quest 3 using Quest Browser.

### 7. Navigation Tools

The top navigation bar allows users to:

- Return to the landing page
- View a list of their uploaded plots
- Reopen the tutorial at any time

---

## Why This Project Matters

PlaybackXR explores how emerging spatial media can be:

- Organized spatially rather than buried in file systems
- Shared collaboratively across users
- Viewed without proprietary software
- Used for documentation, memory, and cultural preservation

By combining Gaussian Splatting, WebXR, and a simple grid metaphor, the project proposes a scalable model for shared spatial archives and collective digital environments.

---

## Technical Architecture

### Frontend

- React with Vite
- Custom HTML Canvas grid renderer
- Three.js for Gaussian Splat viewing
- WebXR integration for VR
- Responsive CSS for desktop and mobile
- Google OAuth authentication

### Backend

- Node.js
- Express
- MongoDB
- Session-based authentication
- REST APIs for users and splats

### Hosting

- Render for deployment
- MongoDB Atlas
- Static assets served from Vite public directory

---

## Libraries and APIs

- React
- Vite
- Three.js
- WebXR
- Luma AI Web Viewer
- Google OAuth
- MongoDB
- Express
- Node.js
- Socket.io (infrastructure prepared)

---

## Local Development

### Requirements

- Node.js
- MongoDB
- Google OAuth credentials

### Setup

```bash
npm install
npm run dev
```
