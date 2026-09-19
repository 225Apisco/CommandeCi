import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function ProduitFormulaire() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const modeEdition = Boolean(productId);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    nom: '', description: '', prix: '', prix_promo: '', stock: 0,
    suivi_stock: true, est_publie: true, category_id: '',
    type_produit: 'physique', livraison_numerique: 'immediat',
    autoriser_affiliation: false, taux_commission_affilie: 20,
  });
  const [variantes, setVariantes] = useState([]);
  const [images, setImages] = useState([]);
  const [fichierNumerique, setFichierNumerique] = useState(null);
  const [fichierExistant, setFichierExistant] = useState(null);
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
    if (modeEdition) {
      api.get(`/produits/${productId}`).then(({ data }) => {
        setForm({
          nom: data.nom, description: data.description || '', prix: data.prix,
          prix_promo: data.prix_promo || '', stock: data.stock, suivi_stock: data.suivi_stock,
          est_publie: data.est_publie, category_id: data.category_id || '',
          type_produit: data.type_produit || 'physique',
          livraison_numerique: data.livraison_numerique || 'immediat',
          autoriser_affiliation: data.autoriser_affiliation || false,
          taux_commission_affilie: data.taux_commission_affilie || 20,
        });
        setVariantes(data.variants || []);
        setFichierExistant(data.fichier_numerique_nom || null);
      });
    }
  }, [productId, modeEdition]);

  const estNumerique = form.type_produit === 'numerique';

  const champ = (cle) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [cle]: val }));
  };

  const ajouterVariante = () => setVariantes((v) => [...v, { nom: '', valeur: '', supplement_prix: 0, stock: 0 }]);
  const majVariante = (i, cle, val) => setVariantes((v) => v.map((item, idx) => (idx === i ? { ...item, [cle]: val } : item)));
  const supprimerVariante = (i) => setVariantes((v) => v.filter((_, idx) => idx !== i));

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreurs({});
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v === true ? 1 : v === false ? 0 : v));
      if (!estNumerique) {
        variantes.forEach((v, i) => {
          Object.entries(v).forEach(([k, val]) => fd.append(`variantes[${i}][${k}]`, val));
        });
      }
      images.forEach((img) => fd.append('images[]', img));
      if (estNumerique && fichierNumerique) fd.append('fichier_numerique', fichierNumerique);

      if (modeEdition) {
        fd.append('_method', 'PUT');
        await api.post(`/produits/${productId}`, fd);
      } else {
        await api.post('/produits', fd);
      }
      navigate('/produits');
    } catch (err) {
      setErreurs(err.response?.data?.errors || {});
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div>
      <h1 className="fs-4 fw-semibold mb-4">{modeEdition ? 'Modifier le produit' : 'Nouveau produit'}</h1>
      <form onSubmit={onSubmit} className="carte-cci p-4">
        <div className="mb-4">
          <label className="form-label small fw-semibold">Type de produit</label>
          <div className="d-flex gap-2">
            <button type="button"
              className={`btn flex-fill ${!estNumerique ? 'btn-cci-primary' : 'btn-cci-outline'}`}
              onClick={() => setForm((f) => ({ ...f, type_produit: 'physique' }))}>
              📦 Produit physique
            </button>
            <button type="button"
              className={`btn flex-fill ${estNumerique ? 'btn-cci-primary' : 'btn-cci-outline'}`}
              onClick={() => setForm((f) => ({ ...f, type_produit: 'numerique' }))}>
              📄 Ebook / Formation
            </button>
          </div>
          <small className="text-muted d-block mt-1">
            {estNumerique
              ? 'Fichier téléchargeable (PDF, ZIP, vidéo...) — pas de stock ni de livraison physique.'
              : 'Article livré physiquement au client — stock et livraison suivis.'}
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Nom du produit</label>
          <input className="form-control" required value={form.nom} onChange={champ('nom')}
            placeholder={estNumerique ? 'Ex: Pack Formation Vendre sur WhatsApp' : 'Ex: Robe Ankara Élégance'} />
          {erreurs.nom && <small className="text-danger">{erreurs.nom[0]}</small>}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Description</label>
          <textarea className="form-control" rows={3} value={form.description} onChange={champ('description')} />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Catégorie</label>
          <select className="form-select" value={form.category_id} onChange={champ('category_id')}>
            <option value="">Aucune catégorie</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label small fw-semibold">Prix (XOF)</label>
            <input type="number" min="0" className="form-control" required value={form.prix} onChange={champ('prix')} />
          </div>
          <div className="col-6">
            <label className="form-label small fw-semibold">Prix promo (optionnel)</label>
            <input type="number" min="0" className="form-control" value={form.prix_promo} onChange={champ('prix_promo')} />
          </div>
        </div>

        {!estNumerique && (
          <div className="row g-3 mb-3 align-items-end">
            <div className="col-6">
              <label className="form-label small fw-semibold">Stock disponible</label>
              <input type="number" min="0" className="form-control" value={form.stock} onChange={champ('stock')} disabled={!form.suivi_stock} />
            </div>
            <div className="col-6 form-check ps-4">
              <input type="checkbox" className="form-check-input" id="suivi_stock" checked={form.suivi_stock} onChange={champ('suivi_stock')} />
              <label htmlFor="suivi_stock" className="form-check-label small">Suivre le stock</label>
            </div>
          </div>
        )}

        <div className="mb-3 form-check">
          <input type="checkbox" className="form-check-input" id="est_publie" checked={form.est_publie} onChange={champ('est_publie')} />
          <label htmlFor="est_publie" className="form-check-label small">Visible sur la boutique</label>
        </div>

        <div className="mb-4">
          <label className="form-label small fw-semibold">Photos / couverture (max 6)</label>
          <input type="file" accept="image/*" multiple className="form-control"
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 6))} />
        </div>

        {estNumerique ? (
          <div className="carte-cci p-3 mb-4" style={{ background: '#FBF6EE' }}>
            <label className="form-label small fw-semibold">Fichier du produit (PDF, ZIP, EPUB, vidéo — 500 Mo max)</label>
            <input type="file" accept=".pdf,.zip,.epub,.mp4" className="form-control mb-2"
              onChange={(e) => setFichierNumerique(e.target.files[0])} required={!modeEdition} />
            {fichierExistant && !fichierNumerique && (
              <small className="text-muted d-block mb-3">Fichier actuel : {fichierExistant} (laissez vide pour le conserver)</small>
            )}
            <label className="form-label small fw-semibold mt-2">Quand débloquer le téléchargement ?</label>
            <div className="d-flex gap-2">
              <button type="button" className={`btn btn-sm flex-fill ${form.livraison_numerique === 'immediat' ? 'btn-cci-primary' : 'btn-cci-outline'}`}
                onClick={() => setForm((f) => ({ ...f, livraison_numerique: 'immediat' }))}>
                ⚡ Immédiatement
              </button>
              <button type="button" className={`btn btn-sm flex-fill ${form.livraison_numerique === 'apres_confirmation' ? 'btn-cci-primary' : 'btn-cci-outline'}`}
                onClick={() => setForm((f) => ({ ...f, livraison_numerique: 'apres_confirmation' }))}>
                ✅ Après ma confirmation
              </button>
            </div>
            <small className="text-muted d-block mt-1">
              « Immédiatement » : le client reçoit le lien de téléchargement dès la commande.
              « Après ma confirmation » : vous devez d'abord confirmer la commande (utile si vous vérifiez le paiement manuellement).
            </small>
          </div>
        ) : (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label small fw-semibold mb-0">Variantes (taille, couleur...)</label>
              <button type="button" className="btn-cci-outline btn-sm" onClick={ajouterVariante}>+ Ajouter</button>
            </div>
            {variantes.map((v, i) => (
              <div className="row g-2 mb-2" key={i}>
                <div className="col-3"><input className="form-control form-control-sm" placeholder="Type (Taille)" value={v.nom} onChange={(e) => majVariante(i, 'nom', e.target.value)} /></div>
                <div className="col-3"><input className="form-control form-control-sm" placeholder="Valeur (XL)" value={v.valeur} onChange={(e) => majVariante(i, 'valeur', e.target.value)} /></div>
                <div className="col-3"><input type="number" className="form-control form-control-sm" placeholder="Supplément" value={v.supplement_prix} onChange={(e) => majVariante(i, 'supplement_prix', e.target.value)} /></div>
                <div className="col-2"><input type="number" className="form-control form-control-sm" placeholder="Stock" value={v.stock} onChange={(e) => majVariante(i, 'stock', e.target.value)} /></div>
                <div className="col-1"><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => supprimerVariante(i)}>×</button></div>
              </div>
            ))}
          </div>
        )}

        {/* Affiliation */}
        <div className="carte-cci p-3 mb-4" style={{ background: 'linear-gradient(180deg, #FFF, #FBF6EE)' }}>
          <div className="form-check mb-2">
            <input type="checkbox" className="form-check-input" id="autoriser_affiliation"
              checked={form.autoriser_affiliation} onChange={champ('autoriser_affiliation')} />
            <label htmlFor="autoriser_affiliation" className="form-check-label fw-semibold small">
              🔗 Autoriser des affiliés à promouvoir ce produit
            </label>
          </div>
          {form.autoriser_affiliation && (
            <div className="mt-2">
              <label className="form-label small fw-semibold">Commission affilié (% du prix payé par le client)</label>
              <input type="number" min="1" max="70" className="form-control" style={{ maxWidth: 140 }}
                value={form.taux_commission_affilie} onChange={champ('taux_commission_affilie')} />
              <small className="text-muted d-block mt-1">
                Ex : 30% sur une vente à 15 000 XOF = 4 500 XOF reversés à l'affilié qui a apporté le client.
              </small>
            </div>
          )}
        </div>

        <button className="btn-cci-primary w-100" disabled={envoi}>
          {envoi ? 'Enregistrement...' : modeEdition ? 'Mettre à jour' : 'Publier le produit'}
        </button>
      </form>
    </div>
  );
}
