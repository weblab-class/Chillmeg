import React from "react";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <h1 style={{ marginTop: 0 }}>Sign in</h1>
      <GoogleLogin
        onSuccess={(cred) => {
          console.log("google success", cred);
        }}
        onError={() => {
          console.log("google error");
        }}
      />
    </div>
  );
}
