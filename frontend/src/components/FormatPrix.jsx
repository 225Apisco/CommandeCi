export default function formatPrix(montant, devise = 'XOF') {
  const nombre = Number(montant || 0);
  return `${nombre.toLocaleString('fr-FR')} ${devise}`;
}
