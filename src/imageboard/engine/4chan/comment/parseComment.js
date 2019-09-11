import unescapeContent from '../../../utility/unescapeContent'
import stringToColor from '../../../utility/stringToColor'

import parseAuthor from './parseAuthor'
import parseAuthorRoleFourChannel from './parseAuthorRole.4chan'
import parseAuthorRoleEightChannel from './parseAuthorRole.8ch'
import parseAttachment from './parseAttachment'

import constructComment from '../../../constructComment'

const USER_BANNED_MARK = /<br><br><b style="color:red;">\(USER WAS BANNED FOR THIS POST\)<\/b>$/

// Actually, `lainchan` doesn't provide the "warnings" in JSON.
// const LAINCHAN_POST_WARNING_REGEXP = /<span class="public_warning">\((.+)\)<\/span>$/

/**
 * Parses response comment JSON object.
 * @param  {object} comment — Response comment JSON object.
 * @param  {object} options
 * @return {object} See README.md for "Comment" object description.
 */
export default function parseComment(post, {
	chan,
	boardId,
	censoredWords,
	parseCommentPlugins,
	commentLengthLimit,
	messages,
	commentUrl,
	commentUrlParser,
	attachmentUrl,
	attachmentThumbnailUrl,
	// `8ch.net` has `fpath: 0/1` parameter.
	attachmentUrlFpath,
	attachmentThumbnailUrlFpath,
	fileAttachmentUrl,
	toAbsoluteUrl,
	defaultAuthorName,
	parseContent
}) {
	let rawComment = post.com
	let authorBanned = false
	// `post.com` is absent when there's no text.
	if (rawComment) {
		// I figured that 4chan places <wbr> ("line break") tags
		// when something not having spaces is longer than 35 characters.
		// `<wbr>` is a legacy HTML tag for explicitly defined "line breaks".
		// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/wbr
		// `4chan.org` inserts `<wbr>` in long URLs every 35 characters
		// presumably to prevent post text overflow.
		// I don't see any point in that because CSS can handle such things
		// using a combination of `overflow-wrap: break-word` and `word-break: break-word`
		// so all `<wbr>`s are simply discarded (otherwise they'd mess with hyperlink autodetection).
		// I could replace all `<wbr>`s with "\u200b"
		// (a "zero-width" space for indicating possible line break points)
		// but then hyperlink autodetection code would have to filter them out,
		// and as I already said above line-breaking long text is handled by CSS.
		// Also `4chan.org` sometimes has `<wbr>` in weird places.
		// For example, given the equation "[math]f(x)=\\frac{x^3-x}{(x^2+1)^2}[<wbr>/math]"
		// `4chan.org` has inserted `<wbr>` after 35 characters of the whole equation markup
		// while in reality it either should not have inserted a `<wbr>` or should have inserted it
		// somewhere other place than the "[/math]" closing tag.
		// https://github.com/4chan/4chan-API/issues/66
		if (chan === '4chan') {
			rawComment = rawComment.replace(/<wbr>/g, '')
		}
		// `8ch.net` adds `<em>:</em>` to links for some weird reason.
		if (chan === '8ch') {
			rawComment = rawComment.replace(/(https?|ftp)<em>:<\/em>/g, '$1:')
		}
		// Test if the author was banned for this post.
		if (chan === '4chan') {
			if (USER_BANNED_MARK.test(rawComment)) {
				authorBanned = true
				rawComment = rawComment.replace(USER_BANNED_MARK, '')
			}
		}
		// // Actually, `lainchan` doesn't provide the "warnings" in JSON.
		// else if (chan === 'lainchan') {
		// 	const match = rawComment.match(LAINCHAN_POST_WARNING_REGEXP)
		// 	if (match) {
		// 		// Maybe not really banned. Maybe just a "warning".
		// 		authorBanned = match[0]
		// 		rawComment = rawComment.replace(LAINCHAN_POST_WARNING_REGEXP, '')
		// 	}
		// }
	}
	const parsedAuthorRole = parseAuthorRole(post, chan, { boardId })
	const comment = constructComment(
		boardId,
		// `resto` is `0` for the first post of the thread.
		post.resto || post.no,
		post.no,
		rawComment,
		parseAuthor(post.name, { defaultAuthorName, boardId }),
		parsedAuthorRole && (chan === '8ch' ? parsedAuthorRole.role : parsedAuthorRole),
		authorBanned,
		// `post.sub` is absent when there's no comment subject.
		// On `4chan.org` and `8ch.net` thread subject sometimes contains
		// escaped characters like "&quot;", "&lt;", "&gt;".
		post.sub && unescapeContent(post.sub),
		parseAttachments(post, {
			chan,
			boardId,
			attachmentUrl,
			attachmentThumbnailUrl,
			// `8ch.net` has `fpath: 0/1` parameter.
			attachmentUrlFpath,
			attachmentThumbnailUrlFpath,
			fileAttachmentUrl,
			toAbsoluteUrl
		}),
		new Date(post.time * 1000),
		{
			censoredWords,
			parseCommentPlugins,
			commentLengthLimit,
			messages,
			commentUrl,
			commentUrlParser,
			parseContent
		}
	)
	if (chan === '8ch' && parsedAuthorRole) {
		comment.authorRoleJurisdiction = parsedAuthorRole.jurisdiction
	}
	// `8ch.net` and `kohlchan.net` (`vichan` engine) have `email` property.
	if (post.email) {
		// I guess those are mobile users with `<input type="text"/>` autocapitalization.
		if (post.email === 'sage' || post.email === 'Sage') {
			comment.isSage = true
		} else {
			comment.authorEmail = post.email
		}
	}
	// `4chan`-alike imageboards (`4chan.org`, `8ch.net`, `kohlchan.net`)
	// identify their posters by a hash of their IP addresses on some boards.
	// For example, `/pol/` on `4chan.org`, `8ch.net`, `kohlchan.net`.
	// `8ch.net` example: 2e20aa, d1e8f1, 000000.
	// `kohlchan.net` examples: a8d15, 90048, a26d4.
	// `4chan.org` examples: Bg9BS7Xl, rhGbaBg/, L/+PhYNf.
	if (post.id) {
		comment.authorId = post.id
		comment.authorIdColor = stringToColor(post.id)
	}
	// `4chan`-alike imageboards (`4chan.org`, `8ch.net`, `kohlchan.net`)
	// displays poster country flags.
	if (post.country) {
		// `8ch.net` and `4chan.org` have correct country codes.
		// Examples: "GB", "US", "RU".
		comment.authorCountry = post.country
		// `captchan` has its own localized country names.
		// comment.authorCountryName = post.country_name
	}
	if (post.trip) {
		comment.tripCode = post.trip
	}
	return comment
}

function parseAuthorRole(post, chan, { boardId }) {
	switch (chan) {
		case '4chan':
			return parseAuthorRoleFourChannel(post.capcode)
		case '8ch':
			return parseAuthorRoleEightChannel(post.capcode, { boardId })
	}
}

function parseAttachments(post, options) {
	if (!post.ext && !post.extra_files) {
		return
	}
	let files = []
	if (post.ext) {
		files.push(post)
	}
	// `kohlchan.net` and `8ch.net` have "extra_files".
	if (post.extra_files) {
		files = files.concat(post.extra_files)
	}
	return files.filter(file => !wasAttachmentDeleted(file, options))
		// On `8ch.net` sometimes a `file` can be just `[]` (which is a bug).
		// For example, one time there was a thread with `extra_files: [ [] ]`.
		// https://github.com/OpenIB/OpenIB/issues/298
		.filter(_ => !Array.isArray(_))
		.map(file => parseAttachment(file, options))
}

function wasAttachmentDeleted(file, { chan }) {
	// `4chan.org` and `kohlchan.net` use `"filedeleted": 0/1`.
	// In case of `"filedeleted": 1` it seems that all file-related
	// properties are also removed from the comment, so
	// strictly speaking there's no need to filter in this case.
	if (file.filedeleted === 1) {
		return true
	}
	// `8ch.net` seems to use `"ext": "deleted"` instead of `"filedeleted": 1`.
	if (chan === '8ch' && file.ext === 'deleted') {
		return true
	}
	return false
}