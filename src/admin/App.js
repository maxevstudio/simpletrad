import { useEffect, useState } from '@wordpress/element';
import {
	Card,
	CardHeader,
	CardBody,
	Spinner,
	Notice,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { fetchSettings, saveSettings, fetchLanguageCatalog } from './api';
import SourceLanguageSelect from './components/SourceLanguageSelect';
import TargetLanguagesField from './components/TargetLanguagesField';
import SwitcherSettings from './components/SwitcherSettings';
import SwitcherPreview from './components/SwitcherPreview';
import FloatingSettings from './components/FloatingSettings';
import CustomCssEditor from './components/CustomCssEditor';
import ExclusionsField from './components/ExclusionsField';
import ProtectedTermsField from './components/ProtectedTermsField';
import CssClassesReference from './components/CssClassesReference';

/**
 * SimpleTrad's single settings screen. Deliberately one flat page (no
 * sub-menus, no tabs) so the whole configuration stays easy to scan. Uses
 * plain semantic headings/paragraphs rather than `@wordpress/components`'
 * experimental `Heading`/`Text` wrappers, since native HTML already covers
 * that need without relying on an unstable API.
 *
 * @return {JSX.Element} The rendered settings screen.
 */
export default function App() {
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ notice, setNotice ] = useState( null );
	const [ catalog, setCatalog ] = useState( [] );
	const [ settings, setSettings ] = useState( null );

	useEffect( () => {
		Promise.all( [ fetchSettings(), fetchLanguageCatalog() ] )
			.then( ( [ fetchedSettings, fetchedCatalog ] ) => {
				setSettings( fetchedSettings );
				setCatalog( fetchedCatalog );
			} )
			.catch( ( fetchError ) =>
				setError( fetchError?.message || String( fetchError ) )
			)
			.finally( () => setLoading( false ) );
	}, [] );

	const updateSetting = ( key, value ) => {
		setSettings( ( previous ) => ( { ...previous, [ key ]: value } ) );
	};

	const handleSave = () => {
		setSaving( true );
		setNotice( null );

		saveSettings( settings )
			.then( ( saved ) => {
				setSettings( saved );
				setNotice( {
					status: 'success',
					message: __( 'Réglages enregistrés.', 'simpletrad' ),
				} );
			} )
			.catch( ( saveError ) =>
				setNotice( {
					status: 'error',
					message:
						saveError?.message ||
						__(
							'Une erreur est survenue lors de l’enregistrement.',
							'simpletrad'
						),
				} )
			)
			.finally( () => setSaving( false ) );
	};

	if ( loading ) {
		return (
			<div className="simpletrad-admin__loading">
				<Spinner />
			</div>
		);
	}

	if ( error ) {
		return (
			<Notice status="error" isDismissible={ false }>
				{ error }
			</Notice>
		);
	}

	return (
		<div className="simpletrad-admin">
			<h1>{ __( 'SimpleTrad', 'simpletrad' ) }</h1>
			<p className="simpletrad-admin__intro">
				{ __(
					'Traduisez visuellement votre site pour vos visiteurs, sans jamais dupliquer une seule page.',
					'simpletrad'
				) }
			</p>

			{ notice && (
				<Notice
					status={ notice.status }
					onRemove={ () => setNotice( null ) }
				>
					{ notice.message }
				</Notice>
			) }

			<Card>
				<CardHeader>
					<h2>{ __( 'Langues', 'simpletrad' ) }</h2>
				</CardHeader>
				<CardBody>
					<SourceLanguageSelect
						catalog={ catalog }
						value={ settings.source_language }
						onChange={ ( value ) =>
							updateSetting( 'source_language', value )
						}
					/>
					<TargetLanguagesField
						catalog={ catalog }
						sourceLanguage={ settings.source_language }
						value={ settings.target_languages }
						onChange={ ( value ) =>
							updateSetting( 'target_languages', value )
						}
					/>
					<p className="simpletrad-admin__hint">
						{ __(
							'Le moteur de traduction réellement utilisé dépend du navigateur de chaque visiteur : SimpleTrad ne promet jamais une traduction qu’il ne peut pas fournir (voir AUDIT.md).',
							'simpletrad'
						) }
					</p>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h2>{ __( 'Switcher', 'simpletrad' ) }</h2>
				</CardHeader>
				<CardBody>
					<SwitcherSettings
						autoDetect={ settings.auto_detect }
						onAutoDetectChange={ ( value ) =>
							updateSetting( 'auto_detect', value )
						}
						display={ settings.switcher_display }
						onDisplayChange={ ( value ) =>
							updateSetting( 'switcher_display', value )
						}
						layout={ settings.switcher_layout }
						onLayoutChange={ ( value ) =>
							updateSetting( 'switcher_layout', value )
						}
					/>

					<SwitcherPreview
						catalog={ catalog }
						sourceLanguage={ settings.source_language }
						targetLanguages={ settings.target_languages }
						display={ settings.switcher_display }
						layout={ settings.switcher_layout }
						customCss={ settings.custom_css }
					/>

					<CustomCssEditor
						value={ settings.custom_css }
						onChange={ ( value ) =>
							updateSetting( 'custom_css', value )
						}
					/>

					<CssClassesReference />
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h2>{ __( 'Pastille flottante', 'simpletrad' ) }</h2>
				</CardHeader>
				<CardBody>
					<FloatingSettings
						enabled={ settings.floating_enabled }
						onEnabledChange={ ( value ) =>
							updateSetting( 'floating_enabled', value )
						}
						position={ settings.floating_position }
						onPositionChange={ ( value ) =>
							updateSetting( 'floating_position', value )
						}
						backToTop={ settings.floating_back_to_top }
						onBackToTopChange={ ( value ) =>
							updateSetting( 'floating_back_to_top', value )
						}
					/>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h2>{ __( 'Exclusions', 'simpletrad' ) }</h2>
				</CardHeader>
				<CardBody>
					<ExclusionsField
						value={ settings.excluded_selectors }
						onChange={ ( value ) =>
							updateSetting( 'excluded_selectors', value )
						}
					/>
					<p className="simpletrad-admin__hint">
						{ __(
							'La classe .simpletrad-no-translate et l’attribut translate="no" sont toujours respectés, même sans réglage.',
							'simpletrad'
						) }
					</p>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h2>{ __( 'Termes protégés', 'simpletrad' ) }</h2>
				</CardHeader>
				<CardBody>
					<ProtectedTermsField
						value={ settings.protected_terms }
						onChange={ ( value ) =>
							updateSetting( 'protected_terms', value )
						}
					/>
					<p className="simpletrad-admin__hint">
						{ __(
							'Ajoutez ici les noms, marques ou expressions qui ne doivent jamais être traduits (ex. : Maxev, SimpleTrad, Hôtel Martinez, Jean Dupont, Côte d’Azur).',
							'simpletrad'
						) }
					</p>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h2>{ __( 'Shortcode', 'simpletrad' ) }</h2>
				</CardHeader>
				<CardBody>
					<p>
						{ __(
							'Ajoutez ce shortcode où vous voulez afficher le switcher (Elementor, éditeur de blocs…) :',
							'simpletrad'
						) }
					</p>
					<code>[simpletrad]</code>
					{ ' · ' }
					<code>{ '[simpletrad display="code"]' }</code>
				</CardBody>
			</Card>

			<div className="simpletrad-admin__actions">
				<Button
					variant="primary"
					onClick={ handleSave }
					isBusy={ saving }
					disabled={ saving }
				>
					{ __( 'Enregistrer', 'simpletrad' ) }
				</Button>
			</div>
		</div>
	);
}
