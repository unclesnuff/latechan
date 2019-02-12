import {
	supportsCSSVariables,
	resetCSSVariable,
	setCSSVariable
} from 'webapp-frontend/src/utility/theme'

const LARGE_FONT_SIZES = {
	'--font-size-xs' : '19px',
	'--font-size-xs-plus' : '21px',
	'--font-size-m'  : '22px',
	'--font-size-xl' : '23px'
}

const DEFAULT_FONT_SIZE = 'medium'

export function applyFontSize(fontSize) {
	if (!supportsCSSVariables()) {
		return false
	}
	// Reset all CSS variables.
	for (const variableName of Object.keys(LARGE_FONT_SIZES)) {
		resetCSSVariable(variableName)
	}
	// Set all CSS variables.
	if (fontSize !== DEFAULT_FONT_SIZE) {
		for (const variableName of Object.keys(LARGE_FONT_SIZES)) {
			setCSSVariable(variableName, LARGE_FONT_SIZES[variableName])
		}
	}
	return true
}