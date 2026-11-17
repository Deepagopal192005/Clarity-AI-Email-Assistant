const API = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

export const api = {
  emails: () => request("/api/emails"),
  updateEmail: (id, body) => request(`/api/emails/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  accounts: () => request("/api/accounts"),
  connect: (provider) => request("/api/accounts/connect", { method: "POST", body: JSON.stringify({ provider }) }),
  sync: (id) => request(`/api/accounts/${id}/sync`, { method: "POST" }),
  summarize: (email) => request("/api/ai/summarize", { method: "POST", body: JSON.stringify({ email }) }),
  classify: (email) => request("/api/ai/classify", { method: "POST", body: JSON.stringify({ email }) }),
  draft: (email, instruction) => request("/api/ai/draft", { method: "POST", body: JSON.stringify({ email, instruction }) })
};
