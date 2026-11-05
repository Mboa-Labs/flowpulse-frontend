import type { Role } from "./api";

/** Aide intégrée : pour chaque écran, à quoi il sert, quoi faire, comment lire ce qui s'affiche. */
export interface Aide {
  /** Une phrase sous le titre de l'écran */
  resume: string;
  /** Ce que l'on peut faire, dans l'ordre */
  etapes: string[];
  /** Comment lire les chiffres, couleurs et badges */
  lecture: string[];
}

export const AIDE: Record<string, Aide> = {
  "/dashboard": {
    resume: "Où la ville est sous tension maintenant, et où elle le sera dans l'heure.",
    etapes: [
      "Choisissez un moment à rejouer en haut de l'écran.",
      "Cliquez une zone sur la carte pour voir sa courbe.",
      "Si une zone sature, lancez une surveillance.",
    ],
    lecture: [
      "Indice sur 100 : 75 = dense, 85 = saturé.",
      "Courbe : trait plein = observé, pointillés = prévu.",
    ],
  },
  "/alertes": {
    resume: "Les zones qui saturent ou vont saturer, avec la marche à suivre.",
    etapes: [
      "Lancez une surveillance.",
      "Lisez le plan de contingence de chaque alerte.",
      "Acquittez (« j'ai vu ») ou transmettez (exploitant, police, mairie).",
    ],
    lecture: ["« Prévue dans l'heure » : pas encore saturée, mais le modèle prévoit qu'elle le sera."],
  },
  "/flotte": {
    resume: "Les renforts de bus proposés par l'IA : vous décidez.",
    etapes: [
      "Repérez les arrêts les plus remplis en haut du tableau.",
      "Lisez le verdict et les textes cités, puis appliquez ou rejetez (motif obligatoire).",
    ],
    lecture: [
      "Remplissage au-delà de 100 % : des usagers restent à quai.",
      "« Aucun texte applicable » : à vous de décider ; le vide est noté dans les manques.",
    ],
  },
  "/simulation": {
    resume: "Tester un événement ou des travaux avant qu'ils aient lieu, sans rien appliquer.",
    etapes: [
      "Choisissez le type, la zone et les heures, puis lancez.",
      "Comparez les cartes Avant / Après et le tableau par zone.",
    ],
    lecture: ["Charge au-delà de 100 % : des files d'attente se forment."],
  },
  "/manques": {
    resume: "Les situations qu'aucun texte ne couvre clairement : à signaler aux autorités.",
    etapes: ["Parcourez la liste et servez-vous en pour proposer une évolution des textes."],
    lecture: ["Un manque n'est pas une erreur : c'est un vide juridique repéré automatiquement."],
  },
  "/assistant": {
    resume: "Posez une question en français : l'IA répond en citant ses sources.",
    etapes: [
      "Choisissez une question proposée ou écrivez la vôtre.",
      "Vérifiez les sources et le raisonnement.",
    ],
    lecture: ["Sans source citée, la réponse est une piste, pas une règle."],
  },
  "/connaissances": {
    resume: "Les textes de loi que l'IA connaît et cite.",
    etapes: ["Filtrez par titre, pays ou domaine.", "Administrateur : réindexez après l'ajout de textes."],
    lecture: ["Passages : morceaux de texte que l'IA peut citer. « — » : texte pas encore utilisable."],
  },
  "/admin": {
    resume: "Créer les comptes de l'équipe et leur rôle.",
    etapes: ["Remplissez le formulaire et créez le compte.", "Pour retirer un accès, désactivez le compte."],
    lecture: ["Gestionnaire : ville et alertes. Opérateur : bus. Urbaniste : simulations et textes. Administrateur : tout."],
  },
  "/journal": {
    resume: "Qui a fait quoi, et quand.",
    etapes: ["Parcourez les entrées ou exportez-les en CSV."],
    lecture: ["Objet : ce qui a été touché. Détails : le motif ou le contenu de l'action."],
  },
};

/** Parcours conseillé à la première connexion, selon le rôle. */
export const PARCOURS: Record<Role, { titre: string; etapes: { texte: string; lien: string }[] }> = {
  GESTIONNAIRE: {
    titre: "Surveiller la ville et réagir avant les bouchons.",
    etapes: [
      { texte: "Voir l'état de la ville", lien: "/dashboard" },
      { texte: "Traiter les alertes", lien: "/alertes" },
      { texte: "Poser une question au superviseur IA", lien: "/assistant" },
    ],
  },
  OPERATEUR: {
    titre: "Décider des renforts de bus proposés par l'IA.",
    etapes: [
      { texte: "Voir les renforts proposés", lien: "/flotte" },
      { texte: "Consulter les alertes en cours", lien: "/alertes" },
      { texte: "Poser une question au superviseur IA", lien: "/assistant" },
    ],
  },
  URBANISTE: {
    titre: "Anticiper événements et travaux, repérer les vides juridiques.",
    etapes: [
      { texte: "Simuler un événement", lien: "/simulation" },
      { texte: "Lire les manques réglementaires", lien: "/manques" },
      { texte: "Consulter les textes de loi", lien: "/connaissances" },
    ],
  },
  ADMIN: {
    titre: "Vous avez accès à tout.",
    etapes: [
      { texte: "Créer les comptes de l'équipe", lien: "/admin" },
      { texte: "Voir l'état de la ville", lien: "/dashboard" },
      { texte: "Lancer une surveillance", lien: "/alertes" },
      { texte: "Suivre qui fait quoi dans le journal", lien: "/journal" },
    ],
  },
};
