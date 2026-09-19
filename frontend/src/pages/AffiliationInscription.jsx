import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import WhatsAppShareButton from '../components/WhatsAppShareButton.jsx';

export default function AffiliationInscription() {
  const { slug } = useParams();
  const [form, setForm] = useState({ nom: '', telephone: '', email: '' });
  const [resultat, setResultat] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const champ = (cle) => (e) => setForm((f) => ({ ...f, [cle]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur('');
    try {
      const { data } = await api.post(`/boutiques/${slug}/affiliation`, form);
      setResultat(data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de créer votre lien pour le moment.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-vh-100 bg-sable py-4">
      <div className="container" style={{ maxWidth: 480 }}>
        <Link to={`/b/${slug}`} className="text-decoration-none text-muted small d-block mb-3">← Retour à la boutique</Link>

        {!resultat ? (
          <>
            <span className="badge-premium mb-2 d-inline-block">Programme d'affiliation</span>
            <h1 className="font-display fs-3 fw-bold mb-2">Gagnez une commission en partageant cette boutique</h1>
            <p className="text-muted mb-4">
              Recevez votre lien personnel, partagez-le sur WhatsApp, Facebook ou Instagram, et touchez
              une commission sur chaque vente réalisée grâce à vous — sans compte, sans engagement.
            </p>
            {erreur && <div className="alert alert-danger py-2">{erreur}</div>}
            <form onSubmit={onSubmit} className="carte-cci p-4">
              <div className="mb-3">
                <label className="form-label small fw-semibold">Votre nom</label>
                <input className="form-control" required value={form.nom} onChange={champ('nom')} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Votre numéro de téléphone</label>
                <input type="tel" className="form-control" required placeholder="+225 07 00 00 00 00"
                  value={form.telephone} onChange={champ('telephone')} />
                <small className="text-muted">Utilisé pour retrouver vos statistiques plus tard.</small>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-semibold">E-mail (optionnel)</label>
                <input type="email" className="form-control" value={form.email} onChange={champ('email')} />
              </div>
              <button className="btn-cci-primary w-100" disabled={envoi}>
                {envoi ? 'Création...' : 'Obtenir mon lien d\'affiliation'}
              </button>
            </form>
          </>
        ) : (
          <div className="carte-cci p-4 text-center">
            <span style={{ fontSize: '2.5rem' }}>🎉</span>
            <h2 className="fs-4 fw-bold mt-2 mb-1">Votre lien est prêt !</h2>
            <p className="text-muted mb-3">Partagez-le partout — chaque vente vous rapporte une commission.</p>
            <div className="carte-cci p-3 mb-3 font-mono small" style={{ wordBreak: 'break-all', background: '#FBF6EE' }}>
              {resultat.lien_affiliation}
            </div>
            <div className="d-flex flex-column gap-2">
              <WhatsAppShareButton
                message={`Découvrez cette boutique, j'ai testé et je recommande : ${resultat.lien_affiliation}`}
                libelle="Partager mon lien sur WhatsApp"
              />
              <button className="btn-cci-outline" onClick={() => navigator.clipboard.writeText(resultat.lien_affiliation)}>
                📋 Copier le lien
              </button>
              <Link to={`/affilies/${resultat.affilie.code}`} className="btn btn-sm btn-link text-muted mt-2">
                Voir mes statistiques d'affiliation →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
