module.exports = {
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	settings: {
		jsdoc: { mode: 'typescript' },
	},
	overrides: [
		{
			files: [ 'src/frontend/**/*.js' ],
			env: {
				browser: true,
				worker: true,
			},
			globals: {
				// The Translator API (https://developer.mozilla.org/en-US/docs/Web/API/Translator)
				// is a global constructor exposed by compatible browsers; it is
				// always feature-detected before use (see native-engine.js).
				Translator: 'readonly',
			},
			rules: {
				// This is a small, deliberately lightweight front-end script: the
				// project favours concise inline JSDoc over the full strict
				// @wordpress core documentation rules for every parameter.
				'jsdoc/require-param-type': 'off',
				'jsdoc/require-returns-description': 'off',
				'jsdoc/no-undefined-types': 'off',
			},
		},
		{
			files: [ 'src/admin/**/*.js' ],
			env: {
				browser: true,
			},
			rules: {
				'jsdoc/require-param-type': 'off',
				'jsdoc/require-returns-description': 'off',
			},
		},
		{
			files: [ '**/test/**/*.js', '**/*.test.js' ],
			env: {
				jest: true,
			},
			rules: {
				'jsdoc/require-param': 'off',
				'jsdoc/require-returns': 'off',
			},
		},
	],
};
