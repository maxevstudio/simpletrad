<?php
/**
 * Language catalogue for SimpleTrad.
 *
 * @package SimpleTrad
 */

namespace SimpleTrad;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Provides the built-in catalogue of languages (BCP 47 codes) that SimpleTrad
 * can offer in the admin UI, independently of what the active translation
 * engine actually supports at runtime (see Engine_Status).
 */
class Languages {

	/**
	 * Returns the full language catalogue as an associative array keyed by
	 * BCP 47 / ISO code.
	 *
	 * The catalogue is intentionally not capped: SimpleTrad does not impose
	 * artificial or commercial limits on the number of selectable languages.
	 * It can be extended via the `simpletrad_language_catalog` filter without
	 * touching the plugin's core architecture.
	 *
	 * @return array<string, array{name_fr: string, name_native: string}>
	 */
	public static function get_catalog() {
		static $catalog = null;

		if ( null !== $catalog ) {
			return $catalog;
		}

		$catalog = array(
				'af' => array( 'name_fr' => 'Afrikaans', 'name_native' => 'Afrikaans' ),
				'sq' => array( 'name_fr' => 'Albanais', 'name_native' => 'Shqip' ),
				'am' => array( 'name_fr' => 'Amharique', 'name_native' => 'አማርኛ' ),
				'ar' => array( 'name_fr' => 'Arabe', 'name_native' => 'العربية' ),
				'hy' => array( 'name_fr' => 'Arménien', 'name_native' => 'Հայերեն' ),
				'az' => array( 'name_fr' => 'Azéri', 'name_native' => 'Azərbaycanca' ),
				'eu' => array( 'name_fr' => 'Basque', 'name_native' => 'Euskara' ),
				'be' => array( 'name_fr' => 'Biélorusse', 'name_native' => 'Беларуская' ),
				'bn' => array( 'name_fr' => 'Bengali', 'name_native' => 'বাংলা' ),
				'bs' => array( 'name_fr' => 'Bosniaque', 'name_native' => 'Bosanski' ),
				'bg' => array( 'name_fr' => 'Bulgare', 'name_native' => 'Български' ),
				'my' => array( 'name_fr' => 'Birman', 'name_native' => 'မြန်မာဘာသာ' ),
				'ca' => array( 'name_fr' => 'Catalan', 'name_native' => 'Català' ),
				'ceb' => array( 'name_fr' => 'Cebuano', 'name_native' => 'Cebuano' ),
				'zh' => array( 'name_fr' => 'Chinois (simplifié)', 'name_native' => '中文（简体）' ),
				'zh-Hant' => array( 'name_fr' => 'Chinois (traditionnel)', 'name_native' => '中文（繁體）' ),
				'co' => array( 'name_fr' => 'Corse', 'name_native' => 'Corsu' ),
				'hr' => array( 'name_fr' => 'Croate', 'name_native' => 'Hrvatski' ),
				'cs' => array( 'name_fr' => 'Tchèque', 'name_native' => 'Čeština' ),
				'da' => array( 'name_fr' => 'Danois', 'name_native' => 'Dansk' ),
				'nl' => array( 'name_fr' => 'Néerlandais', 'name_native' => 'Nederlands' ),
				'en' => array( 'name_fr' => 'Anglais', 'name_native' => 'English' ),
				'eo' => array( 'name_fr' => 'Espéranto', 'name_native' => 'Esperanto' ),
				'et' => array( 'name_fr' => 'Estonien', 'name_native' => 'Eesti' ),
				'fi' => array( 'name_fr' => 'Finnois', 'name_native' => 'Suomi' ),
				'fr' => array( 'name_fr' => 'Français', 'name_native' => 'Français' ),
				'fy' => array( 'name_fr' => 'Frison', 'name_native' => 'Frysk' ),
				'gl' => array( 'name_fr' => 'Galicien', 'name_native' => 'Galego' ),
				'ka' => array( 'name_fr' => 'Géorgien', 'name_native' => 'ქართული' ),
				'de' => array( 'name_fr' => 'Allemand', 'name_native' => 'Deutsch' ),
				'el' => array( 'name_fr' => 'Grec', 'name_native' => 'Ελληνικά' ),
				'gu' => array( 'name_fr' => 'Goudjrati', 'name_native' => 'ગુજરાતી' ),
				'ht' => array( 'name_fr' => 'Créole haïtien', 'name_native' => 'Kreyòl ayisyen' ),
				'ha' => array( 'name_fr' => 'Haoussa', 'name_native' => 'Hausa' ),
				'haw' => array( 'name_fr' => 'Hawaïen', 'name_native' => 'ʻŌlelo Hawaiʻi' ),
				'he' => array( 'name_fr' => 'Hébreu', 'name_native' => 'עברית' ),
				'hi' => array( 'name_fr' => 'Hindi', 'name_native' => 'हिन्दी' ),
				'hmn' => array( 'name_fr' => 'Hmong', 'name_native' => 'Hmoob' ),
				'hu' => array( 'name_fr' => 'Hongrois', 'name_native' => 'Magyar' ),
				'is' => array( 'name_fr' => 'Islandais', 'name_native' => 'Íslenska' ),
				'ig' => array( 'name_fr' => 'Igbo', 'name_native' => 'Asụsụ Igbo' ),
				'id' => array( 'name_fr' => 'Indonésien', 'name_native' => 'Bahasa Indonesia' ),
				'ga' => array( 'name_fr' => 'Irlandais', 'name_native' => 'Gaeilge' ),
				'it' => array( 'name_fr' => 'Italien', 'name_native' => 'Italiano' ),
				'ja' => array( 'name_fr' => 'Japonais', 'name_native' => '日本語' ),
				'jv' => array( 'name_fr' => 'Javanais', 'name_native' => 'Basa Jawa' ),
				'kn' => array( 'name_fr' => 'Kannada', 'name_native' => 'ಕನ್ನಡ' ),
				'kk' => array( 'name_fr' => 'Kazakh', 'name_native' => 'Қазақ тілі' ),
				'km' => array( 'name_fr' => 'Khmer', 'name_native' => 'ខ្មែរ' ),
				'rw' => array( 'name_fr' => 'Kinyarwanda', 'name_native' => 'Ikinyarwanda' ),
				'ko' => array( 'name_fr' => 'Coréen', 'name_native' => '한국어' ),
				'ku' => array( 'name_fr' => 'Kurde', 'name_native' => 'Kurdî' ),
				'ky' => array( 'name_fr' => 'Kirghiz', 'name_native' => 'Кыргызча' ),
				'lo' => array( 'name_fr' => 'Lao', 'name_native' => 'ລາວ' ),
				'la' => array( 'name_fr' => 'Latin', 'name_native' => 'Latina' ),
				'lv' => array( 'name_fr' => 'Letton', 'name_native' => 'Latviešu' ),
				'lt' => array( 'name_fr' => 'Lituanien', 'name_native' => 'Lietuvių' ),
				'lb' => array( 'name_fr' => 'Luxembourgeois', 'name_native' => 'Lëtzebuergesch' ),
				'mk' => array( 'name_fr' => 'Macédonien', 'name_native' => 'Македонски' ),
				'mg' => array( 'name_fr' => 'Malgache', 'name_native' => 'Malagasy' ),
				'ms' => array( 'name_fr' => 'Malais', 'name_native' => 'Bahasa Melayu' ),
				'ml' => array( 'name_fr' => 'Malayalam', 'name_native' => 'മലയാളം' ),
				'mt' => array( 'name_fr' => 'Maltais', 'name_native' => 'Malti' ),
				'mi' => array( 'name_fr' => 'Maori', 'name_native' => 'Te Reo Māori' ),
				'mr' => array( 'name_fr' => 'Marathi', 'name_native' => 'मराठी' ),
				'mn' => array( 'name_fr' => 'Mongol', 'name_native' => 'Монгол' ),
				'ne' => array( 'name_fr' => 'Népalais', 'name_native' => 'नेपाली' ),
				'no' => array( 'name_fr' => 'Norvégien', 'name_native' => 'Norsk' ),
				'ny' => array( 'name_fr' => 'Chichewa', 'name_native' => 'Chichewa' ),
				'or' => array( 'name_fr' => 'Odia', 'name_native' => 'ଓଡ଼ିଆ' ),
				'ps' => array( 'name_fr' => 'Pachto', 'name_native' => 'پښتو' ),
				'fa' => array( 'name_fr' => 'Persan', 'name_native' => 'فارسی' ),
				'pl' => array( 'name_fr' => 'Polonais', 'name_native' => 'Polski' ),
				'pt' => array( 'name_fr' => 'Portugais', 'name_native' => 'Português' ),
				'pa' => array( 'name_fr' => 'Pendjabi', 'name_native' => 'ਪੰਜਾਬੀ' ),
				'ro' => array( 'name_fr' => 'Roumain', 'name_native' => 'Română' ),
				'ru' => array( 'name_fr' => 'Russe', 'name_native' => 'Русский' ),
				'sm' => array( 'name_fr' => 'Samoan', 'name_native' => 'Gagana Samoa' ),
				'gd' => array( 'name_fr' => 'Gaélique écossais', 'name_native' => 'Gàidhlig' ),
				'sr' => array( 'name_fr' => 'Serbe', 'name_native' => 'Српски' ),
				'st' => array( 'name_fr' => 'Sotho du Sud', 'name_native' => 'Sesotho' ),
				'sn' => array( 'name_fr' => 'Shona', 'name_native' => 'ChiShona' ),
				'sd' => array( 'name_fr' => 'Sindhi', 'name_native' => 'سنڌي' ),
				'si' => array( 'name_fr' => 'Cingalais', 'name_native' => 'සිංහල' ),
				'sk' => array( 'name_fr' => 'Slovaque', 'name_native' => 'Slovenčina' ),
				'sl' => array( 'name_fr' => 'Slovène', 'name_native' => 'Slovenščina' ),
				'so' => array( 'name_fr' => 'Somali', 'name_native' => 'Soomaali' ),
				'es' => array( 'name_fr' => 'Espagnol', 'name_native' => 'Español' ),
				'su' => array( 'name_fr' => 'Soundanais', 'name_native' => 'Basa Sunda' ),
				'sw' => array( 'name_fr' => 'Swahili', 'name_native' => 'Kiswahili' ),
				'sv' => array( 'name_fr' => 'Suédois', 'name_native' => 'Svenska' ),
				'tl' => array( 'name_fr' => 'Tagalog', 'name_native' => 'Tagalog' ),
				'tg' => array( 'name_fr' => 'Tadjik', 'name_native' => 'Тоҷикӣ' ),
				'ta' => array( 'name_fr' => 'Tamoul', 'name_native' => 'தமிழ்' ),
				'tt' => array( 'name_fr' => 'Tatar', 'name_native' => 'Татар теле' ),
				'te' => array( 'name_fr' => 'Télougou', 'name_native' => 'తెలుగు' ),
				'th' => array( 'name_fr' => 'Thaï', 'name_native' => 'ไทย' ),
				'tr' => array( 'name_fr' => 'Turc', 'name_native' => 'Türkçe' ),
				'tk' => array( 'name_fr' => 'Turkmène', 'name_native' => 'Türkmençe' ),
				'uk' => array( 'name_fr' => 'Ukrainien', 'name_native' => 'Українська' ),
				'ur' => array( 'name_fr' => 'Ourdou', 'name_native' => 'اردو' ),
				'ug' => array( 'name_fr' => 'Ouïghour', 'name_native' => 'ئۇيغۇرچە' ),
				'uz' => array( 'name_fr' => 'Ouzbek', 'name_native' => 'Oʻzbekcha' ),
				'vi' => array( 'name_fr' => 'Vietnamien', 'name_native' => 'Tiếng Việt' ),
				'cy' => array( 'name_fr' => 'Gallois', 'name_native' => 'Cymraeg' ),
				'xh' => array( 'name_fr' => 'Xhosa', 'name_native' => 'isiXhosa' ),
				'yi' => array( 'name_fr' => 'Yiddish', 'name_native' => 'ייִדיש' ),
				'yo' => array( 'name_fr' => 'Yoruba', 'name_native' => 'Yorùbá' ),
				'zu' => array( 'name_fr' => 'Zoulou', 'name_native' => 'isiZulu' ),		);

		/**
		 * Filters the SimpleTrad language catalogue.
		 *
		 * Use this filter to add languages that are not part of the default
		 * catalogue, for example regional variants, without modifying core
		 * plugin files.
		 *
		 * @param array $catalog Associative array keyed by BCP 47 code.
		 */
		$catalog = apply_filters( 'simpletrad_language_catalog', $catalog );

		return $catalog;
	}

	/**
	 * Returns a single language entry, or null if unknown in the catalogue.
	 *
	 * @param string $code BCP 47 / ISO language code.
	 * @return array{name_fr: string, name_native: string}|null
	 */
	public static function get_language( $code ) {
		$catalog = self::get_catalog();

		return isset( $catalog[ $code ] ) ? $catalog[ $code ] : null;
	}

	/**
	 * Normalizes a browser locale (e.g. `en-GB`) down to its base language
	 * subtag (e.g. `en`), matching the catalogue keys.
	 *
	 * @param string $locale Locale string as reported by the browser.
	 * @return string Normalized base language code, lowercase.
	 */
	public static function normalize_locale( $locale ) {
		$locale = strtolower( trim( (string) $locale ) );
		$parts  = preg_split( '/[-_]/', $locale );

		return isset( $parts[0] ) ? $parts[0] : $locale;
	}
}
