import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import formatPrix from '../../components/FormatPrix.jsx';
import { useAuth } from '../../context/AuthContext';
import WhatsAppShareButton from '../../components/WhatsAppShareButton.jsx';

export default function TableauDeBord() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [periode, setPeriode] = useState('30j');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    api.get('/tableau-de-bord', { params: { periode } })
      .then(({ data }) => setStats(data))
      .finally(() => setChargement(false));
  }, [periode]);

  const urlBoutique = `${window.location.origin}/b/${user.boutique.slug}`;
  const devise = user.boutique.devise;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="fs-4 fw-semibold mb-0">Tableau de bord</h1>
        <select className="form-select form-select-sm w-auto" value={periode} onChange={(e) => setPeriode(e.target.value)}>
          <option value="7j">7 derniers jours</option>
          <option value="30j">30 derniers jours</option>
          <option value="12m">12 derniers mois</option>
        </select>
      </div>

      {/* Lien boutique + partage */}
      <div className="carte-cci p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <div className="text-muted small">Votre boutique en ligne</div>
          <a href={urlBoutique} target="_blank" rel="noreferrer" className="font-mono">{urlBoutique}</a>
        </div>
        <WhatsAppShareButton
          taille="sm"
          message={`Découvrez ma boutique ${user.boutique.nom} 🛍️ : ${urlBoutique}`}
          libelle="Partager ma boutique"
        />
      </div>

      {chargement || !stats ? (
        <p className="text-muted">Chargement des statistiques...</p>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {[
              ['Chiffre d\'affaires', formatPrix(stats.chiffre_affaires, devise)],
              ['Commission CommandeCI', `${formatPrix(stats.commission_totale, devise)} (${stats.taux_commission_actuel}%)`],
              ['Reversé aux affiliés', formatPrix(stats.commission_affilies_totale, devise)],
              ['Commandes', stats.nombre_commandes],
              ['Panier moyen', formatPrix(stats.panier_moyen, devise)],
            ].map(([label, valeur]) => (
              <div className="col-6 col-md-3" key={label}>
                <div className="carte-cci p-3 h-100">
                  <div className="text-muted small mb-1">{label}</div>
                  <div className="fs-5 fw-bold font-mono">{valeur}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="carte-cci p-3 mb-4">
            <h2 className="fs-6 fw-semibold mb-3">Évolution des ventes livrées</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.ventes_par_jour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1E9D8" />
                <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatPrix(v, devise)} />
                <Line type="monotone" dataKey="total" stroke="#FF7A1A" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="carte-cci p-3 h-100">
                <h2 className="fs-6 fw-semibold mb-3">Produits populaires</h2>
                {stats.produits_populaires.length === 0 && <p className="text-muted small">Aucune vente pour l'instant.</p>}
                {stats.produits_populaires.map((p) => (
                  <div key={p.id} className="d-flex justify-content-between border-bottom py-2 small">
                    <span>{p.nom}</span>
                    <span className="font-mono text-muted">{p.nb_ventes} vendus</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <div className="carte-cci p-3 h-100">
                <h2 className="fs-6 fw-semibold mb-3">Répartition des commandes</h2>
                {Object.entries(stats.repartition_statuts).map(([statut, total]) => (
                  <div key={statut} className="d-flex justify-content-between border-bottom py-2 small text-capitalize">
                    <span>{statut}</span>
                    <span className="font-mono">{total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!user.boutique.plan || user.boutique.plan === 'standard' ? (
            <div className="carte-cci p-4 mt-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
              style={{ background: 'linear-gradient(90deg, #2C2A6B, #423FA0)', color: '#fff' }}>
              <div>
                <div className="badge-premium mb-2">Passer en Premium</div>
                <p className="mb-0">Faites mettre en avant votre boutique auprès de plus de clients — commission 2% au lieu de 1%.</p>
              </div>
              <Link to="/parametres" className="btn-cci-primary text-nowrap">En savoir plus</Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
