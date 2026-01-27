import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import NotFound from "./components/pages/NotFound";

import Landing from "./components/pages/Landing";
import Login from "./components/pages/Login";
import Home from "./components/pages/Home";

import Maps from "./components/pages/Maps";
import Walk from "./components/pages/Walk";

import Town from "./components/pages/Town";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />

      <Route path="/maps" element={<Maps />} />
      <Route path="/walk" element={<Walk />} />

      <Route path="/town/:townId" element={<Town />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);
