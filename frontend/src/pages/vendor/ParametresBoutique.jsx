import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BadgePremium from '../../components/BadgePremium.jsx';

export default function ParametresBoutique() {
  const { user, majUtilisateur } = useAuth();
  const b = user.boutique;
  const [form, setForm] = useState({ nom: b.nom, description: b.description || '', whatsapp_numero: b.whatsapp_numero, ville: b.ville || '' });
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState('');

  const champ = (cle) => (e) => setForm((f) => ({ ...f, [cle]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setMessage('');
    try {
      const { data } = await api.put('/ma-boutique', form);
      majUtilisateur({ ...user, boutique: data });
      setMessage('Boutique mise à jour ✓');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div>
      <h1 className="fs-4 fw-semibold mb-4">Paramètres de la boutique</h1>

      <div className="carte-cci p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="text-muted small">Plan actuel</div>
            <div className="fw-semibold">{b.plan === 'premium' ? 'Premium' : 'Standard'} <BadgePremium actif={b.plan === 'premium'} /></div>
          </div>
          <div className="text-end">
            <div className="text-muted small">Commission CommandeCI</div>
            <div className="fs-5 fw-bold font-mono text-papaye">{b.taux_commission}%</div>
          </div>
        </div>
        {b.plan !== 'premium' && (
          <p className="text-muted small mb-0">
            Passez en Premium (2% de commission au lieu de 1%) pour mettre en avant votre boutique
            sur CommandeCI et gagner en visibilité auprès de plus de clients, partout en Afrique.
            Contactez le support CommandeCI sur WhatsApp pour activer cette option.
          </p>
        )}
      </div>

      {message && <div className="alert alert-success py-2">{message}</div>}

      <form onSubmit={onSubmit} className="carte-cci p-4">
        <div className="mb-3">
          <label className="form-label small fw-semibold">Nom de la boutique</label>
          <input className="form-control" value={form.nom} onChange={champ('nom')} required />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Description</label>
          <textarea className="form-control" rows={3} value={form.description} onChange={champ('description')} />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Numéro WhatsApp</label>
          <input className="form-control" value={form.whatsapp_numero} onChange={champ('whatsapp_numero')} required />
        </div>
        <div className="mb-4">
          <label className="form-label small fw-semibold">Ville</label>
          <input className="form-control" value={form.ville} onChange={champ('ville')} />
        </div>
        <button className="btn-cci-primary" disabled={envoi}>{envoi ? 'Enregistrement...' : 'Enregistrer'}</button>
      </form>
    </div>
  );
}
