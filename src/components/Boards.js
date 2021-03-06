import React, { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-pages'
import { useSelector, useDispatch } from 'react-redux'
import { TextInput, Button } from 'react-responsive-ui'
import classNames from 'classnames'

import { getChan, addChanParameter } from '../chan'
import getMessages from '../messages'
import getUrl from '../utility/getUrl'
import { isThreadLocation, isBoardLocation } from '../utility/routes'
import { saveBoardsView } from '../redux/settings'

import BoardUrl from './BoardUrl'

import SearchIcon from 'webapp-frontend/assets/images/icons/menu/search-outline.svg'

import './Boards.css'

export default function BoardsInSidebar(props) {
	const favoriteBoards = useSelector(({ favoriteBoards }) => favoriteBoards.favoriteBoards)
	const boards = useSelector(({ chan }) => chan.boards)
	const boardsByPopularity = useSelector(({ chan }) => chan.boardsByPopularity)
	const boardsByCategory = useSelector(({ chan }) => chan.boardsByCategory)
	const exceptFavoriteBoards = useCallback((boards) => {
		return boards && boards.filter(board => !favoriteBoards.find(_ => _.id === board.id))
	}, [favoriteBoards])
	const _boards = useMemo(() => exceptFavoriteBoards(boards), [boards, exceptFavoriteBoards])
	const _boardsByPopularity = useMemo(() => exceptFavoriteBoards(boardsByPopularity), [boardsByPopularity, exceptFavoriteBoards])
	const _boardsByCategory = useMemo(() => exceptFavoriteBoards(boardsByCategory), [boardsByCategory, exceptFavoriteBoards])
	const hasMoreBoards = useSelector(({ chan }) => chan.hasMoreBoards)
	const selectedBoard = useSelector(({ chan }) => chan.board)
	const boardsView = useSelector(({ settings }) => settings.settings.boardsView)
	return (
		<Boards
			highlightSelectedBoard
			shouldSaveBoardsView
			boards={_boards}
			boardsByPopularity={_boardsByPopularity}
			boardsByCategory={_boardsByCategory}
			hasMoreBoards={hasMoreBoards}
			selectedBoard={selectedBoard}
			boardsView={boardsView}
			{...props}/>
	)
}

export function FavoriteBoards(props) {
	const selectedBoard = useSelector(({ chan }) => chan.board)
	return (
		<Boards
			showAllBoardsLink={false}
			selectedBoard={selectedBoard}
			highlightSelectedBoard
			{...props}/>
	)
}

// `<Boards/>` are used in `pages/Boards.js`.
export function Boards({
	boards,
	boardsByPopularity,
	boardsByCategory,
	boardsView: boardsViewSetting,
	shouldSaveBoardsView,
	showAllBoards,
	showAllBoardsLink,
	listComponent,
	selectedBoard,
	highlightSelectedBoard,
	hasMoreBoards,
	className
}) {
	const dispatch = useDispatch()
	const locale = useSelector(({ settings }) => settings.settings.locale)
	const isBoardOrThreadLocation = useSelector(({ found }) => {
		return isBoardLocation(found.resolvedMatch) ||
			isThreadLocation(found.resolvedMatch)
	})
	const [searchQuery, setSearchQuery] = useState()
	const [filteredBoards, setFilteredBoards] = useState()
	const [view, setView] = useState()
	const defaultBoardsView = getBoardsView(boardsViewSetting, {
		canViewByCategory: boardsByCategory && (listComponent === BoardsList),
		canViewByPopularity: boardsByPopularity
	})
	const boardsView = view || defaultBoardsView
	const onSetView = useCallback((view) => {
		setView(view)
		if (shouldSaveBoardsView) {
			dispatch(saveBoardsView(view))
		}
	}, [dispatch])
	const onChangeViewAllBoards = useCallback(() => onSetView('list'), [])
	const onChangeViewByCategory = useCallback(() => onSetView('by-category'), [])
	const onSearchQueryChange = useCallback((query) => {
		query = query.toLowerCase()
		setSearchQuery(query)
		setFilteredBoards((boards || boardsByPopularity).filter((board) => {
			// Some boards on `8ch.net` don't have a name.
			return (board.title && board.title.toLowerCase().includes(query)) ||
				board.id.toLowerCase().includes(query)
		}))
	}, [boards, boardsByPopularity])
	const isBoardSelected = useCallback((board) => {
		return highlightSelectedBoard &&
			isBoardOrThreadLocation &&
			board.id === selectedBoard.id
	}, [highlightSelectedBoard, isBoardOrThreadLocation, selectedBoard])
	const getBoardsListItems = useCallback(() => {
		switch (boardsView) {
			case 'by-category':
				return boardsByCategory.reduce((all, category, i) => {
					return all.concat([{
						key: category.category || '—',
						category: category.category,
						first: i === 0
					}]).concat(category.boards.map((board) => ({
						key: board.id,
						board,
						selected: isBoardSelected(board)
					})))
				}, [])
			case 'list':
				return (filteredBoards || boardsByPopularity || boards)
					.filter(board => showAllBoards || !board.isHidden)
					.map((board) => ({
						key: board.id,
						board,
						selected: isBoardSelected(board)
					}))
			default:
				// Unsupported `boardsView`.
				return []
			}
	}, [
		boardsView,
		boards,
		boardsByPopularity,
		boardsByCategory,
		filteredBoards,
		isBoardSelected,
		showAllBoards
	])
	if (!boards) {
		return null
	}
	const List = listComponent
	return (
		<nav className="boards">
			{boardsByPopularity && (boardsByCategory && List === BoardsList) &&
				<div className="boards__view-switcher">
					<Button
						disabled={boardsView === 'list'}
						onClick={onChangeViewAllBoards}
						className={classNames('boards__view-switch', {
							'boards__view-switch--disabled': boardsView === 'list'
						})}>
						{getMessages(locale).boards.byPopularity}
					</Button>

					<Button
						disabled={boardsView === 'by-category'}
						onClick={onChangeViewByCategory}
						className={classNames('boards__view-switch', {
							'boards__view-switch--disabled': boardsView === 'by-category'
						})}>
						{getMessages(locale).boards.byCategory}
					</Button>
				</div>
			}

			{showAllBoards && boardsView === 'list' &&
				<TextInput
					type="search"
					autoFocus
					icon={SearchIcon}
					placeholder={getMessages(locale).search}
					value={searchQuery}
					onChange={onSearchQueryChange}
					className="boards__search"/>
			}

			{showAllBoards && boardsView === 'list' && searchQuery && filteredBoards.length === 0 &&
				<div className="boards__nothing-found">
					{getMessages(locale).noSearchResults}
				</div>
			}

			<List
				className={classNames('boards-list', {
					'boards-list--grid': List === BoardsList,
					// 'boards-list--list': boardsView === 'list',
					'boards-list--by-category': boardsView === 'by-category'
				})}>
				{getBoardsListItems()}
			</List>

			{!showAllBoards && showAllBoardsLink && (hasMoreBoards || getChan().hideBoardCategories) &&
				<div className="boards__show-all-wrapper">
					<Link to={addChanParameter('/boards')} className="boards__show-all">
						{getMessages(locale).boards.showAll}
					</Link>
				</div>
			}
		</nav>
	)
}

const boardShape = {
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	commentsPerHour: PropTypes.number
}

Boards.propTypes = {
	boards: PropTypes.arrayOf(PropTypes.shape(boardShape)).isRequired,
	boardsByPopularity: PropTypes.arrayOf(PropTypes.shape(boardShape)),
	boardsByCategory: PropTypes.arrayOf(PropTypes.shape({
		category: PropTypes.string.isRequired,
		boards: PropTypes.arrayOf(PropTypes.shape(boardShape)).isRequired
	})),
	boardsView: PropTypes.string,
	shouldSaveBoardsView: PropTypes.bool,
	showAllBoards: PropTypes.bool,
	showAllBoardsLink: PropTypes.bool.isRequired,
	selectedBoard: PropTypes.shape(boardShape),
	highlightSelectedBoard: PropTypes.bool,
	// isBoardOrThreadLocation: PropTypes.bool,
	hasMoreBoards: PropTypes.bool,
	// locale: PropTypes.string.isRequired,
	// dispatch: PropTypes.func,
	listComponent: PropTypes.elementType.isRequired,
	className: PropTypes.string
}

Boards.defaultProps = {
	listComponent: BoardsList,
	showAllBoardsLink: true
}

// // Don't re-render `<Boards/>` on page navigation (on `route` change).
// // Re-rendering `<Boards/>` is about `150` ms (which is a lot).
// // (seems that rendering a `<Link/>` is a long time).
// Boards = React.memo(Boards)

function Board({
	board,
	isSelected
}) {
	const [isHovered, setHovered] = useState()
	const [isActive, setActive] = useState()
	// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/pointerout_event
	// The pointerout event is fired for several reasons including:
	// * pointing device is moved out of the hit test boundaries of an element (`pointerleave`);
	// * firing the pointerup event for a device that does not support hover (see `pointerup`);
	// * after firing the pointercancel event (see `pointercancel`);
	// * when a pen stylus leaves the hover range detectable by the digitizer.
	const onPointerEnter = useCallback(() => setHovered(true), [])
	const onPointerOut = useCallback(() => {
		setHovered(false)
		setActive(false)
	}, [])
	const onPointerDown = useCallback(() => setActive(true), [])
	const onPointerUp = useCallback(() => setActive(false), [])
	const onDragStart = onPointerOut
	// Safari doesn't support pointer events.
	// https://caniuse.com/#feat=pointer
	// https://webkit.org/status/#?search=pointer%20events
	// onPointerDown={onPointerDown}
	// onPointerUp={onPointerUp}
	// onPointerEnter={onPointerEnter}
	// onPointerOut={onPointerOut}
	return (
		<React.Fragment>
			<Link
				to={getUrl(board)}
				title={board.title}
				tabIndex={-1}
				onDragStart={onDragStart}
				onMouseDown={onPointerDown}
				onMouseUp={onPointerUp}
				onMouseEnter={onPointerEnter}
				onMouseLeave={onPointerOut}
				className="boards-list__board-url-link">
				<BoardUrl
					boardId={board.id}
					className={classNames('boards-list__board-url', {
						'boards-list__board-url--selected': isSelected,
						'boards-list__board-url--hover': isHovered,
						'boards-list__board-url--active': isActive
					})}/>
			</Link>
			<Link
				to={getUrl(board)}
				title={board.title}
				onDragStart={onDragStart}
				onMouseDown={onPointerDown}
				onMouseUp={onPointerUp}
				onMouseEnter={onPointerEnter}
				onMouseLeave={onPointerOut}
				className={classNames('boards-list__board-name', {
					'boards-list__board-name--selected': isSelected,
					'boards-list__board-name--hover': isHovered,
					'boards-list__board-name--active': isActive
				})}>
				{board.title}
			</Link>
		</React.Fragment>
	)
}

Board.propTypes = {
	board: PropTypes.shape(boardShape).isRequired,
	isSelected: PropTypes.bool
}

function BoardsList({ className, children }) {
	return (
		<div className={className}>
			{children.map((item) => (
				<BoardsListItem {...item}/>
			))}
		</div>
	)
}

BoardsList.propTypes = {
	className: PropTypes.string,
	children: PropTypes.arrayOf(PropTypes.shape({
		// `key` is used in `pages/Boards.js`.
		key: PropTypes.string.isRequired,
		board: PropTypes.object,
		selected: PropTypes.bool,
		first: PropTypes.bool,
		category: PropTypes.string
	})).isRequired
}

function BoardsListItem({ category, board, selected, first }) {
	if (board) {
		return (
			<Board
				board={board}
				isSelected={selected}/>
		)
	}
	return (
		<React.Fragment key={category || '—'}>
			<div className="boards-list-section__pre-title"/>
			<h2 className={classNames('boards-list-section__title', {
				'boards-list-section__title--first': first
			})}>
				{category}
			</h2>
		</React.Fragment>
	)
}

BoardsListItem.propTypes = {
	// `key` is used in `pages/Boards.js`.
	key: PropTypes.string.isRequired,
	board: PropTypes.object,
	category: PropTypes.string,
	selected: PropTypes.bool,
	first: PropTypes.bool
}

// Re-rendering the full `<Boards/>` list is about `150` ms (which is a lot).
// (seems that rendering a `<Link/>` is a long time).
BoardsListItem = React.memo(BoardsListItem)

function getBoardsView(boardsView, { canViewByCategory, canViewByPopularity }) {
	switch (boardsView) {
		case 'by-category':
			if (canViewByCategory) {
				return boardsView
			}
		case 'list':
			return boardsView
	}
	if (canViewByPopularity) {
		return 'list'
	}
	if (canViewByCategory) {
		return 'by-category'
	}
	return 'list'
}