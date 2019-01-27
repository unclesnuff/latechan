/**
 * Adds "in-reply-to" quotes.
 * Has some CPU usage.
 */
export default function setInReplyToQuotes(content, posts, threadId, contentParent) {
	if (Array.isArray(content)) {
		for (const part of content) {
			setInReplyToQuotes(part, posts, threadId, content)
		}
		return
	}
	if (typeof content === 'string') {
		return
	}
	if (typeof content === 'object' && content.type === 'post-link') {
		let postPeek
		if (content.threadId === threadId) {
			content.post = posts.find(_ => _.id === content.postId)
			if (content.post && content.post.content) {
				for (const part of content.post.content[0]) {
					if (typeof part === 'string' && part !== '\n') {
						postPeek = limitLength(part, 150)
						const index = contentParent.indexOf(content)
						const possibleQuote = contentParent[index + 2]
						if (possibleQuote && possibleQuote.type === 'quote') {
							// Already quoted.
						} else {
							contentParent.splice(index + 1, 0, '\n')
							contentParent.splice(index + 2, 0, { type: 'quote', content: postPeek })
						}
						break
					}
				}
			}
		}
		content.content = 'Сообщение'
	}
}

function limitLength(string, maxLength) {
	if (string.length <= maxLength) {
		return string
	}
	string = string.slice(0, maxLength)
	const lastSentenceEndsAt = string.lastIndexOf('. ')
	if (lastSentenceEndsAt >= 0) {
		return string.slice(0, lastSentenceEndsAt)
	}
	return string + '…'
}