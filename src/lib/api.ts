// Cliente HTTP + WebSocket para o backend M3U Sync.
// Config: guardada em localStorage. Se não houver, o app usa dados mockados.

const LS_URL = "m3u.apiUrl";
const LS_TOKEN = "m3u.token";

export function getApiUrl(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_URL);
}
export function setApiUrl(url: string) {
  localStorage.setItem(LS_URL, url.replace(/\/$/, ""));
}
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_TOKEN);
}
export function setToken(t: string) { localStorage.setItem(LS_TOKEN, t); }
export function clearAuth() { localStorage.removeItem(LS_TOKEN); }

export function isConfigured() {
  return !!getApiUrl() && !!getToken();
}

async function req(path: string, init: RequestInit = {}) {
  const url = getApiUrl();
  if (!url) throw new Error("API não configurada");
  const token = getToken();
  const res = await fetch(url + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (res.status === 401) { clearAuth(); throw new Error("Sessão expirada"); }
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: async (url: string, username: string, password: string) => {
    const res = await fetch(url.replace(/\/$/, "") + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Credenciais inválidas");
    return res.json() as Promise<{ token: string; user: { username: string } }>;
  },
  stats: () => req("/api/stats"),
  logs: () => req("/api/logs"),
  settings: () => req("/api/settings"),
  saveSettings: (patch: Record<string, unknown>) =>
    req("/api/settings", { method: "PUT", body: JSON.stringify(patch) }),
  testM3U: (url?: string) =>
    req("/api/m3u/test", { method: "POST", body: JSON.stringify(url ? { url } : {}) }),
  syncNow: () => req("/api/m3u/sync", { method: "POST" }),
  syncHistory: () => req("/api/sync/history"),
  content: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req("/api/content" + (qs ? "?" + qs : ""));
  },
  categories: (kind?: string) => req("/api/content/categories" + (kind ? `?kind=${kind}` : "")),
  download: (ids: number[]) =>
    req("/api/content/download", { method: "POST", body: JSON.stringify({ ids }) }),
  downloadAll: (filters: Record<string, unknown>) =>
    req("/api/content/download-all", { method: "POST", body: JSON.stringify(filters) }),
  cancel: (id: number) => req(`/api/content/${id}/cancel`, { method: "POST" }),
  remove: (id: number) => req(`/api/content/${id}`, { method: "DELETE" }),
};

// WebSocket com auto-reconnect
export function connectWS(handlers: {
  onMetrics?: (m: any) => void;
  onContent?: (c: any) => void;
}) {
  const url = getApiUrl();
  const token = getToken();
  if (!url || !token) return () => {};
  let ws: WebSocket | null = null;
  let alive = true;
  let retry = 0;

  const open = () => {
    const wsUrl = url.replace(/^http/, "ws") + "/ws?token=" + encodeURIComponent(token);
    ws = new WebSocket(wsUrl);
    ws.onmessage = (ev) => {
      try {
        const { type, payload } = JSON.parse(ev.data);
        if (type === "metrics") handlers.onMetrics?.(payload);
        else if (type === "content") handlers.onContent?.(payload);
      } catch {}
    };
    ws.onopen = () => { retry = 0; };
    ws.onclose = () => {
      if (!alive) return;
      retry = Math.min(retry + 1, 5);
      setTimeout(open, 1000 * retry);
    };
    ws.onerror = () => ws?.close();
  };
  open();
  return () => { alive = false; ws?.close(); };
}
