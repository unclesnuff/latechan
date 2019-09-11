import unescapeContent from '../../../utility/unescapeContent'
import stringToColor from '../../../utility/stringToColor'

import parseAuthorRoleKohlChan from './parseAuthorRole.kohlchan'
import parseAuthor from './parseAuthor'
import parseAttachment, { getPictureTypeFromUrl, guessFileUrlFromThumbnailUrl } from './parseAttachment'

import constructComment from '../../../constructComment'

/**
 * Parses response comment JSON object.
 * @param  {object} comment — Response comment JSON object.
 * @param  {object} options
 * @return {object} See README.md for "Comment" object description.
 */
export default function parseComment(post, {
	chan,
	boardId,
	threadId,
	censoredWords,
	parseCommentPlugins,
	commentLengthLimit,
	messages,
	commentUrl,
	commentUrlParser,
	emojiUrl,
	attachmentUrl,
	attachmentThumbnailUrl,
	thumbnailSize,
	toAbsoluteUrl,
	defaultAuthorName,
	parseContent
}) {
	// `post.markdown` is not really "markdown", it's HTML.
	// `lynxchan` has a bug of inserting "carriage return" (U+000D)
	// characters before every "new line" (<br>).
	// This workaround fixes that:
	const rawComment = post.markdown.replace(/\u000d/g, '')
	const parsedAuthorRole = parseAuthorRole(post.signedRole, chan)
	let files = post.files
	let isLynxChanCatalogAttachmentsBug
	// In `/catalog.json` API response there're no `files`, only `thumb` property, which is a bug.
	// http://lynxhub.com/lynxchan/res/722.html#q984
	if (!files) {
		if (post.thumb) {
			isLynxChanCatalogAttachmentsBug = true
			files = [{
				// A stub for the absent `files` bug in `/catalog.json` API response.
				// http://lynxhub.com/lynxchan/res/722.html#q984
				mime: getPictureTypeFromUrl(post.thumb, chan),
				// `lynxchan` doesn't provide `width` and `height`
				// neither for the picture not for the thumbnail
				// in `/catalog.json` API response (which is a bug).
				// http://lynxhub.com/lynxchan/res/722.html#q984
				// `width` and `height` are set later when the image is loaded.
				width: thumbnailSize,
				height: thumbnailSize,
				// Even if `path` URL would be derived from `thumb` URL
				// the `width` and `height` would still be unspecified.
				// path: post.thumb,
				path: guessFileUrlFromThumbnailUrl(post.thumb, chan),
				thumb: post.thumb,
				originalName: '[stub]'
			}]
		} else {
			files = []
		}
	}
	const comment = constructComment(
		boardId,
		threadId,
		post.threadId || post.postId,
		rawComment,
		parseAuthor(post.name, { defaultAuthorName, boardId }),
		parsedAuthorRole && (chan === 'kohlchan' ? parsedAuthorRole.role : parsedAuthorRole),
		post.banMessage, // '(USER WAS BANNED FOR THIS POST)'
		// `post.subject` is `null` when there's no comment subject.
		// `lynxchan` thread subject sometimes contains
		// escaped characters like "&quot;", "&lt;", "&gt;".
		post.subject && unescapeContent(post.subject),
		files.length === 0 ? undefined : files.map(file => parseAttachment(file, {
			chan,
			boardId,
			attachmentUrl,
			attachmentThumbnailUrl,
			thumbnailSize,
			toAbsoluteUrl
		})),
		// In `/catalog.json` API response there's no `creation` property which is a bug.
		// http://lynxhub.com/lynxchan/res/722.html#q984
		post.creation ? new Date(post.creation) : undefined,
		{
			censoredWords,
			parseCommentPlugins,
			commentLengthLimit,
			messages,
			commentUrl,
			commentUrlParser,
			parseContent,
			emojiUrl,
			toAbsoluteUrl
		}
	)
	if (post.email) {
		if (post.email === 'sage') {
			comment.isSage = true
		} else {
			comment.authorEmail = post.email
		}
	}
	// Imageboards identify their posters by a hash of their IP addresses on some boards.
	// For example, `/pol/` on `kohlchan.net`.
	// `kohlchan.net` examples: eeac31, 0501f9.
	if (post.id) {
		comment.authorId = post.id
		comment.authorIdColor = stringToColor(post.id)
	}
	// `4chan`-alike imageboards (`4chan.org`, `8ch.net`, `kohlchan.net`)
	// displays poster country flags.
	if (post.flag) {
		const flagId = parseKohlchanFlagId(post.flag)
		let country
		if (FLAG_ID_COUNTRY_CODE_REGEXP.test(flagId)) {
			country = flagId.toUpperCase()
		}
		if (country) {
			comment.authorCountry = country
		} else {
			// `post.flagCode` is `null` for "Onion" flag:
			// ```
			// flag: "/.static/flags/onion.png"
			// flagCode: null
			// flagName: "Onion"
			// ````
			// comment.authorIconId = flagId
			comment.authorIconUrl = post.flag
			comment.authorIconName = post.flagName
		}
	}
	if (isLynxChanCatalogAttachmentsBug) {
		comment.attachments[0].isLynxChanCatalogAttachmentsBug = true
	}
	return comment
}

function parseAuthorRole(role, chan) {
	switch (chan) {
		case 'kohlchan':
			return parseAuthorRoleKohlChan(role)
	}
}

// "/.static/flags/onion.png" ->  "onion".
// "/.static/flags/vsa/ca.png" -> "vsa/ca". (California)
const FLAG_ID_REGEXP = /^\/\.static\/flags\/(.+)\.png$/
function parseKohlchanFlagId(flag) {
	const match = flag.match(FLAG_ID_REGEXP)
	if (match) {
		return match[1]
	}
}

// "br".
const FLAG_ID_COUNTRY_CODE_REGEXP = /^([a-z]{2})$/