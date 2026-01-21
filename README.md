# PlaybackXR

A browser based sandbox where players claim a plot on an isometric grid, attach a Luma capture, and walk around a shared town.

## What it does

1 Sign in with Google  
2 Pick a map and see a grid of plots  
3 Reserve an empty plot  
4 Paste a Luma capture URL to fill the plot  
5 Walk the town and view the placed splats  
6 Select a filled plot and delete it to make the plot empty again

## Tech stack

Frontend: React + Vite  
Backend: Node.js + Express  
Database: MongoDB Atlas  
Auth: Google OAuth + server sessions  
Splat viewing: Luma Web Library + three.js

## Demo flow for judges

1 Open the deployed URL  
2 Sign in  
3 Go to Maps  
4 Click an empty cell to reserve it  
5 Paste a public Luma capture URL and click Attach  
6 Click Walk to see the splat placed on the isometric grid  
7 Click a filled cell in Maps and click Delete selected splat

## Local setup

Prereqs: Node 20, npm, MongoDB Atlas connection string, Google OAuth client id.

1 Install

```bash
npm install
```
