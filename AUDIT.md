# Audit technique — moteurs de traduction (v1.0.0)

Ce document résume l'audit réalisé avant l'intégration du moteur de traduction
de SimpleTrad (section 36/37 du cahier des charges), afin de ne jamais
promettre une compatibilité qui n'existe pas réellement.

## 1. Web `Translator` API (moteur natif du navigateur)

- **Spécification** : [MDN — Translator API](https://developer.mozilla.org/en-US/docs/Web/API/Translator),
  implémentation de la proposition W3C *Translation and Language Detection API*.
- **Détection** : `'Translator' in self`, puis `Translator.availability({ sourceLanguage, targetLanguage })`
  qui renvoie `'available' | 'downloadable' | 'downloading' | 'unavailable'`.
- **Navigateurs compatibles au moment de l'audit** :
  - Chrome / Chromium **desktop** ≥ 138 (derrière un contexte sécurisé HTTPS).
  - **Pas de support** sur Chrome mobile (Android/iOS), Firefox, Safari ou Edge à ce jour.
- **Contraintes** :
  - Le téléchargement d'un modèle (`Translator.create()` quand le statut est
    `downloadable`) **doit** être déclenché depuis un geste utilisateur réel
    (clic). SimpleTrad respecte cette contrainte : la traduction n'est
    déclenchée automatiquement (détection navigateur, `?lang=`) que si le
    modèle est déjà `available`; sinon l'appel se fait au premier clic sur le
    switcher, qui constitue le geste utilisateur requis.
  - Modèles téléchargés et mis en cache par le **navigateur lui-même** (jamais
    par SimpleTrad) — conforme à la section 2 du cahier des charges (« cache
    technique du navigateur », pas une base de traductions du plugin).
- **Conclusion** : utilisé comme moteur principal, avec détection de
  disponibilité systématique avant tout appel, et gestion des erreurs
  (`NotAllowedError`, etc.) sans jamais casser la page.

## 2. Bergamot / Mozilla Translations (fallback WebAssembly)

- **Historique** : Firefox utilisait en interne le moteur *Bergamot*
  (Marian NMT compilé en WebAssembly) pour sa fonctionnalité de traduction
  intégrée.
- **`mozilla/firefox-translations-models`** : dépôt **archivé** (lecture
  seule). Le README indique explicitement que le projet n'est plus maintenu et
  que l'évaluation/hébergement des modèles a été migré vers
  `mozilla/translations`, les modèles étant désormais servis depuis une
  infrastructure Google Cloud Storage interne à Mozilla, non prévue pour un
  usage de redistribution tierce généraliste.
- **Licences** : le moteur et les modèles historiques sont publiés sous
  licence **MPL-2.0** (code et poids des modèles), ce qui autoriserait en
  théorie la redistribution avec attribution — mais l'emplacement canonique
  actuel des fichiers n'est plus un simple export HTTP public et stable.
- **Bibliothèque JS/WASM** : [`@mkljczk/bergamot-translator`](https://www.npmjs.com/package/@mkljczk/bergamot-translator)
  est un portage npm activement maintenu du moteur Bergamot, indépendant de
  l'infrastructure interne de Firefox.
- **Poids** : moteur WASM de quelques Mo + modèles de langue de **17 à 44 Mo
  par paire et par sens** (int8, tailles *tiny*/*base-memory*/*base*).
- **Conclusion** : intégrer aveuglément l'ancien dépôt archivé aurait été
  contraire à la consigne explicite du cahier des charges (« ne pas copier
  aveuglément un ancien repository archivé »). Le poids des modèles est par
  ailleurs incompatible avec l'exigence de légèreté de SimpleTrad s'ils
  devaient être embarqués dans le ZIP du plugin.

## 3. Décision architecturale retenue pour la v1.0.0

SimpleTrad implémente donc :

1. **`NativeBrowserTranslator`** — moteur principal, entièrement fonctionnel,
   basé sur la Translator API native.
2. **`WasmTranslationFallback`** — une **interface propre et fonctionnelle**
   (voir [`src/frontend/translation/fallback-engine.js`](src/frontend/translation/fallback-engine.js))
   qui définit un protocole simple et documenté (`manifest.json` + `Worker`)
   permettant de brancher, plus tard ou dès aujourd'hui, un moteur WASM
   auto-hébergé par l'administrateur du site (par exemple basé sur
   `@mkljczk/bergamot-translator` et des modèles MPL-2.0 récupérés depuis leur
   nouvel emplacement officiel). **Aucun binaire, moteur ou modèle n'est
   embarqué dans le plugin lui-même** afin de :
   - respecter l'exigence de légèreté (pas de dizaines de Mo par langue dans
     un plugin WordPress) ;
   - ne pas dépendre d'une infrastructure de redistribution dont la pérennité
     et les conditions d'usage tiers ne sont, à ce jour, pas clairement
     établies pour cet usage précis ;
   - ne jamais promettre une traduction que SimpleTrad ne peut pas réellement
     fournir (section 7 du cahier des charges).
3. **Dégradation gracieuse** : si ni le moteur natif ni un fallback
   auto-hébergé ne sont disponibles pour une paire de langues donnée, le
   contenu original reste affiché — jamais de page cassée, jamais de
   traduction simulée.

Cette limitation est documentée ici et dans le [README](README.md) plutôt que
contournée par un hack fragile (endpoints non documentés de Google Translate,
copie d'un dépôt archivé, etc.), conformément à la section 36 du cahier des
charges : *« si une contrainte bloque réellement l'approche souhaitée,
documenter précisément le problème et proposer la solution la plus légère
possible sans basculer vers une API SaaS payante »*.

## 4. Piste d'évolution (hors scope v1.0.0)

Un futur module complémentaire (« SimpleTrad WASM Models ») pourrait
héberger et servir un jeu de modèles Bergamot pré-validés (licence, taille,
paires de langues) derrière le protocole `manifest.json` déjà défini par
`WasmTranslationFallback`, sans modifier le cœur du plugin.
