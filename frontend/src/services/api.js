import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
});

// Attache automatiquement le token vendeur (Sanctum) s'il est présent.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cci_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Déconnecte automatiquement en cas de session expirée.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cci_token');
      localStorage.removeItem('cci_user');
      if (!window.location.pathname.startsWith('/connexion')) {
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(error);
  }
);

/* ---------- Panier client (jeton local, sans compte) ---------- */
export function getCartToken(slug) {
  return localStorage.getItem(`cci_panier_${slug}`);
}
export function setCartToken(slug, token) {
  localStorage.setItem(`cci_panier_${slug}`, token);
}

/* ---------- Code affilié (mémorisé 30 jours par boutique, comme un cookie d'attribution) ---------- */
const DUREE_ATTRIBUTION_MS = 30 * 24 * 60 * 60 * 1000;

export function memoriserCodeAffilie(slug, code) {
  if (!code) return;
  localStorage.setItem(`cci_ref_${slug}`, JSON.stringify({ code, expire: Date.now() + DUREE_ATTRIBUTION_MS }));
}
export function getCodeAffilie(slug) {
  try {
    const brut = localStorage.getItem(`cci_ref_${slug}`);
    if (!brut) return null;
    const { code, expire } = JSON.parse(brut);
    return Date.now() < expire ? code : null;
  } catch {
    return null;
  }
}

export default api;
