import React from 'react'
import PropTypes from 'prop-types'
import { goto, Link } from 'react-website'
import { connect } from 'react-redux'
import { Button } from 'react-responsive-ui'
import classNames from 'classnames'

import {
	ContentSection
} from 'webapp-frontend/src/components/ContentSection'

import { notify } from 'webapp-frontend/src/redux/notifications'

import { addChanParameter } from '../chan'
import getMessages from '../messages'

import './Boards.css'

@connect(({ account, chan }) => ({
	locale: account.settings.locale,
	boards: chan.boards,
	boardsByCategory: chan.boardsByCategory
}))
class Boards extends React.Component {
	state = {
		view: 'default'
	}

	onChangeViewBySpeed = () => this.setState({ view: 'default' })
	onChangeViewByCategory = () => this.setState({ view: 'by-category' })

	render() {
		const {
			locale,
			boards,
			boardsByCategory
		} = this.props

		const { view } = this.state

		if (!boards) {
			return null
		}

		return (
			<section className="boards">
				{boardsByCategory &&
					<div className="boards__view-switcher">
						<Button
							onClick={this.onChangeViewBySpeed}
							className={classNames('boards__view-switch', {
								'boards__view-switch--selected': view === 'default'
							})}>
							{getMessages(locale).boardsList}
						</Button>

						<div className="boards__view-switch-divider"/>

						<Button
							onClick={this.onChangeViewByCategory}
							className={classNames('boards__view-switch', {
								'boards__view-switch--selected': view === 'by-category'
							})}>
							{getMessages(locale).boardsByCategory}
						</Button>
					</div>
				}

				<table className={classNames('boards-list', {
					'boards-list--default': view === 'default',
					'boards-list--default-has-categories': boardsByCategory
				})}>
					<tbody>
						{view === 'by-category' && boardsByCategory && boardsByCategory.map((category, i) => (
							<React.Fragment key={category.category}>
								<tr>
									<td/>
									<td>
										<h2 className={classNames('boards-list-section__title', {
											'boards-list-section__title--first': i === 0
										})}>
											{category.category}
										</h2>
									</td>
								</tr>
								{category.boards.map((board) => (
									<Board
										key={board.id}
										board={board}/>
								))}
							</React.Fragment>
						))}
						{view === 'default' && boards.map((board) => (
							<Board
								key={board.id}
								board={board}/>
						))}
					</tbody>
				</table>
			</section>
		)
	}
}

const boardShape = {
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	info: PropTypes.string,
	speed: PropTypes.number.isRequired
}

Boards.propTypes = {
	expanded: PropTypes.bool.isRequired,
	boards: PropTypes.arrayOf(PropTypes.shape({
		...boardShape
	})),
	boardsByCategory: PropTypes.arrayOf(PropTypes.shape({
		category: PropTypes.string.isRequired,
		boards: PropTypes.arrayOf(PropTypes.shape(boardShape)).isRequired
	}))
}

Boards.defaultProps = {
	expanded: false
}

// @connect(({ account }) => ({
// 	locale: account.settings.locale
// }), {
// 	goto,
// 	notify
// })
class Board extends React.Component {
	constructor() {
		super()
		// this.onBoardClick = this.onBoardClick.bind(this)
	}

	// async onBoardClick(event) {
	// 	event.preventDefault()
	// 	const {
	// 		board,
	// 		locale,
	// 		goto,
	// 		notify
	// 	} = this.props
	// 	try {
	// 		// Won't ever throw because `goto()` doesn't return a `Promise`.
	// 		goto(this.getUrl())
	// 	} catch (error) {
	// 		notify(getMessages(locale).loadingThreadsError, { type: 'error '})
	// 	}
	// }

	getUrl() {
		const { board } = this.props
		return addChanParameter(`/${board.id}`)
	}

	render() {
		const { board } = this.props
		return (
			<tr
				key={board.id}
				className="boards-list__board-row"
				title={board.info || board.name}>
				<td className="boards-list__board-container">
					<Link
						to={this.getUrl()}
						className="boards-list__board-url">
						{board.id}
					</Link>
				</td>
				<td className="boards-list__board-name-container">
					<Link
						to={this.getUrl()}
						className="boards-list__board-name">
						{board.name}
					</Link>
				</td>
			</tr>
		)
	}
}

Board.propTypes = {
	boards: PropTypes.shape(boardShape)
}

function isBoardLocation({ location, params }) {
	return params.board
}

function isThreadLocation({ location, params }) {
	return params.thread
}

@connect(({ found, account }) => ({
  route: found.resolvedMatch,
  locale: account.settings.locale
}))
export default class BoardsComponent extends React.Component {
	state = {
		isExpanded: undefined
	}

	toggleBoardsList = (event) => {
		this.setState({
			isExpanded: !this.state.isExpanded
		})
	}

	render() {
		const { route, locale } = this.props
		let { isExpanded } = this.state
		if (isExpanded === undefined) {
			if (isBoardLocation(route) || isThreadLocation(route)) {
				isExpanded = false
			} else {
				isExpanded = true
			}
		}
		return (
			<div>
				<div className={classNames('boards__toggle-wrapper', {
					'boards__toggle-wrapper--collapse-boards-list-on-small-screens': !isExpanded
				})}>
					<button
						onClick={this.toggleBoardsList}
						className="boards__toggle rrui__button-reset">
						{getMessages(locale).showBoardsList}
					</button>
				</div>
				<ContentSection className={classNames({
					'boards__container--collapse-boards-list-on-small-screens': !isExpanded
				})}>
					<Boards/>
				</ContentSection>
			</div>
		)
	}
}