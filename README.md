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
- **Exclusions** : sélecteurs CSS additionnels à ne jamais traduire.

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

Les 25 tests unitaires couvrent notamment : normalisation des locales,
détection de la langue navigateur, éligibilité des liens pour `?lang=`,
préservation des autres paramètres de requête, collecte des nœuds texte via
`TreeWalker`, exclusions (`.simpletrad-no-translate`, `translate="no"`,
sélecteurs admin), et non-chaînage des traductions (toujours
langue source → langue cible, jamais FR → EN → ES).

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

## Limitations connues (v1.0.0)

- La traduction réelle du contenu dépend du navigateur du visiteur : sans
  Chrome/Chromium ≥ 138 (ou un fallback auto-hébergé configuré), le switcher
  reste visible mais le contenu original est conservé.
- Aucun modèle WASM n'est fourni par défaut (voir [AUDIT.md](AUDIT.md)).
- Pas de SEO multilingue, pas de pages traduites indexables, pas de
  `hreflang` : ce n'est pas l'objectif du plugin.
- Pas d'éditeur manuel de traductions, pas de traduction du back-office, pas
  de gestion par rôle : hors scope de la v1.

## Mises à jour automatiques

SimpleTrad intègre un vérificateur de mises à jour basé sur les *releases*
publiques GitHub (`includes/class-updater.php`), entièrement isolé du reste du
plugin :

- aucune clé ni jeton personnel n'est embarqué dans le code ;
- seule l'API publique `https://api.github.com/repos/<owner>/<repo>/releases/latest`
  est interrogée (résultat mis en cache 6h) ;
- le dépôt cible est filtrable via `add_filter( 'simpletrad_github_repo', fn () => 'owner/repo' )`.

### Publier une nouvelle version

1. Mettre à jour `Version:` dans `simpletrad.php`, `SIMPLETRAD_VERSION`, et le
   [CHANGELOG.md](CHANGELOG.md).
2. `npm run build`
3. `npm run plugin-zip`
4. Créer un tag Git `vX.Y.Z` et une release GitHub avec le ZIP en pièce jointe
   (asset `.zip`) — c'est cet asset que l'updater détecte en priorité.

## Licence

GPL v2 ou ultérieure — voir l'en-tête de `simpletrad.php`.
