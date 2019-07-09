import getPostSummary from 'webapp-frontend/src/utility/post/getPostSummary'
import { forEachFollowingQuote } from 'webapp-frontend/src/utility/post/combineQuotes'

/**
 * Adds "in-reply-to" quotes.
 * Has some CPU usage.
 * @return {boolean} [contentDidChange] — Returns `true` if `content` did change (either as a result of setting an in-reply-to quote or as a result of setting "deleted post"/"hidden post" flag).
 */
export default function setInReplyToQuotes(content, getPostById, options, contentParent, isLastInParagraph = true) {
	if (Array.isArray(content)) {
		let i = 0
		let contentDidChange = false
		while (i < content.length) {
			const part = content[i]
			const partsCount = content.length
			if (setInReplyToQuotes(
				part,
				getPostById,
				options,
				content,
				contentParent ? (isLastInParagraph && i === content.length - 1) : true
			)) {
				contentDidChange = true
			}
			// Check if some elements have been removed
			// (or maybe hypothetically added)
			// in which case adjust the cycle index.
			if (content.length !== partsCount) {
				i += content.length - partsCount
			}
			i++
		}
		return contentDidChange
	}
	// Post content can be empty.
	// Or maybe even post part's content.
	// Like `{ type: 'attachment', attachmentId: 1 }`.
	if (!content) {
		return
	}
	if (typeof content === 'string') {
		return
	}
	if (content.type === 'post-link') {
		// Autogenerated parent post quotes are updated after YouTube videos have been loaded.
		// If non-autogenerated post quote for this post link has already been set then skip it.
		if (Array.isArray(content.content) && content.content[0].type === 'quote') {
			if (!content.quoteAutogenerated) {
				return
			}
		}
		// If it's a post link for a post from another thread then skip it.
		if (content.threadId && content.threadId !== options.threadId) {
			return
		}
		// Get the post being quoted.
		// `Array.find()` is slow for doing it every time.
		// A "postsById" index is much faster.
		const quotedPost = getPostById(content.postId)
		// If the quoted post has been deleted then skip it.
		if (!quotedPost) {
			content.postWasDeleted = true
			// Content did change.
			return true
		}
		// If the quoted post is hidden then don't add a quote it a link to it.
		if (quotedPost.hidden) {
			content.postIsHidden = true
			content.postIsHiddenRule = quotedPost.hiddenRule
			// Content did change.
			return true
		}
		// If the quoted post link is the last content element in the post then
		// don't perform further checks and generate the quote for the quoted post.
		if (isLastInParagraph) {
			setPostLinkQuote(content, quotedPost, options)
			return true
		}
		// The post link must be in the end of a line
		// in order for a post quote to be generated.
		const index = contentParent.indexOf(content)
		if (contentParent[index + 1] !== '\n') {
			return
		}
		// `kohlchan.net` and `8ch.net` have regular (green) quotes
		// and "inverse" (red) quotes.
		let canCombineQuotes = true
		const combinedQuotes = []
		// See if there's already an existing post quote for this post link.
		// (composed manually by post author)
		const startFromIndex = index + 2
		const followingQuotesCount = forEachFollowingQuote(contentParent, startFromIndex, (quote, i) => {
			// A post link quote is rendered as a hyperlink
			// and having nested hyperlinks will result in invalid HTML markup.
			// To prevent that, strip links from the quote.
			stripLinks(quote.content)
			if (canCombineQuotes) {
				// `kohlchan.net` and `8ch.net` have regular (green) quotes
				// and "inverse" (red) quotes.
				// Can only combine quotes of same "kind".
				if (quote.kind === contentParent[startFromIndex].kind) {
					combinedQuotes.push(quote)
				} else {
					canCombineQuotes = false
				}
			}
			if (!canCombineQuotes) {
				// Transform the quote to a post-link quote.
				contentParent[i] = {
					...content
				}
				delete contentParent[i].quoteKind
				delete contentParent[i].quoteKinds
				// Set `post-link` quote.
				contentParent[i].content = [quote]
				// `kohlchan.net` and `8ch.net` have regular (green) quotes
				// and "inverse" (red) quotes.
				if (quote.kind) {
					contentParent[i].quoteKind = quote.kind
				}
			}
		})
		if (followingQuotesCount > 0) {
			if (combinedQuotes.length === 1) {
				const quote = combinedQuotes[0]
				content.content = [quote]
				if (quote.kind) {
					content.quoteKind = quote.kind
				}
			} else {
				content.content = combinedQuotes
				if (combinedQuotes.find(_ => _.kind)) {
					content.quoteKinds = combinedQuotes.map(_ => _.kind)
				}
			}
			// Remove the combined quotes and "\n"s before them from post content.
			contentParent.splice(index + 1, combinedQuotes.length * 2)
		} else {
			// Autogenerate `post-link` quote text.
			setPostLinkQuote(content, quotedPost, options)
		}
		return true
	}
	// Recurse into post parts.
	return setInReplyToQuotes(content.content, getPostById, options, content, isLastInParagraph)
}

// Inline quotes can contain hyperlinks too. For example,
// `2ch.hk` autoparses links in comment text when it's submitted
// and if there's a quoted link then it will autoparse that link.
// Such nested links would result in a React warning:
// "validateDOMNesting(...): <a> cannot appear as a descendant of <a>.".
function stripLinks(content) {
	if (Array.isArray(content)) {
		let i = 0
		while (i < content.length) {
			if (typeof content[i] === 'object') {
				// Handling just a simple case here
				// and not recursing into nested arrays.
				if ((content[i].type === 'link' || content[i].type === 'post-link') &&
					typeof content[i].content === 'string') {
					content[i] = content[i].content
				}
			}
			i++
		}
	}
}

function setPostLinkQuote(postLink, post, options) {
	const text = getPostSummary(post.content, post.attachments, {
		messages: options && options.messages,
		maxLength: 180,
		countNewLines: true,
		fitFactor: 1.35
	})
	if (text) {
		// Set `content.quote` to the quoted post text abstract.
		// Doesn't set `content.post` object to prevent JSON circular structure.
		// Compacts multiple paragraphs into multiple lines.
		postLink.content = [{
			type: 'quote',
			content: text
		}]
		postLink.quoteAutogenerated = true
	}
}