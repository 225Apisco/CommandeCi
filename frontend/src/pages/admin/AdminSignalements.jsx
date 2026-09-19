import { useEffect, useState } from 'react';
import api from '../../services/api';

const LABELS = { ouvert: 'Ouvert', en_cours: 'En cours', resolu: 'Résolu', rejete: 'Rejeté' };

export default function AdminSignalements() {
  const [signalements, setSignalements] = useState([]);
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    setChargement(true);
    api.get('/admin/signalements').then(({ data }) => setSignalements(data.data)).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const traiter = async (id, statut) => {
    await api.put(`/admin/signalements/${id}`, { statut });
    charger();
  };

  return (
    <div>
      <h1 className="fs-4 fw-semibold mb-3">Signalements</h1>

      {chargement ? (
        <p className="text-muted">Chargement...</p>
      ) : signalements.length === 0 ? (
        <div className="carte-cci p-5 text-center text-muted">Aucun signalement en attente. 🎉</div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {signalements.map((s) => (
            <div key={s.id} className="carte-cci p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="fw-semibold">{s.boutique?.nom}</div>
                  <div className="text-muted small">Raison : {s.raison}</div>
                </div>
                <span className="badge-statut nouvelle">{LABELS[s.statut]}</span>
              </div>
              {s.details && <p className="small text-muted mb-2">{s.details}</p>}
              {s.statut === 'ouvert' || s.statut === 'en_cours' ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-cci-outline" onClick={() => traiter(s.id, 'en_cours')}>Marquer en cours</button>
                  <button className="btn btn-sm btn-cci-primary" onClick={() => traiter(s.id, 'resolu')}>Résoudre</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => traiter(s.id, 'rejete')}>Rejeter</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
