const API_BASE = import.meta?.env?.VITE_API_URL || "/api";

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed with ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function getTodos() {
  const res = await fetch(`${API_BASE}/todos`);
  return handleResponse(res);
}

export async function createTodo(text) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return handleResponse(res);
}

export async function updateTodo(id, payload) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteTodoApi(id) {
  const res = await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" });
  return handleResponse(res);
}
