import React from "react";
import { GoogleLogin } from "@react-oauth/google";

export default function Login({ onSuccess }) {
  return (
    <div style={{ color: "#fff" }}>
      <GoogleLogin
        onSuccess={(cred) => {
          console.log("google success", cred);
          if (onSuccess) onSuccess(cred);
        }}
        onError={() => {
          console.log("google error");
        }}
      />
    </div>
  );
}
