import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cci_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [chargement, setChargement] = useState(false);

  const connecter = useCallback(async (phone, password) => {
    setChargement(true);
    try {
      const { data } = await api.post('/auth/login', { phone, password });
      localStorage.setItem('cci_token', data.token);
      localStorage.setItem('cci_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setChargement(false);
    }
  }, []);

  const inscrire = useCallback(async (payload) => {
    setChargement(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('cci_token', data.token);
      localStorage.setItem('cci_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setChargement(false);
    }
  }, []);

  const deconnecter = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('cci_token');
    localStorage.removeItem('cci_user');
    setUser(null);
  }, []);

  const majUtilisateur = useCallback((u) => {
    localStorage.setItem('cci_user', JSON.stringify(u));
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, chargement, connecter, inscrire, deconnecter, majUtilisateur }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
