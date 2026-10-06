# Changelog

Toutes les modifications notables de SimpleTrad sont documentées dans ce
fichier. Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet respecte le [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.3] — Changement de langue fiable et mises à jour automatiques

### Corrigé

- Le retour à la langue source n'est plus annulé par la détection
  automatique : le dernier choix du visiteur est mémorisé (localStorage) et
  prime sur la langue du navigateur. Ordre : `?lang=` → dernier choix →
  navigateur → langue source.
- La détection automatique tient compte de la langue source : un navigateur
  « français, puis anglais » reste en français au lieu de basculer en anglais.
- Changer de langue pendant qu'une traduction charge : la traduction dépassée
  est abandonnée au lieu d'écraser le dernier choix, et le clic sur la langue
  source n'est plus ignoré pendant le chargement.
- Mises à jour : « Vérifier à nouveau » vide le cache de l'updater, un échec
  de vérification n'est mis en cache que 15 minutes (au lieu de 6 h), et
  l'updater est chargé pendant WP-Cron/WP-CLI pour que les mises à jour
  automatiques en arrière-plan fonctionnent. SimpleTrad est aussi déclaré
  « à jour » à WordPress, ce qui affiche le lien « Activer les mises à jour
  auto ».

## [1.0.2] — Pastille flottante et fidélité de mise en page

### Ajouté

- Pastille flottante (option « Pastille flottante » dans les réglages) :
  un bouton fixé en bas à droite ou à gauche de l'écran affiche la langue
  active et ouvre un panneau avec le sélecteur. Option « Retour en haut »
  qui glisse sous la pastille au défilement. Entièrement personnalisable via
  les variables CSS `--simpletrad-fab-*`.

### Corrigé

- Les espaces autour d'un texte inline (ex. `La lettre <em>mensuelle</em>`)
  sont conservés après traduction : la mise en page ne se « colle » plus.
- Passer d'une langue cible à une autre (EN → ES) retraduit depuis le texte
  source d'origine, et revenir à la langue source restaure bien l'original
  (auparavant le texte déjà traduit écrasait l'original).
- Casse inventée par le moteur annulée : un fragment rendu en MAJUSCULES ou
  En Title Case alors que la source ne l'était pas reprend la casse de la
  source (noms propres et sigles présents dans la source préservés).

## [1.0.1] — Mise à jour corrective et fonctionnelle

### Ajouté

- Éditeur CSS personnalisé du switcher directement dans l'administration
  (`CustomCssEditor`, textarea monospace natif), avec aperçu en direct dans
  le même composant `SwitcherPreview` que le front-end (aucun second
  système de style dédié à la prévisualisation). Bouton « Réinitialiser le
  CSS » avec confirmation, sans jamais toucher aux autres réglages.
- Termes protégés (`ProtectedTermsField`, `FormTokenField`, sans limite)
  pour empêcher la traduction de marques, noms propres ou expressions
  (ex. `Maxev`, `SimpleTrad`, `Hôtel Martinez`). Implémentés via des
  placeholders uniques substitués avant traduction et restaurés après,
  en conservant la casse exacte trouvée dans le DOM à cet endroit précis.
- Conservation de la casse après traduction (`case-utils.js`) : première
  lettre majuscule préservée, texte tout en majuscules restitué en
  majuscules, aucune capitalisation artificielle sur du texte en
  minuscules, et surtout aucune capitalisation mot-par-mot — les mots à
  casse mixte comme `iPhone` ou `eCommerce` ne sont jamais altérés.
- Nouveau réglage `custom_css`, chargé sur le front via
  `wp_add_inline_style()` uniquement sur les pages où `[simpletrad]` est
  réellement affiché.

### Modifié

- Le pipeline de traduction (`TranslationController`) applique désormais :
  protection des termes → traduction → restauration des termes → correction
  de casse → affichage, en restant entièrement au-dessus de l'abstraction
  `TranslationEngine` (fonctionne identiquement avec le moteur natif ou le
  fallback WASM auto-hébergé).
- 30 nouveaux tests unitaires et d'intégration (55 au total) couvrant les
  cas de casse et de termes protégés spécifiés, y compris leur combinaison
  dans une même phrase.

### Compatibilité

- Migration transparente depuis 1.0.0 : les réglages existants (langue
  source, langues proposées, exclusions, etc.) sont entièrement préservés ;
  les nouvelles clés (`custom_css`, `protected_terms`) reçoivent simplement
  leurs valeurs par défaut via la fusion `wp_parse_args()` déjà en place.
  Aucune réinstallation nécessaire.

## [1.0.0] — Première version

### Ajouté

- Écran de réglages unique en React (`@wordpress/element` /
  `@wordpress/components`) : langue originale, langues proposées (recherche
  par nom français, nom natif ou code ISO/BCP 47, sans limite de nombre),
  aperçu du switcher, réglages d'affichage/orientation, exclusions CSS.
- Shortcode `[simpletrad]` (attributs `display` et `layout`).
- Moteur de traduction front-end sans framework, basé sur `TreeWalker`,
  traduisant toujours depuis le texte source (jamais de chaînage
  FR → EN → ES) et restaurant instantanément le texte d'origine.
- Moteur natif `NativeBrowserTranslator` basé sur la Translator API du
  navigateur (feature-detection systématique, jamais d'API non documentée).
- Interface `WasmTranslationFallback` (protocole `manifest.json` + `Worker`)
  pour un futur moteur WebAssembly auto-hébergé — voir `AUDIT.md`.
- Détection de la langue préférée du navigateur (`navigator.languages` /
  `navigator.language`), désactivable.
- Paramètre `?lang=xx` avec propagation/retrait automatique sur les liens
  internes éligibles, préservation des autres paramètres de requête.
- Exclusions via `.simpletrad-no-translate`, `translate="no"` et sélecteurs
  CSS additionnels configurables.
- API REST `simpletrad/v1/settings` et `simpletrad/v1/languages`, protégées
  par `manage_options` et le nonce REST WordPress.
- Vérificateur de mises à jour basé sur les releases publiques GitHub,
  entièrement isolé (`includes/class-updater.php`).
- Désinstallation propre : suppression de l'unique option
  `simpletrad_settings` (aucune traduction n'étant jamais stockée).
- Audit technique documenté (`AUDIT.md`) des moteurs de traduction
  disponibles (Translator API, Bergamot/Mozilla Translations).

