const LABELS = {
  nouvelle: 'Nouvelle',
  confirmee: 'Confirmée',
  preparation: 'En préparation',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
};

export default function BadgeStatutCommande({ statut }) {
  return <span className={`badge-statut ${statut}`}>{LABELS[statut] || statut}</span>;
}
