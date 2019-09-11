import parseComment from '../comment/parseComment'

import constructThread from '../../../constructThread'

/**
 * Parses chan API response for thread comments list.
 * @param  {object} thread — Chan API response thread object
 * @param  {object} options
 * @return {object} See README.md for "Thread" object description.
 */
export default function parseThread(thread, posts, {
	boardId,
	censoredWords,
	messages,
	boardTitle,
	defaultAuthorName,
	parseCommentPlugins,
	commentLengthLimit, // Max comment length until it generates a shortened preview.
	maxCommentLength, // Board-wide max new comment length allowed by chan.
	maxAttachmentsSize,
	bumpLimit,
	hasVoting,
	hasFlags,
	icons,
	commentsCount,
	commentAttachmentsCount,
	toAbsoluteUrl,
	commentUrl,
	commentUrlParser,
	parseContent,
	expandReplies
}) {
	const comments = posts.map(comment => parseComment(comment, {
		boardId,
		censoredWords,
		messages,
		defaultAuthorName,
		parseCommentPlugins,
		hasVoting,
		hasFlags,
		icons,
		toAbsoluteUrl,
		commentUrl,
		parseContent
	}))
	const threadInfo = {
		board: {
			id: boardId,
			title: boardTitle
		},
		commentsCount,
		commentAttachmentsCount
	}
	const openingPost = posts[0]
	if (openingPost.closed === 1) {
		threadInfo.isLocked = true
	}
	// If the thread is pinned `sticky` will be a number greater than `0`.
	if (openingPost.sticky) {
		threadInfo.isSticky = true
	}
	// "Rolling" threads never go into "bump limit":
	// instead messages are being shifted from the start of
	// such thread as new messages are posted to it.
	// The "opening post" is always preserved.
	if (openingPost.endless === 1) {
		threadInfo.isRolling = true
	}
	if (hasVoting) {
		threadInfo.hasVoting = true
	}
	if (commentsCount >= bumpLimit) {
		threadInfo.isBumpLimitReached = true
	}
	// Is only used for `/res/THREAD-ID.json` API response.
	if (maxCommentLength) {
		threadInfo.maxCommentLength = maxCommentLength
	}
	// Is only used for `/res/THREAD-ID.json` API response.
	if (maxAttachmentsSize) {
		threadInfo.maxAttachmentsSize = maxAttachmentsSize
	}
	threadInfo.updatedAt = new Date(openingPost.lasthit * 1000)
	return constructThread(threadInfo, comments, {
		boardId,
		messages,
		censoredWords,
		commentLengthLimit,
		commentUrlParser,
		expandReplies
	})
}