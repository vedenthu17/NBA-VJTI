const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const WS_BASE_URL = API_BASE_URL.replace(/^http/i, "ws");

function buildHeaders(token, hasJson = true) {
  const headers = {};
  if (hasJson) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiFetch(path, options = {}) {
  const { token, body, ...rest } = options;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        ...buildHeaders(token, body !== undefined),
        ...(rest.headers || {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach backend API. Ensure backend is running and VITE_API_BASE_URL is correct.");
  }

  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = await response.json();
      message = payload.message || message;
      const fieldErrors = payload?.errors?.fieldErrors || {};
      const details = Object.entries(fieldErrors)
        .flatMap(([field, issues]) => (issues || []).map((issue) => `${field}: ${issue}`))
        .filter(Boolean);
      if (details.length) {
        message = `${message} (${details.join("; ")})`;
      }
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.blob();
}

export { API_BASE_URL, WS_BASE_URL };
