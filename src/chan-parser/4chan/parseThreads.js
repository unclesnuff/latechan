import parseThread from './parseThread'

import setPostLinkUrls from '../setPostLinkUrls'
import compileFilters from '../compileFilters'

/**
 * Parses chan API response for threads list.
 * @param  {object} response — Chan API response for threads list
 * @param  {object} [options] — `{ filters, getAttachmentUrl }`
 * @return {object}
 * @example
 * // Returns:
 * // [{
 * //   id: '12345',
 * //   ... See `parseThread.js`,
 * //   comments: [{
 * //     ... See `parseComment.js`
 * //   }]
 * // }, ...]
 * parseThreads(response)
 */
export default function parseThreads(response, {
	boardId,
	filters,
	getAttachmentUrl,
	messages,
	parseCommentTextPlugins
}) {
	let threads = response.reduce((all, page) => all.concat(page.threads), [])
	threads = threads.map(_ => parseThread(_, {
		boardId,
		filters: filters ? compileFilters(filters) : undefined,
		getAttachmentUrl,
		parseCommentTextPlugins
	}))
	for (const thread of threads) {
		// Set comment links.
		setPostLinkUrls(thread.comments[0], {
			boardId,
			threadId: thread.comments[0].id,
			messages
		})
	}
	return threads
}