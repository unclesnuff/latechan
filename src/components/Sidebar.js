import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { useSelector } from 'react-redux'

import SimpleBar from 'simplebar-react'

import Boards from './Boards'
import Notifications from './Notifications'
import SidebarSection from './SidebarSection'
import SidebarMenu from './SidebarMenu'

import FavoriteBoardsSidebarSection from './FavoriteBoardsSidebarSection'
import TrackedThreadsSidebarSection from './TrackedThreadsSidebarSection'

import getMessages from '../messages'

import './Sidebar.css'

export default function Sidebar() {
	// {mode === 'boards' && <Boards/>}
	// {mode === 'tracked-threads' && <TrackedThreads/>}
	// {mode === 'notifications' && <Notifications/>}
	const locale = useSelector(({ settings }) => settings.settings.locale)
	const isShown = useSelector(({ app }) => app.isSidebarShown)
	const mode = useSelector(({ app }) => app.sidebarMode)
	const favoriteBoards = useSelector(({ favoriteBoards }) => favoriteBoards.favoriteBoards)
	return (
		<section className={classNames('Sidebar', {
			'Sidebar--show': isShown
		})}>
			<SimpleBar className="sidebar__scrollable-list">
				<SidebarSection title={getMessages(locale).menu} className="SidebarSection--menu">
					<SidebarMenu/>
				</SidebarSection>
				<TrackedThreadsSidebarSection/>
				<FavoriteBoardsSidebarSection/>
				<SidebarSection title={favoriteBoards.length > 0 ? getMessages(locale).boards.moreBoards : getMessages(locale).boards.title}>
					<Boards/>
				</SidebarSection>
			</SimpleBar>
		</section>
	)
}

Sidebar.propTypes = {
	// isShown: PropTypes.bool,
	// locale: PropTypes.string.isRequired,
	// mode: PropTypes.string.isRequired
}