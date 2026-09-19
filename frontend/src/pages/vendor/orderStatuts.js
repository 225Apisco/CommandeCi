// Libellés des boutons d'action affichés selon le statut courant de la commande.
// Reflète App\Models\Order::TRANSITIONS côté backend.
export const Order_STATUTS = ['nouvelle', 'confirmee', 'preparation', 'expediee', 'livree', 'annulee'];

export const TRANSITIONS_AFFICHAGE = {
  nouvelle: [
    ['confirmee', 'Confirmer', 'btn-cci-primary'],
    ['annulee', 'Annuler', 'btn-outline-danger'],
  ],
  confirmee: [
    ['preparation', 'Mettre en préparation', 'btn-cci-primary'],
    ['annulee', 'Annuler', 'btn-outline-danger'],
  ],
  preparation: [
    ['expediee', 'Marquer comme expédiée', 'btn-cci-primary'],
    ['annulee', 'Annuler', 'btn-outline-danger'],
  ],
  expediee: [
    ['livree', 'Marquer comme livrée', 'btn-cci-primary'],
    ['annulee', 'Annuler', 'btn-outline-danger'],
  ],
  livree: [],
  annulee: [],
};
