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

export async function deleteSplat(id) {
  const res = await fetch(`/api/splats/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Delete failed");
  }

  return res.json();
}

export async function fetchMe() {
  const res = await fetch("/api/me", { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.user || data || null;
}
