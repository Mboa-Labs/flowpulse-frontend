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
    resume: "L'état de la ville à l'instant choisi : où ça bouchonne maintenant, où ça va saturer dans l'heure.",
    etapes: [
      "Choisissez un moment à rejouer en haut (par exemple « Mardi ordinaire, pointe du soir »). Tout l'écran se met à jour.",
      "Regardez la carte : plus une zone est foncée, plus elle est sous tension. Cliquez sur une zone pour voir sa courbe.",
      "Lisez la courbe : le trait plein montre les dernières heures, les pointillés la prévision pour les 2 heures à venir.",
      "Si une zone sature ou va saturer, lancez une surveillance : FlowPulse crée les alertes et propose des bus.",
    ],
    lecture: [
      "Indice de tension (0 à 100) : l'activité de la zone comparée à son niveau haut habituel. 75 = dense, 85 = saturé.",
      "« Dans 1 h », « Dans 2 h » : ce que le modèle de prévision attend pour la zone.",
      "Pastilles : vert = fluide, orange = dense, rouge = saturé.",
    ],
  },
  "/alertes": {
    resume: "Les zones qui saturent ou vont saturer, avec la marche à suivre.",
    etapes: [
      "Cliquez sur « Lancer une surveillance » : FlowPulse analyse chaque zone à l'instant rejoué.",
      "Pour chaque alerte, lisez le plan de contingence : ce sont les actions conseillées, dans l'ordre.",
      "« Acquitter » signifie « j'ai vu cette alerte ». « Transmettre » l'envoie à l'exploitant, à la police ou à la mairie.",
      "Si un renfort de bus est proposé, l'opérateur le valide ou le refuse dans l'écran Flotte.",
    ],
    lecture: [
      "« Saturé » : l'indice atteint 85 ou plus. « Dense » : 75 ou plus.",
      "« Prévue dans l'heure » : la zone n'est pas encore saturée, mais le modèle prévoit qu'elle le sera. C'est le moment d'agir.",
      "« Voir le raisonnement » montre chaque étape suivie par l'IA, pour vérifier comment elle a conclu.",
    ],
  },
  "/flotte": {
    resume: "Les renforts de bus proposés par l'IA : c'est vous qui décidez de les appliquer.",
    etapes: [
      "Regardez d'abord le tableau des arrêts : les plus chargés sont en haut.",
      "Pour chaque recommandation, lisez le verdict de conformité et les textes cités.",
      "Cliquez sur « Appliquer » si le renfort est possible. Sinon, écrivez la raison (bus en panne, chauffeur absent…) puis « Rejeter ».",
      "Toutes vos décisions sont enregistrées, avec votre nom et la raison du refus.",
    ],
    lecture: [
      "Tension d'un arrêt : personnes qui arrivent par heure, rapportées aux places offertes. Au-delà de 100 %, des usagers restent à quai.",
      "Verdict : « Conforme » (un texte l'autorise), « Conforme sous réserve » (à certaines conditions), « Non conforme » (bloqué), « Aucun texte applicable » (à décider vous-même : ce vide est noté dans les manques réglementaires).",
      "Les étiquettes grises (ex. « Loi n° 2010/013 · Article 12 ») sont les textes sur lesquels l'IA s'appuie. Passez la souris dessus pour lire l'extrait.",
    ],
  },
  "/simulation": {
    resume: "Tester un événement ou des travaux avant qu'ils aient lieu, sans rien changer dans la réalité.",
    etapes: [
      "Choisissez un type : fermeture d'un axe (travaux), événement (match, marché, cérémonie) ou renfort de bus.",
      "Choisissez la zone et les heures, puis « Lancer la simulation ».",
      "Comparez les deux cartes « Avant » et « Après », puis le tableau zone par zone.",
      "Lisez les mesures conseillées et leur verdict réglementaire avant de décider.",
    ],
    lecture: [
      "Charge d'une zone : la demande rapportée à sa capacité. Au-delà de 100 %, des files d'attente se forment.",
      "Temps de parcours : de combien les trajets s'allongent (en %) sur l'ensemble des zones.",
      "C'est un bac à sable : aucune alerte ni recommandation réelle n'est créée.",
    ],
  },
  "/manques": {
    resume: "Les situations qu'aucun texte de loi ne couvre clairement : à signaler aux autorités.",
    etapes: [
      "Parcourez la liste : chaque ligne est une décision pour laquelle l'IA n'a trouvé aucun texte applicable.",
      "Utilisez cette liste pour proposer une évolution des textes ou une décision à la Communauté urbaine.",
    ],
    lecture: [
      "Un manque n'est pas une erreur : c'est un vide juridique repéré automatiquement, pour que la décision reste humaine.",
    ],
  },
  "/assistant": {
    resume: "Posez une question en français : l'IA consulte les données de trafic, la flotte et les lois, puis répond en citant ses sources.",
    etapes: [
      "Cliquez sur une question proposée ou écrivez la vôtre (par exemple « Quelle zone est la plus saturée en ce moment ? »).",
      "Attendez la réponse : 30 secondes à 1 minute, le temps que l'IA consulte les données et les textes.",
      "Lisez les sources citées et « Voir le raisonnement » pour vérifier comment elle a conclu.",
      "Si elle propose des bus, la proposition apparaît dans Flotte : rien n'est appliqué sans un opérateur.",
    ],
    lecture: [
      "Outils utilisés : les données que l'IA a consultées (trafic, flotte, textes de loi).",
      "Sans source citée, prenez la réponse comme une piste, pas comme une règle.",
    ],
  },
  "/connaissances": {
    resume: "Les textes de loi que l'IA connaît et cite : ce qu'elle ne trouve pas ici, elle ne l'invente pas.",
    etapes: [
      "Filtrez par titre, pays ou domaine pour retrouver un texte.",
      "Un texte avec « — » passages n'est pas encore utilisable par l'IA (PDF scanné à numériser, ou texte à collecter).",
      "Administrateur : après l'ajout de textes, cliquez sur « Réindexer les textes ».",
    ],
    lecture: [
      "Passages : morceaux de texte que l'IA peut retrouver et citer. Plus il y en a, mieux le texte est couvert.",
      "Statut : « À collecter » (manquant), « Collecté » (fichier présent), « Vérifié » (contrôlé par l'équipe), « Exclu » (volontairement écarté).",
    ],
  },
  "/admin": {
    resume: "Créer les comptes de l'équipe et choisir ce que chacun peut faire.",
    etapes: [
      "Remplissez nom, email, mot de passe provisoire et rôle, puis créez le compte.",
      "Transmettez le mot de passe à la personne de façon sûre.",
      "Pour retirer un accès, désactivez le compte : il n'est pas supprimé et son historique reste dans le journal.",
    ],
    lecture: [
      "Gestionnaire : surveille la ville et les alertes. Opérateur : décide des renforts de bus. Urbaniste : simulations et textes. Administrateur : tout.",
    ],
  },
  "/journal": {
    resume: "Qui a fait quoi, et quand : chaque connexion, décision, alerte et simulation est enregistrée.",
    etapes: [
      "Parcourez les entrées, des plus récentes aux plus anciennes.",
      "« Exporter en CSV » pour ouvrir le journal dans Excel ou le joindre à un rapport.",
    ],
    lecture: [
      "Objet : ce qui a été touché (une alerte, une recommandation, un compte). Détails : le motif ou le contenu de l'action.",
    ],
  },
};

/** Parcours conseillé à la première connexion, selon le rôle. */
export const PARCOURS: Record<Role, { titre: string; etapes: { texte: string; lien: string }[] }> = {
  GESTIONNAIRE: {
    titre: "Votre rôle : surveiller la ville et réagir avant les bouchons.",
    etapes: [
      { texte: "Regarder l'état de la ville et choisir un moment à rejouer", lien: "/dashboard" },
      { texte: "Lancer une surveillance et traiter les alertes", lien: "/alertes" },
      { texte: "Poser une question au superviseur IA", lien: "/assistant" },
    ],
  },
  OPERATEUR: {
    titre: "Votre rôle : décider des renforts de bus proposés par l'IA.",
    etapes: [
      { texte: "Voir les arrêts chargés et les renforts proposés", lien: "/flotte" },
      { texte: "Consulter les alertes en cours", lien: "/alertes" },
      { texte: "Poser une question au superviseur IA", lien: "/assistant" },
    ],
  },
  URBANISTE: {
    titre: "Votre rôle : anticiper les événements et les travaux, et repérer les vides juridiques.",
    etapes: [
      { texte: "Simuler une fermeture de route ou un événement", lien: "/simulation" },
      { texte: "Lire les manques réglementaires", lien: "/manques" },
      { texte: "Consulter les textes de loi que l'IA utilise", lien: "/connaissances" },
    ],
  },
  ADMIN: {
    titre: "Vous avez accès à tout. Commencez par l'essentiel :",
    etapes: [
      { texte: "Créer les comptes de l'équipe", lien: "/admin" },
      { texte: "Voir l'état de la ville", lien: "/dashboard" },
      { texte: "Lancer une surveillance", lien: "/alertes" },
      { texte: "Suivre qui fait quoi dans le journal", lien: "/journal" },
    ],
  },
};
