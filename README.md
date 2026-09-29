# SimpleTrad

**SimpleTrad** traduit visuellement le front-end d'un site WordPress
directement dans le navigateur du visiteur — sans jamais dupliquer une seule
page, un seul article ou un seul contenu WordPress.

> Auteur : **Maxev**

## Philosophie

SimpleTrad fait une seule chose, et la fait bien : traduire le contenu
*visible* d'une page pendant son affichage, côté navigateur. Ce n'est **pas**
un plugin multilingue classique (WPML, Polylang, Weglot, ConveyThis…) :

- aucune page, article, CPT, taxonomie ou média n'est dupliqué ;
- aucune traduction n'est enregistrée en base de données, dans une table
  personnalisée, un post meta, une option, `localStorage`, `sessionStorage` ou
  un cookie ;
- la base WordPress reste toujours dans sa langue d'origine ;
- la langue choisie est simplement propagée via un paramètre d'URL léger
  (`?lang=xx`), sans générer de contenu indexable ni de structure SEO
  multilingue.

## Fonctionnement en un coup d'œil

```
Site original (WordPress, langue source)
        ↓
HTML original envoyé au navigateur
        ↓
SimpleTrad (JS front, léger, sans framework)
        ↓
Traduction visuelle dans le DOM du visiteur
```

1. Vous installez SimpleTrad.
2. Vous choisissez la langue originale du site.
3. Vous ajoutez les langues proposées (English, Español, Italiano…).
4. Vous placez le shortcode `[simpletrad]` où vous voulez (Elementor, éditeur
   de blocs, widget…).
5. Le visiteur clique sur une langue.
6. La page se traduit, dans son navigateur, sans recharger et sans qu'aucun
   contenu WordPress ne soit modifié.

## Installation

1. Téléchargez le ZIP de production (`simpletrad.zip`, voir [Build](#build-de-production)).
2. Dans WordPress : **Extensions → Ajouter → Téléverser une extension**.
3. Activez SimpleTrad.
4. Allez dans le nouveau menu **SimpleTrad** de l'administration.

## Réglages (une seule page)

- **Langue originale** : la langue réelle du contenu WordPress.
- **Langues proposées** : recherche par nom français, nom natif ou code
  ISO/BCP 47 (`FormTokenField` natif WordPress) — aucune limite artificielle
  de nombre de langues.
- **Switcher** : détection automatique de la langue du navigateur, affichage
  (nom / code / drapeau) et orientation (horizontal / vertical).
- **CSS personnalisé** : éditeur CSS avec aperçu en direct (voir plus bas).
- **Exclusions** : sélecteurs CSS additionnels à ne jamais traduire.
- **Termes protégés** : marques, noms propres ou expressions jamais
  traduits (voir plus bas).

Tout est stocké dans une unique option WordPress structurée
(`simpletrad_settings`). **Aucune traduction n'est jamais stockée** — voir
[Confidentialité et stockage](#confidentialité-et-stockage-des-données).

## Le shortcode `[simpletrad]`

```
[simpletrad]
[simpletrad display="name"]
[simpletrad display="code"]
[simpletrad display="flag_name"]
[simpletrad display="flag"]
[simpletrad layout="horizontal"]
[simpletrad layout="dropdown"]
```

Les attributs sont optionnels ; sans eux, les réglages globaux de
l'administration s'appliquent.

## Classes CSS disponibles

Le switcher utilise une nomenclature CSS stable, pensée pour être personnalisée
depuis un thème enfant, Elementor ou les CSS additionnels de WordPress :

```css
.simpletrad-switcher            /* conteneur du switcher */
.simpletrad-switcher.is-layout-horizontal
.simpletrad-switcher.is-layout-dropdown
.simpletrad-language            /* un bouton de langue */
.simpletrad-language-label      /* le nom affiché */
.simpletrad-language-code       /* le code affiché (mode "code") */
.simpletrad-language-flag       /* le drapeau (mode "flag"/"flag_name") */
.simpletrad-language.is-active  /* langue actuellement affichée */
.simpletrad-language.is-loading /* traduction/téléchargement en cours */
```

Exemple minimal :

```css
.simpletrad-switcher { display: flex; gap: 0.5em; }
.simpletrad-language.is-active { font-weight: bold; }
.simpletrad-language.is-loading { opacity: 0.6; }
```

Cette référence, avec un bouton « Copier », est aussi disponible directement
dans l'écran de réglages de SimpleTrad.

## CSS personnalisé du switcher

En plus de la référence de classes ci-dessus, l'administration propose un
véritable éditeur CSS (« CSS personnalisé du switcher ») : ce que vous y
écrivez est appliqué **immédiatement** à l'aperçu du switcher affiché juste
au-dessus, sans avoir besoin d'enregistrer — l'aperçu réutilise exactement
les mêmes classes HTML que le switcher réellement affiché sur le site, il
n'existe aucun second système de style dédié à la prévisualisation.

```css
.simpletrad-switcher {
	background: #111;
	padding: 5px;
	border-radius: 30px;
}

.simpletrad-language {
	color: #fff;
}

.simpletrad-language.is-active {
	background: #fff;
	color: #111;
}
```

Une fois enregistré, ce CSS est chargé sur le front via
`wp_add_inline_style()` — uniquement sur les pages où `[simpletrad]` est
réellement affiché, jamais globalement. Un bouton « Réinitialiser le CSS »
(avec confirmation) permet de vider uniquement ce champ, sans toucher aux
autres réglages.

## Termes protégés

Certains mots ne doivent jamais être traduits : noms de marque, noms
propres, enseignes… La section « Termes protégés » de l'administration
permet d'en déclarer une liste (`FormTokenField`, sans limite) :

```
Maxev, SimpleTrad, Hôtel Martinez, Jean Dupont, Côte d'Azur
```

Contrairement aux exclusions CSS (qui ignorent un élément HTML entier), un
terme protégé ne shunte qu'une portion précise de texte : dans « Bienvenue
chez Maxev à Cannes », le reste de la phrase continue d'être traduit
normalement, seul « Maxev » ressort inchangé.

Techniquement, chaque terme est remplacé par un placeholder unique avant
l'envoi au moteur de traduction, puis restauré après coup — en utilisant
la **casse exacte réellement présente dans le DOM** à cet endroit (pas
forcément celle saisie dans les réglages), afin que le rendu final reste
cohérent avec le reste de la phrase.

## Conservation de la casse (majuscules)

Les moteurs de traduction normalisent parfois la casse (« Découvrir nos
chambres » traduit en « discover our rooms » au lieu de « Discover our
rooms »). SimpleTrad corrige ce point après traduction, à partir d'un motif
détecté sur le texte source :

| Texte source | Motif détecté | Effet sur la traduction |
| --- | --- | --- |
| `Bonjour` | première lettre majuscule | force la première lettre de la traduction en majuscule |
| `BIENVENUE` / `RÉSERVER MAINTENANT` | tout en majuscules | force toute la traduction en majuscules |
| `contact` | tout en minuscules | aucune majuscule n'est ajoutée artificiellement |
| `iPhone`, `eCommerce` | casse mixte (mot-marque) | traduction laissée telle quelle, jamais forcée |

Volontairement, SimpleTrad ne reproduit **jamais** la casse mot par mot
(« Découvrez Notre Hôtel » ne force pas une majuscule sur chaque mot
traduit) : cela casserait des mots à casse intentionnelle comme `iPhone` ou
`eCommerce`. Cette correction s'applique après restauration des termes
protégés, au-dessus de l'abstraction `TranslationEngine` — elle fonctionne
donc de la même façon quel que soit le moteur réellement utilisé.

## Exclure du contenu de la traduction

Trois mécanismes, cumulables :

1. La classe standard `.simpletrad-no-translate` (et tous ses enfants).
2. L'attribut HTML standard `translate="no"`.
3. Les sélecteurs CSS additionnels déclarés dans les réglages (« Sélecteurs
   CSS à ne jamais traduire »).

## Le paramètre `?lang=`

- `?lang=xx` explicite dans l'URL est toujours prioritaire.
- Sinon, si la détection automatique est activée, la première langue du
  navigateur (`navigator.languages` puis `navigator.language`) qui correspond
  à une langue activée est utilisée.
- Sinon, la langue originale du site reste affichée.

SimpleTrad propage automatiquement `?lang=` sur les liens internes pertinents
et le retire proprement en cas de retour à la langue d'origine, **en
préservant les autres paramètres de requête existants**. Ne sont jamais
modifiés : liens externes, `mailto:`, `tel:`, `javascript:`, ancres pures
(`#section`), URLs `/wp-admin/`, `/wp-login.php`, `/wp-json/`, liens de
déconnexion (`action=logout`) et fichiers téléchargeables.

## Moteurs de traduction

Voir [AUDIT.md](AUDIT.md) pour l'audit technique complet (spécifications,
navigateurs testés, licences).

| Moteur | Statut | Navigateurs |
| --- | --- | --- |
| **Translator API native** (`NativeBrowserTranslator`) | Pleinement fonctionnel | Chrome/Chromium desktop ≥ 138, contexte HTTPS |
| **Fallback WebAssembly auto-hébergé** (`WasmTranslationFallback`) | Interface fonctionnelle, aucun modèle embarqué par défaut | Dépend du moteur auto-hébergé par l'administrateur (voir ci-dessous) |

SimpleTrad ne bundle **aucun** modèle de traduction ni moteur WASM par
défaut : les modèles de qualité suffisante pèsent plusieurs dizaines de Mo par
paire de langues, ce qui serait incompatible avec l'exigence de légèreté du
plugin, et leur emplacement de distribution officiel a évolué depuis
l'archivage de `mozilla/firefox-translations-models` (voir AUDIT.md). Si le
moteur natif n'est pas disponible dans le navigateur du visiteur, SimpleTrad
laisse simplement le contenu original affiché — jamais de page cassée, jamais
de traduction simulée.

Pour activer le fallback, un administrateur peut renseigner, dans les
réglages avancés (`fallback_models_url`), l'URL d'un service auto-hébergé
respectant ce protocole minimal :

```
GET  {url}/manifest.json  →  { "worker": "worker.js", "pairs": ["fr-en", "fr-es"] }
new Worker({url}/{manifest.worker})
   postMessage({ type: 'translate', id, sourceLanguage, targetLanguage, texts })
   → onmessage { type: 'result'|'error', id, texts?, error? }
```

## Confidentialité et stockage des données

- Aucune traduction n'est stockée : ni en base WordPress, ni en post meta, ni
  en option, ni en `localStorage`/`sessionStorage`, ni en cookie.
- Les textes traduits n'existent que dans le DOM, pendant l'affichage de la
  page.
- Le seul stockage persistant est l'option `simpletrad_settings`
  (configuration du plugin), supprimée proprement à la désinstallation.
- Le cache éventuel des modèles par le navigateur (Translator API native) est
  un cache technique du navigateur lui-même, pas une base de traductions
  gérée par SimpleTrad.

## Accessibilité

- Le switcher est composé de vrais éléments `<button>`.
- Navigation clavier native, focus visible (`:focus-visible`).
- État actif signalé par `aria-pressed` (pas uniquement par la couleur).
- `aria-label` sur le groupe de boutons.

## Développement

### Prérequis

- Node.js ≥ 18, npm.
- WordPress ≥ 6.4, PHP ≥ 7.4.

### Installation des dépendances

```bash
npm install
```

### Build de développement (watch)

```bash
npm start
```

### Build de production

```bash
npm run build
```

Génère `build/admin.js`, `build/frontend.js` et leurs CSS associés.

### Créer le ZIP installable

```bash
npm run plugin-zip
```

### Qualité de code

```bash
npm run lint:js     # ESLint (config @wordpress/eslint-plugin)
npm run lint:css    # Stylelint (config @wordpress/stylelint-config)
npm run test:unit   # Jest (jsdom) sur les modules de traduction front-end
```

Les 55 tests unitaires couvrent notamment : normalisation des locales,
détection de la langue navigateur, éligibilité des liens pour `?lang=`,
préservation des autres paramètres de requête, collecte des nœuds texte via
`TreeWalker`, exclusions (`.simpletrad-no-translate`, `translate="no"`,
sélecteurs admin), non-chaînage des traductions (toujours langue source →
langue cible, jamais FR → EN → ES), protection des termes (placeholders,
occurrences multiples, imbrication, casse restaurée depuis le DOM) et
conservation de la casse (majuscules, première lettre, mots à casse mixte
comme `iPhone`/`eCommerce` jamais forcés).

### Structure du projet

```
simpletrad/
├── simpletrad.php              Bootstrap du plugin
├── uninstall.php                Nettoyage complet à la désinstallation
├── includes/                    Logique PHP (réglages, REST, assets, shortcode, updater)
├── src/
│   ├── admin/                   Écran de réglages React (@wordpress/element + @wordpress/components)
│   └── frontend/                Moteur de traduction + switcher (vanilla JS, sans framework)
├── build/                       Généré par `npm run build` (jamais versionné)
├── languages/simpletrad.pot     Modèle de traduction du plugin lui-même
└── AUDIT.md                     Audit technique des moteurs de traduction
```

## Navigateurs testés (au moment de la rédaction)

| Navigateur | Switcher & DOM (TreeWalker/MutationObserver) | Moteur natif Translator API |
| --- | --- | --- |
| Chrome/Chromium desktop ≥ 138 | ✅ | ✅ |
| Chrome Android | ✅ (switcher) | ❌ (non supporté par le navigateur) |
| Firefox desktop/Android | ✅ (switcher) | ❌ (API non implémentée) |
| Safari desktop/iOS | ✅ (switcher) | ❌ (API non implémentée) |
| Edge | ✅ (switcher) | ❌ (API non implémentée) |

Le switcher, la propagation `?lang=`, la détection de langue navigateur, les
exclusions et le `MutationObserver` reposent sur des API DOM standard
supportées par tous ces navigateurs. Seule la traduction elle-même dépend de
la disponibilité de la Translator API (ou d'un fallback auto-hébergé) dans le
navigateur du visiteur.

## Limitations connues

- La traduction réelle du contenu dépend du navigateur du visiteur : sans
  Chrome/Chromium ≥ 138 (ou un fallback auto-hébergé configuré), le switcher
  reste visible mais le contenu original est conservé.
- Aucun modèle WASM n'est fourni par défaut (voir [AUDIT.md](AUDIT.md)).
- Pas de SEO multilingue, pas de pages traduites indexables, pas de
  `hreflang` : ce n'est pas l'objectif du plugin.
- Pas d'éditeur manuel de traductions, pas de traduction du back-office, pas
  de gestion par rôle : hors scope de la v1.

## Intégration continue et mises à jour automatiques

SimpleTrad utilise **GitHub Actions** pour deux besoins bien séparés :

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — s'exécute à chaque
  `push`/`pull request` sur `main` : lint PHP, lint JS/CSS, tests unitaires
  Jest et build de production. Sert de garde-fou avant toute release.
- [`.github/workflows/release.yml`](.github/workflows/release.yml) — s'exécute
  uniquement quand un tag `vX.Y.Z` est poussé : rejoue les mêmes
  vérifications puis génère le ZIP de production et l'attache automatiquement
  à une Release GitHub.

Ces workflows tournent sur l'infrastructure de GitHub et ne peuvent se
déclencher qu'une fois le code déjà présent sur GitHub — ils ne remplacent
donc pas le premier `git push` depuis votre machine, qui reste une étape
manuelle unique (authentification oblige).

Le plugin embarque en complément un vérificateur de mises à jour basé sur les
*releases* publiques GitHub (`includes/class-updater.php`), entièrement isolé
du reste du plugin :

- aucune clé ni jeton personnel n'est embarqué dans le code ;
- seule l'API publique `https://api.github.com/repos/<owner>/<repo>/releases/latest`
  est interrogée (résultat mis en cache 6h) ;
- le dépôt cible est filtrable via `add_filter( 'simpletrad_github_repo', fn () => 'owner/repo' )`.

### Publier une nouvelle version

1. Mettre à jour `Version:` dans `simpletrad.php`, `SIMPLETRAD_VERSION`, et le
   [CHANGELOG.md](CHANGELOG.md).
2. Committer, pousser sur `main` (la CI se déclenche et doit passer au vert).
3. Créer et pousser un tag `vX.Y.Z` :
   `git tag vX.Y.Z && git push origin vX.Y.Z`
4. Le workflow `release.yml` construit le ZIP et publie automatiquement la
   Release GitHub correspondante — c'est cet asset que l'updater détecte en
   priorité. Aucune étape manuelle de build/zip n'est nécessaire.

## Licence

GPL v2 ou ultérieure — voir l'en-tête de `simpletrad.php`.
