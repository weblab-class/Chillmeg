import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

async function apiLoginWithGoogleCredential(credential) {
  const res = await fetch("/api/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: credential }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);

  return JSON.parse(text);
}

export default function Login({ onSuccess }) {
  const [error, setError] = useState("");

  return (
    <div style={{ color: "#fff" }}>
      {error ? <div style={{ color: "#ff7777", marginBottom: 10 }}>{error}</div> : null}

      <GoogleLogin
        onSuccess={async (cred) => {
          try {
            setError("");
            await apiLoginWithGoogleCredential(cred.credential);
            if (onSuccess) onSuccess(cred);
          } catch (e) {
            setError(String(e?.message || e));
          }
        }}
        onError={() => {
          setError("Google sign in failed");
        }}
      />
    </div>
  );
}
