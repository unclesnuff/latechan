import Parser from '../../Parser'

import parseBoards from './parseBoardsResponse'
import parseThreads from './parseThreadsResponse'
import parseThread from './parseThreadResponse'

import PARSE_COMMENT_PLUGINS from './parseCommentPlugins'
import KOHLCHAN_PARSE_COMMENT_PLUGINS from './parseCommentPlugins.kohlchan'

export default class FourChanParser extends Parser {
	constructor(chanSettings, options) {
		super(chanSettings, {
			...options,
			parseCommentPlugins: getParseCommentPlugins(chanSettings.id),
			parseBoards,
			parseThreads,
			parseThread
		})
	}
}

function getParseCommentPlugins(chan) {
	switch (chan) {
		case 'kohlchan':
			return KOHLCHAN_PARSE_COMMENT_PLUGINS
		default:
			return PARSE_COMMENT_PLUGINS
	}
}