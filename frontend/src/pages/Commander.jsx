import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getCartToken, getCodeAffilie } from '../services/api';

export default function Commander() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [panier, setPanier] = useState(null);
  const [form, setForm] = useState({
    nom: '', telephone: '', email: '', adresse_livraison: '', ville_livraison: '', note_client: '', canal_origine: 'lien_direct',
  });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const token = getCartToken(slug);
    api.get(`/boutiques/${slug}/panier`, { params: { token } }).then(({ data }) => setPanier(data));
  }, [slug]);

  const champ = (cle) => (e) => setForm((f) => ({ ...f, [cle]: e.target.value }));

  const contientPhysique = !panier || panier.items.some((i) => i.product?.type_produit !== 'numerique');
  const uniquementNumerique = panier && panier.items.length > 0 && !contientPhysique;

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur('');
    try {
      const token = getCartToken(slug);
      const codeAffilie = getCodeAffilie(slug);
      const { data } = await api.post(`/boutiques/${slug}/commandes`, {
        ...form, token, code_affilie: codeAffilie || undefined,
      });
      navigate(`/suivi/${data.numero}`, { state: { telephone: form.telephone } });
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de valider la commande. Vérifiez votre panier.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-vh-100 bg-sable py-4">
      <div className="container" style={{ maxWidth: 480 }}>
        <Link to={`/b/${slug}/panier`} className="text-decoration-none text-muted small d-block mb-3">← Retour au panier</Link>
        <h1 className="font-display fs-3 fw-bold mb-1">Vos coordonnées</h1>
        {uniquementNumerique && (
          <p className="text-feuille small mb-3">⚡ Livraison instantanée par téléchargement après votre commande.</p>
        )}
        {erreur && <div className="alert alert-danger py-2">{erreur}</div>}
        <form onSubmit={onSubmit} className="carte-cci p-4">
          <div className="mb-3">
            <label className="form-label small fw-semibold">Nom complet</label>
            <input className="form-control" required value={form.nom} onChange={champ('nom')} />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Numéro de téléphone</label>
            <input type="tel" className="form-control" required placeholder="+225 07 00 00 00 00"
              value={form.telephone} onChange={champ('telephone')} />
          </div>

          {uniquementNumerique && (
            <div className="mb-3">
              <label className="form-label small fw-semibold">E-mail (optionnel, pour recevoir aussi le lien par mail)</label>
              <input type="email" className="form-control" value={form.email} onChange={champ('email')} />
            </div>
          )}

          {contientPhysique && (
            <>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Adresse de livraison</label>
                <input className="form-control" required value={form.adresse_livraison} onChange={champ('adresse_livraison')} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Ville / Quartier</label>
                <input className="form-control" value={form.ville_livraison} onChange={champ('ville_livraison')} />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="form-label small fw-semibold">Note pour le vendeur (optionnel)</label>
            <textarea className="form-control" rows={2} value={form.note_client} onChange={champ('note_client')} />
          </div>
          <button className="btn-cci-primary w-100" disabled={envoi}>
            {envoi ? 'Validation...' : 'Confirmer ma commande'}
          </button>
          <p className="text-muted small text-center mt-3 mb-0">Aucun compte n'est nécessaire pour commander.</p>
        </form>
      </div>
    </div>
  );
}
