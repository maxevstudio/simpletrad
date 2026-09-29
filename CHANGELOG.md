# Changelog

Toutes les modifications notables de SimpleTrad sont documentées dans ce
fichier. Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet respecte le [Semantic Versioning](https://semver.org/lang/fr/).

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
