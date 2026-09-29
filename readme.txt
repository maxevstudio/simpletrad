=== SimpleTrad ===
Contributors: maxev
Tags: translation, multilingual, language switcher, front-end translation
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Traduit visuellement le front-end de votre site dans le navigateur du
visiteur, sans jamais dupliquer une seule page WordPress.

== Description ==

SimpleTrad traduit le contenu *visible* de vos pages directement dans le
navigateur de vos visiteurs, sans dupliquer aucun contenu WordPress (pages,
articles, CPT, menus, médias, taxonomies) et sans stocker la moindre
traduction en base de données.

= Ce que SimpleTrad n'est pas =

* Ce n'est pas un plugin SEO multilingue : pas de `/en/`, `/es/`, pas de
  `hreflang`, pas de sitemap multilingue.
* Ce n'est pas un système à la WPML/Polylang/Weglot/ConveyThis : aucune page
  supplémentaire, aucune base de traductions à synchroniser.
* Ce n'est pas un service SaaS : aucune clé API, aucun abonnement, aucun
  quota de caractères.

= Fonctionnalités principales =

* Réglages React natifs WordPress (une seule page, pas de sous-menus).
* Sélection de langues sans limite, avec recherche par nom français, nom
  natif ou code ISO/BCP 47.
* Shortcode `[simpletrad]` avec aperçu en direct dans l'administration.
* Détection automatique de la langue du navigateur.
* Paramètre `?lang=xx` léger, sans cookie ni stockage local.
* Exclusions de traduction via classe CSS, attribut `translate="no"` ou
  sélecteurs personnalisés.
* Moteur natif basé sur la Translator API du navigateur, avec dégradation
  gracieuse quand elle n'est pas disponible.

== Installation ==

1. Téléversez le dossier `simpletrad` dans `/wp-content/plugins/`, ou
   installez le ZIP depuis **Extensions → Ajouter**.
2. Activez le plugin.
3. Configurez SimpleTrad depuis le nouveau menu d'administration.
4. Ajoutez le shortcode `[simpletrad]` où vous souhaitez afficher le
   sélecteur de langues.

== Frequently Asked Questions ==

= SimpleTrad crée-t-il de nouvelles pages WordPress pour chaque langue ? =

Non. Chaque page WordPress reste unique ; seule sa version affichée dans le
navigateur change selon la langue choisie.

= Les traductions sont-elles stockées quelque part ? =

Non, jamais : ni en base de données, ni en post meta, ni en option, ni en
`localStorage`, ni en cookie. Voir `AUDIT.md` et le README pour le détail.

= Faut-il une clé API pour traduire ? =

Non. La v1.0.0 ne nécessite aucune clé Google Cloud, DeepL, Microsoft
Translator ni aucun abonnement.

== Changelog ==

= 1.0.0 =
* Première version publique. Voir CHANGELOG.md pour le détail complet.
