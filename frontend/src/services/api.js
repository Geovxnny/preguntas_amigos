import { API_BASE } from '../constants/friends';

const PIN_KEY = 'trivia_host_pin';

function getPin() {
  return sessionStorage.getItem(PIN_KEY) || '';
}

export function setPin(pin) {
  sessionStorage.setItem(PIN_KEY, pin);
}

export function clearPin() {
  sessionStorage.removeItem(PIN_KEY);
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Pin': getPin(),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Preguntas y configuración ──────────────────────────

export const getPreguntas = () => request('/preguntas');

// ── Estado (pregunta activa) ───────────────────────────

export const getEstado = () => request('/estado');

export const setEstado = (pregunta_activa) =>
  request('/estado', {
    method: 'POST',
    body: JSON.stringify({ pregunta_activa }),
  });

// ── Votos ──────────────────────────────────────────────

export const getVotosPregunta = (idx) => request(`/votos/${idx}`);

export const getTodosVotos = () => request('/votos');

export const votar = (pregunta_idx, amigo) =>
  request('/votar', {
    method: 'POST',
    body: JSON.stringify({ pregunta_idx, amigo }),
  });

export const getDesempates = () => request('/desempates');

export const addDesempate = (amigo) =>
  request('/desempate', {
    method: 'POST',
    body: JSON.stringify({ amigo }),
  });

// ── Admin ──────────────────────────────────────────────

export const resetVotos = () =>
  request('/reset', { method: 'POST' });

export const resetEstado = () =>
  request('/reset-estado', { method: 'POST' });
