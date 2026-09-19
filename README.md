# Quiz Forge

Application web de quiz construite avec React, TypeScript et Vite, dérivée d'[oliver-quiz](https://github.com/lom2gwada/oliver-quiz). Elle partage le même moteur de jeu (types de questions, filtres, tirage aléatoire, historique) mais se concentre sur la **génération automatique de quiz** à partir d'un tableau de données.

L'idée : au lieu d'écrire chaque question à la main, on charge un CSV (une ligne par entité, une colonne par attribut) et l'app en déduit un quiz complet — QCM directs et inversés, estimations numériques, classements, associations, QCM à réponses multiples.

## Fonctionnalités

- Génération de quiz **dans le navigateur** à partir d'un CSV : [`engine/src/utils/quizGenerator.ts`](engine/src/utils/quizGenerator.ts) (`parseCsv` → `inferSchema` → `generateQuiz`)
- Panneau de réglage avant génération (colonne « sujet », colonnes à ignorer, séparateur multivaleur, seed) : [`src/components/GeneratorPanel.tsx`](engine/src/components/GeneratorPanel.tsx)
- Sept types de questions jouables : QCM, texte libre, ordonnancement, vrai/faux, texte à trous, association, estimation numérique (`engine/src/components`)
- Filtrage des questions par catégorie (une par colonne du jeu de données) et par difficulté ; tirage aléatoire d'un nombre de questions choisi
- Import d'un quiz au format JSON, validé avant utilisation (`engine/src/utils/quizValidation.ts`)
- Historique des parties et profil (pseudo / avatar / thème) stockés localement (`localStorage`), sans backend
- Jeu de données embarqué : [`src/data/caribbean.csv`](src/data/caribbean.csv) (29 pays et territoires du bassin caribéen), généré à l'ouverture
- Questions visuelles : drapeaux (URLs Wikimedia) et **silhouettes** de territoires ([`src/data/shapes.ts`](src/data/shapes.ts), contours Natural Earth générés par [`scripts/build-shapes.mjs`](scripts/build-shapes.mjs))
- Sur chaque fiche, petite **carte de positionnement** dans les Caraïbes ([`src/data/region.ts`](src/data/region.ts), même source Natural Earth mais projection partagée entre tous les territoires, générée par [`scripts/build-region.mjs`](scripts/build-region.mjs)) ; les micro-territoires trop petits pour rester lisibles n'affichent qu'un point d'accent

## Architecture

Cette appli est un **jeu de données + des vues** posés sur le moteur commun [`quiz-engine`](https://github.com/lom2gwada/quiz-engine), inclus comme sous-module git dans `engine/` (génération de quiz, jeu, historique, classement, connexion, liens invités, édition admin, i18n…).

- `src/appConfig.ts` : identité de l'appli pour le moteur (préfixe de stockage `quiz-forge`, préfixe des tables Supabase `quiz_forge_`, libellés propres).
- `src/appSpec.tsx` : jeu de données embarqué, construction du `Dataset` (traductions, silhouettes, carte de la région, alias de réponses) et accès à la version en base.
- `engine/` : à ne modifier que pour ce qui doit changer dans **les deux** applis (voir son README).

Après un `git clone`, récupérer le moteur avec `git submodule update --init` (ou cloner avec `--recurse-submodules`). Le workflow de déploiement le fait déjà.

## Prérequis

- [Node.js](https://nodejs.org/) 18 ou plus récent

## Installation

```bash
npm install
```

Pas de variables d'environnement, pas de service externe : tout tourne dans le navigateur.

## Générer un quiz depuis un CSV

1. Ouvrir la page **⚙️ Quiz** → **Importer un CSV**.
2. L'app détecte pour chaque colonne : nombre ou texte, cardinalité (`unique`), séparateur multivaleur (`|`), colonne « année ». Elle choisit une colonne « sujet » (par en-tête ou première colonne texte) et exclut les colonnes URL.
3. Ajuster dans le panneau : colonne sujet, colonnes à activer/désactiver, séparateur multivaleur, nom d'un élément, seed.
4. **Générer le quiz** → jouer. Le bouton **🎲 Nouveau tirage** sur l'accueil régénère avec un nouveau seed.

Une cellule vide n'alimente aucune question ; les classements ne tirent qu'une ligne par valeur distincte (pas d'ex æquo). Le CSV pourra plus tard être remplacé par un appel à une base de données : `generateQuiz` prend des lignes (`Record<string,string>[]`), pas un fichier.

## Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Vérification des types puis build de production |
| `npm run preview` | Prévisualise le build de production en local |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:coverage` | Tests avec rapport de couverture |

## Format d'un quiz JSON

Un fichier de quiz importé doit respecter le contrat de [`engine/src/types/quiz.ts`](engine/src/types/quiz.ts), validé par [`parseQuiz`](engine/src/utils/quizValidation.ts) — c'est aussi la sortie de `generateQuiz`.

## Perspectives

- [`docs/architecture-packs.md`](docs/architecture-packs.md) — réflexion sur l'ouverture de quiz-forge à d'autres sujets (« packs ») : un moteur générique, un sujet = du contenu (données + schéma + config de génération + thème), avec ou sans base de données. Proposition, non implémentée.
- [`docs/i18n-plan.md`](docs/i18n-plan.md) — plan d'internationalisation (UI + formulations générées + données), locales ouvertes, français source de vérité. Validé, non implémenté.
