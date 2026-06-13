export const API_URL = import.meta.env.VITE_API_URL || "";

export const SESSION_KEY = "pulse_session_v1";
export const loadSession = () => {
  try { const s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
};
export const saveSession = s => {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
};
export const clearSession = () => {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
};
