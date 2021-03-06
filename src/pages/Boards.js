import React from 'react'
import { Link } from 'react-pages'
import { useSelector } from 'react-redux'
import VirtualScroller from 'virtual-scroller/react'

import { Boards } from '../components/Boards'
import BoardUrl from '../components/BoardUrl'
import { getBoards } from '../redux/chan'
import getUrl from '../utility/getUrl'

import getMessages from '../messages'

import './Boards.css'

export default function BoardsPage() {
	const locale = useSelector(({ settings }) => settings.settings.locale)
	const boards = useSelector(({ chan }) => chan.allBoards.boards)
	const boardsByCategory = useSelector(({ chan }) => chan.allBoards.boardsByCategory)
	const boardsByPopularity = useSelector(({ chan }) => chan.allBoards.boardsByPopularity)
	return (
		<section className="boards-page content text-content">
			<Boards
				locale={locale}
				boards={boards}
				boardsByPopularity={boardsByPopularity}
				boardsByCategory={boardsByCategory}
				listComponent={BoardsList}
				showAllBoards/>
		</section>
	)
}

BoardsPage.meta = ({ settings }) => ({
	title: getMessages(settings.settings.locale).boards.title
})

BoardsPage.load = ({ dispatch }) => dispatch(getBoards({ all: true }))

function BoardsList({ className, children }) {
	// On `8ch.net` there're about 20 000 user-created boards.
	// Such a long list would render very slowly without virtualization.
	return (
		<VirtualScroller
			items={children}
			itemComponent={BoardsListItem}
			className={className}/>
	)
}

BoardsList.propTypes = {
	className: PropTypes.string,
	children: PropTypes.arrayOf(PropTypes.shape({
		key: PropTypes.string.isRequired,
		board: PropTypes.object
	})).isRequired
}

function BoardsListItem({ children: { board } }) {
	return (
		<Link
			to={getUrl(board)}
			className="boards-list__item">
			<BoardUrl boardId={board.id} className="boards-list__board-url"/>
			<div className="boards-list__board-name">
				{board.title}
			</div>
		</Link>
	)
}

BoardsListItem.propTypes = {
	children: PropTypes.object.isRequired
}

// Using `React.memo()` so that `virtual-scroller`
// doesn't re-render items as the user scrolls.
BoardsListItem = React.memo(BoardsListItem)