import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Connexion() {
  const { connecter } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      const user = await connecter(phone, password);
      navigate(user.boutique ? '/tableau-de-bord' : '/creer-boutique');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Numéro ou mot de passe incorrect.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-sable p-3">
      <div className="carte-cci p-4 p-md-5" style={{ maxWidth: 420, width: '100%' }}>
        <Link to="/" className="font-display fs-4 fw-bold text-indigo-cci d-block text-center mb-4">
          Commande<span className="text-papaye">CI</span>
        </Link>
        <h1 className="fs-4 fw-semibold text-center mb-4">Connexion vendeur</h1>
        {erreur && <div className="alert alert-danger py-2">{erreur}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Numéro de téléphone</label>
            <input type="tel" className="form-control" placeholder="+225 07 00 00 00 00" required
              value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">Mot de passe</label>
            <input type="password" className="form-control" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn-cci-primary w-100" disabled={envoi}>
            {envoi ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-muted small mt-4 mb-0">
          Pas encore de compte ? <Link to="/inscription">Créer ma boutique</Link>
        </p>
      </div>
    </div>
  );
}
