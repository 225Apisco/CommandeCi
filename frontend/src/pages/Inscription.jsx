import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Inscription() {
  const { inscrire } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', password: '', password_confirmation: '' });
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  const champ = (cle) => (e) => setForm((f) => ({ ...f, [cle]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErreurs({});
    setEnvoi(true);
    try {
      await inscrire(form);
      navigate('/creer-boutique');
    } catch (err) {
      setErreurs(err.response?.data?.errors || { global: ['Une erreur est survenue.'] });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-sable p-3">
      <div className="carte-cci p-4 p-md-5" style={{ maxWidth: 440, width: '100%' }}>
        <Link to="/" className="font-display fs-4 fw-bold text-indigo-cci d-block text-center mb-4">
          Commande<span className="text-papaye">CI</span>
        </Link>
        <h1 className="fs-4 fw-semibold text-center mb-4">Créer votre compte vendeur</h1>
        {erreurs.global && <div className="alert alert-danger py-2">{erreurs.global[0]}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Nom complet</label>
            <input className="form-control" required value={form.name} onChange={champ('name')} />
            {erreurs.name && <small className="text-danger">{erreurs.name[0]}</small>}
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Numéro WhatsApp</label>
            <input type="tel" className="form-control" placeholder="+225 07 00 00 00 00" required
              value={form.phone} onChange={champ('phone')} />
            {erreurs.phone && <small className="text-danger">{erreurs.phone[0]}</small>}
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Mot de passe</label>
            <input type="password" className="form-control" required minLength={8}
              value={form.password} onChange={champ('password')} />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">Confirmer le mot de passe</label>
            <input type="password" className="form-control" required
              value={form.password_confirmation} onChange={champ('password_confirmation')} />
          </div>
          <button className="btn-cci-primary w-100" disabled={envoi}>
            {envoi ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
        <p className="text-center text-muted small mt-4 mb-0">
          Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
