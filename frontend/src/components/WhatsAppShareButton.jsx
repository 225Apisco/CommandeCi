/**
 * Bouton de partage WhatsApp — génère un message pré-rempli pour
 * partager un produit ou une commande vers WhatsApp (client ou vendeur).
 */
export default function WhatsAppShareButton({ numero, message, libelle = 'Partager sur WhatsApp', taille = 'normal' }) {
  const lienWhatsApp = () => {
    const texte = encodeURIComponent(message);
    const base = numero ? `https://wa.me/${numero.replace(/\D/g, '')}` : 'https://wa.me/';
    return `${base}?text=${texte}`;
  };

  return (
    <a
      href={lienWhatsApp()}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-whatsapp ${taille === 'sm' ? 'btn-sm' : ''}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.6 6.32A8.86 8.86 0 0 0 3.6 17.14L2 22l5-1.56A8.86 8.86 0 0 0 12 21.8a8.86 8.86 0 0 0 5.6-15.48ZM12 20.1a7.28 7.28 0 0 1-3.7-1l-.27-.16-2.98.93.95-2.85-.18-.29a7.3 7.3 0 1 1 6.18 3.37Zm4-5.46c-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11s-.57.72-.7.87-.26.17-.48.06a6 6 0 0 1-1.77-1.09 6.6 6.6 0 0 1-1.22-1.52c-.13-.22 0-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37a.4.4 0 0 0 0-.39c-.06-.11-.5-1.2-.68-1.65-.18-.43-.36-.37-.5-.38h-.43a.82.82 0 0 0-.6.28 2.5 2.5 0 0 0-.78 1.86 4.35 4.35 0 0 0 .91 2.3 9.96 9.96 0 0 0 3.82 3.38c1.9.82 1.9.55 2.24.51.35-.03 1.3-.53 1.48-1.04.18-.51.18-.94.13-1.04-.06-.1-.2-.15-.42-.26Z"/>
      </svg>
      {libelle}
    </a>
  );
}
