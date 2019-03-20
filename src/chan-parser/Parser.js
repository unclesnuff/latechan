import generateTextPreview from './generateTextPreview'

export default class Parser {
	constructor({
		parseBoards,
		parseThreads,
		parseThread,
		...rest
	}) {
		this.options = rest
		this._parseBoards = parseBoards
		this._parseThreads = parseThreads
		this._parseThread = parseThread
	}

	parseBoards(response) {
		return this._parseBoards(response, this.options)
	}

	parseThreads(response, { boardId }) {
		return this._parseThreads(response, {
			...this.options,
			boardId
		})
	}

	parseThread(response, { boardId }) {
		const thread = this._parseThread(response, {
			...this.options,
			boardId
		})
		// Text preview is used for `<meta description/>`.
		generateTextPreview(thread.comments[0])
		return thread
	}
}