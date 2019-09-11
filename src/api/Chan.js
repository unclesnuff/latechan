import Chan from '../imageboard'
import { getChanConfig, addChanParameter, isDeployedOnChanDomain } from '../chan'
import getProxyUrl from './utility/getProxyUrl'
import getMessages from './utility/getMessages'

export default function Chan_({
	censoredWords,
	messages,
	http
}) {
	return Chan(
		getChanConfig(),
		{
			messages: messages && getMessages(messages),
			censoredWords,
			// `expandReplies` must also be `true` in `./getThread.js`
			// in `addOnContentChange(comment)` function.
			expandReplies: true,
			useRelativeUrls: isDeployedOnChanDomain(),
			// Simply adds `?chan=...` to comment links.
			// By default `commentUrl` is "/{boardId}/{threadId}#{commentId}".
			commentUrl: addChanParameter('/{boardId}/{threadId}#{commentId}'),
			request: (method, url, data) => http[method.toLowerCase()](getProxyUrl(url), data)
		}
	)
}