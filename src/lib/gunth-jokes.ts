export const GUNTH_TITLES = [
  "GunthOS v1.0 — Veuillez ne pas éteindre votre ordinateur pendant la mise à jour",
  "GunthOS v1.0 — Certifié compatible Windows 95 et organismes vivants",
  "GunthOS v1.0 — Chargement en cours… (depuis 1998)",
  "GunthOS v1.0 — Optimisé pour une résolution de 800×600",
  "GunthOS v1.0 — Aucun virus détecté. Vraiment. Faites-nous confiance.",
  "GunthOS v1.0 — Votre connexion 56K suffit largement",
  "GunthOS v1.0 — Le seul OS qui redémarre de lui-même pour votre confort",
  "GunthOS v1.0 — Défragmentez votre disque dur avant de continuer",
  "GunthOS v1.0 — Compatible an 2000 (sous réserve)",
  "GunthOS v1.0 — Merci de ne pas claquer la souris sur le bureau",
  "GunthOS v1.0 — Erreur 404 : bonne humeur non trouvée. Veuillez réessayer.",
  "GunthOS v1.0 — Toute ressemblance avec Windows est purement intentionnelle",
  "GunthOS v1.0 — Nous ne sommes pas responsables des données perdues",
  "GunthOS v1.0 — Le registre a encore fait des siennes",
  "GunthOS v1.0 — Mise à jour de sécurité disponible (ne pas installer)",
  "GunthOS v1.0 — RAM insuffisante. Fermez le Solitaire et réessayez.",
  "GunthOS v1.0 — Ce site tourne sur un Pentium II overclocked dans un sous-sol",
  "GunthOS v1.0 — Pilote introuvable. Avez-vous inséré la disquette 4 sur 27 ?",
  "GunthOS v1.0 — Nous recommandons Internet Explorer 6 pour une expérience optimale",
  "GunthOS v1.0 — Sauvegarde automatique activée. En cours depuis 3h47.",
];

export const GUNTH_STATUS = [
  "💾 GunthOS v1.0 — 640 Ko de RAM libres. Fermez le Solitaire avant de continuer.",
  "💾 GunthOS v1.0 — Défragmentation en cours… 2% (temps restant : 6h)",
  "💾 GunthOS v1.0 — Aucun périphérique inconnu détecté. Pour l'instant.",
  "💾 GunthOS v1.0 — Sauvegarde automatique… terminée. Ou pas.",
  "💾 GunthOS v1.0 — Disque C:\\ presque plein. Supprimez des fichiers système.",
  "💾 GunthOS v1.0 — Mise à jour du pilote de souris : redémarrage dans 3, 2… jamais.",
  "💾 GunthOS v1.0 — Registre corrompu. Comme d'habitude.",
  "💾 GunthOS v1.0 — Mémoire virtuelle faible. Ouvrez quand même 12 onglets.",
  "💾 GunthOS v1.0 — Analyse antivirus : vous avez 47 virus. Bonne journée !",
  "💾 GunthOS v1.0 — Erreur générale de protection. Ignorée avec succès.",
];

export const GUNTH_SHUTDOWN_MESSAGES = [
  "GunthOS s'éteint…\n\nIl est maintenant sans danger d'allumer votre ordinateur.",
  "GunthOS s'éteint…\n\nVeuillez retirer la disquette du lecteur avant de partir.",
  "GunthOS s'éteint…\n\nN'oubliez pas de souffler dans la cartouche.",
  "GunthOS s'éteint…\n\nMerci d'avoir utilisé GunthOS. Nous espérons que vous avez sauvegardé.",
  "GunthOS s'éteint…\n\nErreur lors de l'arrêt. Arrêt quand même effectué.",
];

export const GUNTH_REBOOT_MESSAGES = [
  "GunthOS redémarre…\n\nVeuillez patienter pendant que nous prétendons réparer quelque chose.",
  "GunthOS redémarre…\n\nC'est souvent la solution à tous les problèmes.",
  "GunthOS redémarre…\n\nNe touchez à rien. Surtout pas à ça.",
  "GunthOS redémarre…\n\nApplication de 47 mises à jour critiques. (c'est un mensonge)",
  "GunthOS redémarre…\n\nDéfragmentation du cerveau en cours. Cela peut prendre un moment.",
];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
