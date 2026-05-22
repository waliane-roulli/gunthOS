import type { Tab } from "./types";

export const NOTIF_TEMPLATES = [
  { text: "Patrick Lemaire a consulté votre profil. Il n'a pas pris contact.", icon: "👀" },
  { text: "Jean-Kévin vous a envoyé un InMail sans vous lire", icon: "📧" },
  { text: "Votre post a eu 1 vue (c'était vous)", icon: "📊" },
  { text: "Quelqu'un a ignoré votre invitation depuis 3 semaines", icon: "🙃" },
  { text: "Thierry G. a partagé un article de 2019 en le 'découvrant aujourd'hui'", icon: "📰" },
  { text: "Rappel : votre profil est incomplet depuis 2021", icon: "⚠️" },
  { text: "Nadège Blondel a validé votre compétence 'Réunions debout'", icon: "👍" },
  { text: "Vous avez été mentionné dans un thread de 47 commentaires. C'était une erreur de mention.", icon: "🔔" },
  { text: "Bruno Disruptif a vu votre profil 3 fois ce matin", icon: "😰" },
  { text: "Félicitations ! Votre post a 0 commentaires mais 1 vue", icon: "🎊" },
  { text: "Karine R. veut vous ajouter à son réseau professionnel de 500+", icon: "🤝" },
  { text: "Thierry Consultant a validé 'Leadership Bienveillant'", icon: "✨" },
  { text: "Vous avez atteint le rang Inférieur à la Moyenne™", icon: "🏅" },
  { text: "Sandrine R. a vu votre profil. Elle cherchait quelqu'un d'autre.", icon: "👀" },
  { text: "Votre résumé professionnel a été lu 1,4 seconde en moyenne. C'est votre record.", icon: "📈" },
  { text: "Patrick L. a consulté votre profil 7 fois cette semaine. Pas de message.", icon: "😰" },
];

export const COMMENT_RESPONSES = [
  "Merci pour ce partage inspirant ! 🙏",
  "Tellement vrai. J'ai vécu exactement la même chose après ma reconversion.",
  "Je partage entièrement cette vision disruptive.",
  "Ça donne à réfléchir. Bravo pour le courage de le dire.",
  "Excellent contenu ! Je le partage avec mon réseau de 3 personnes.",
  "C'est exactement ce dont le monde professionnel a besoin.",
  "J'ai quitté mon CDI pour ça. Pas de regrets. 🚀",
  "Powerful. Just powerful.",
  "Vous avez résumé ce que je ressens depuis 5 ans en 3 lignes. Merci.",
  "Je valide à 100%. Mon coach m'a dit la même chose.",
  "+1 👆",
];

export const SHARE_TOASTS = [
  "Partagé avec vos 3 relations !",
  "Vos 3 abonnés seront ravis.",
  "Partagé ! (vu par personne)",
  "Republié pour maximiser le reach.",
  "3 personnes seront inspirées 🚀",
  "Algorithme LinkedGunth™ a réduit votre portée de 94%. Partagé quand même.",
  "Publication visible par vos 3 relations et le bot de Sandrine R.",
];

export const ENTHUSIASTIC_REPLIES = [
  `Bonjour Sandrine !

Merci beaucoup pour votre message, je suis absolument ravi(e) d'avoir retenu votre attention parmi les milliers de profils que vous avez cherchés sur LinkedGunth.

Le secteur de l'innovation innovante m'a toujours passionné(e), et l'idée de rejoindre une équipe de [NOMBRE] personnes dans un environnement dynamique me comble de joie.

Disponible cette semaine, la prochaine, ou n'importe quand tant que le café est gratuit.

Cordialement,
[PRÉNOM] ✨`,

  `Bonjour Sandrine,

Votre message a illuminé ma matinée comme un slide PowerPoint en Comic Sans.

Le poste de [POSTE] semble parfaitement aligné avec mes synergies disruptives et ma capacité à tenir debout en réunion.

Je suis disponible lundi en présentiel bien sûr.

À très vite,
[PRÉNOM] 🤝`,
];

export const INMAIL_TEMPLATES = [
  `Bonjour [PRÉNOM],

Je suis Sandrine, Talent Acquisition Manager chez une entreprise innovante du secteur de l'innovation innovante.

Votre profil a retenu mon attention (j'ai cherché "CDI Paris" sur LinkedGunth).

Nous recherchons un(e) [POSTE] passionné(e) pour rejoindre une équipe de [NOMBRE] personnes dans un environnement dynamique et start-up.

Package : selon profil
Télétravail : hybride (lundi en présentiel obligatoire)
Avantages : café gratuit, babyfoot

Êtes-vous disponible pour un échange de 30 minutes cette semaine ?

Cordialement,
Sandrine R.
🔗 linkedGunth : 500+ relations`,
  `Bonjour [PRÉNOM],

Je suis Marc, Head of Talent chez ScaleFast™ — une scale-up qui scale vite.

Votre parcours unique m'a frappé(e) de plein fouet. Nous construisons quelque chose de différent ici.

Mission : "Transformer la transformation digitale"
Stack : Agile, Lean, Kanban, Post-its
Avantages : Ping-pong, Kombucha, 1 journée de télétravail par mois si météo favorable

Êtes-vous "open to talk" ?

Sportivement,
Marc T.
🎯 Recruteur · 500+ relations · Top Voice 2023`,
];

export const AI_POST_SUGGESTIONS = [
  `J'ai tout quitté.
.
.
.
Pour créer quelque chose.
.
.
.
(Je cherche un CDI en urgence)`,
  `Il y a 3 ans, j'étais au fond du gouffre.
.
.
Aujourd'hui je gagne 2x moins mais je suis épanoui(e).
.
.
#entrepreneuriat #courage #quitterSonCDI`,
  `Ce matin j'ai refusé une offre à 80k.
.
.
Parce que l'ambiance ne matchait pas mes valeurs.
.
.
Certains comprendront. 🌱`,
  `La différence entre ceux qui réussissent et les autres ?
.
.
.
.
Les premiers se lèvent le matin.
.
.
🚀 RT si vous êtes d'accord`,
  `Mon manager m'a dit que j'étais trop passionné(e).
.
.
J'ai démissionné le jour même.
.
.
Meilleure décision de ma vie. (je cherche du travail)`,
  `5 leçons que j'aurais aimé apprendre à 20 ans :
.
1. Le réseau, c'est tout
2. Le réseau, c'est tout
3. Le réseau, c'est tout
4. Excel VLOOKUP
5. Le réseau, c'est tout`,
  `Mon manager a demandé un reporting.
.
.
J'ai créé 47 slides.
.
.
Il voulait un e-mail.
.
.
J'ai ajouté un slide de transition.`,
  `Hier j'ai couru 0 km.
.
.
Mentalement : un marathon.
.
.
#résilience #growth #leadership`,
];

export const SEARCH_RESULTS = [
  (q: string) => `Aucun résultat pour "${q}". Avez-vous essayé de networker ?`,
  (q: string) => `247 résultats pour "${q}" (tous inaccessibles sans Premium)`,
  (q: string) => `"${q}" n'existe pas sur linkedGunth. Essayez "synergies".`,
  (q: string) => `Recherche de "${q}"... Sandrine R. a vu cette recherche.`,
  (q: string) => `3 opportunités pour "${q}" expirées il y a 2 ans.`,
];

export const CONNECTION_REQUESTS = [
  { name: "Jean-Kévin M.", title: "CEO · Fondateur · Disrupteur", emoji: "🦁", mutual: 0 },
  { name: "Nadège B.", title: "Coach de vie · Speaker · Maman", emoji: "🌸", mutual: 2 },
  { name: "Thierry C.", title: "Consultant indépendant · Expert en expertises", emoji: "👔", mutual: 1 },
  { name: "Bruno D.", title: "Head of Head of Head of Things", emoji: "🧠", mutual: 0 },
  { name: "Sophie LB.", title: "Directrice de la Direction Directoriale", emoji: "💼", mutual: 3 },
  { name: "Dominique V.", title: "Directeur de la Transformation Numérique des Choses", emoji: "🤖", mutual: 0 },
  { name: "Marie-Laure D.", title: "Entrepreneuse · 3 pivots · Conférencière TEDx Lannion", emoji: "🌟", mutual: 1 },
] as const;

export const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "feed", icon: "🏠", label: "Accueil" },
  { id: "notifications", icon: "🔔", label: "Notifs" },
  { id: "messages", icon: "✉️", label: "Messages" },
  { id: "profil", icon: "👤", label: "Moi" },
];

export const SKILLS = [
  { name: "Pensée Disruptive", base: 47 },
  { name: "Synergies", base: 31 },
  { name: "Excel (VLOOKUP)", base: 89 },
  { name: "Leadership Bienveillant", base: 23 },
  { name: "Réunions debout", base: 12 },
  { name: "Agilité Mentale", base: 56 },
];

export const TITLEBAR_GRADIENT = {
  background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
  color: "var(--t-titlebar-text)",
} as const;

export const BOT_FAKE_COMPANIES = [
  "Synergy Corp", "Disruptive Solutions", "PivotTech", "BlueOcean SAS", "GreenLeap",
  "InnoVenture", "AgileForge", "NextLevel Group", "Catalyst Partners", "HorizonLab",
  "CoreValue Consulting", "ScaleUp Factory", "ImpactFirst", "VisionaryWorks", "LeapForward",
] as const;

export const BOT_FAKE_TITLES = [
  "Chief Everything Officer", "Head of Head of Things", "Directeur de la Direction",
  "VP Something Strategic", "Lead Evangelist", "Senior Disruptor", "Growth Manager",
  "Chief Happiness Officer", "Responsable de la Transformation", "Coach Agile Certifié",
  "Consultant Indépendant", "Product Owner Visionnaire", "Digital Transformer",
] as const;

export const ABSURD_TITLES = [
  "Chief Disruption Officer", "Head of Synergies", "VP of Post-its",
  "Directeur de la Transformation Transformatrice", "Ninja du Digital",
  "Guru de l'Agilité Bienveillante", "Manager de l'Innovation Innovante",
];

export const ABSURD_COMPANIES = [
  "StartupXYZ (pivot en cours)", "Société Anonyme de Consulting",
  "Cabinet Blabla & Associés", "L'Usine à Buzzwords SAS",
  "Disruption Corp", "AgileWave Solutions",
];

export const RELATIONSHIP_SUGGESTIONS = [
  "Collègue disruptif(ve)", "Manager bienveillant(e)", "Subordonné(e) agile",
  "Partenaire de réunions debout", "Mentor du pivot permanent",
];

export { LNK_POST_PUBLISH_TOASTS, LNK_AI_TOASTS, LNK_CONNECTION_TOASTS } from "@/lib/gunth-jokes";
