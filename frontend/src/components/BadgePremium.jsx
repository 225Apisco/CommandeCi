export default function BadgePremium({ actif }) {
  if (!actif) return null;
  return <span className="badge-premium">★ Premium</span>;
}
