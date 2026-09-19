import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CreerBoutique() {
  const { user, majUtilisateur } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '', description: '', whatsapp_numero: user?.phone || '', ville: '',
  });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const champ = (cle) => (e) => setForm((f) => ({ ...f, [cle]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur('');
    try {
      const { data: boutique } = await api.post('/ma-boutique', form);
      majUtilisateur({ ...user, boutique });
      navigate('/tableau-de-bord');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de créer la boutique.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-vh-100 bg-sable d-flex align-items-center justify-content-center p-3">
      <div className="carte-cci p-4 p-md-5" style={{ maxWidth: 480, width: '100%' }}>
        <h1 className="fs-4 fw-semibold mb-1">Créez votre boutique</h1>
        <p className="text-muted mb-4">Dernière étape avant de recevoir vos premières commandes.</p>
        {erreur && <div className="alert alert-danger py-2">{erreur}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Nom de la boutique</label>
            <input className="form-control" placeholder="Ex: Aïcha Mode & Beauté" required
              value={form.nom} onChange={champ('nom')} />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Description courte</label>
            <textarea className="form-control" rows={3} placeholder="Ce que vous vendez, votre spécialité..."
              value={form.description} onChange={champ('description')} />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Numéro WhatsApp Business</label>
            <input type="tel" className="form-control" required
              value={form.whatsapp_numero} onChange={champ('whatsapp_numero')} />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">Ville</label>
            <input className="form-control" placeholder="Ex: Abidjan" value={form.ville} onChange={champ('ville')} />
          </div>
          <button className="btn-cci-primary w-100" disabled={envoi}>
            {envoi ? 'Création...' : 'Lancer ma boutique 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
