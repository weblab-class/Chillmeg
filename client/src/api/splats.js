export async function fetchSplats() {
  const res = await fetch("/api/splats", { credentials: "include" });
  const data = await res.json();
  return data.splats || [];
}

export async function createSplat(payload) {
  const res = await fetch("/api/splats", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }

  return res.json();
}
