import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Link } from 'react-pages'
import classNames from 'classnames'

import ExternalLink from 'webapp-frontend/src/components/ExternalLink'

import { getChan } from '../chan'
import getMessages from '../messages'

import './Error.css'

export default function ErrorPage({
	status
}) {
	const locale = useSelector(({ settings }) => settings.settings.locale)
	const location = useSelector(({ found }) => found.resolvedMatch.location)
	const offline = useSelector(({ app }) => app.offline)
	const custom = getChan().errorPages && getChan().errorPages[status]
	const messages = getMessages(locale).errorPages[status]
	const LinkComponent = offline ? ExternalLink : Link
	return (
		<section className={classNames('error-page', {
			'error-page--image': custom && custom.images
		})}>
			<div className="content text-content">
				<h1 className="error-page__title">
					{messages.title}
				</h1>
				{messages.description &&
					<p className="error-page__description">
						{messages.description}
					</p>
				}
				{custom && custom.images &&
					<img
						aria-hidden
						src={getRandomElement(custom.images)}
						className="error-page__image"/>
				}
				{location.query.url &&
					<LinkComponent to={location.query.url} className="error-page__requested-url">
						{getMessages(locale).errorPages.requestedURL}
					</LinkComponent>
				}
			</div>
		</section>
	)
}

ErrorPage.propTypes = {
	// locale: PropTypes.string.isRequired,
	// location: PropTypes.object.isRequired,
	// offline: PropTypes.boolean,
	status: PropTypes.number.isRequired
}

ErrorPage.defaultProps = {
	status: 500
}

ErrorPage.meta = ({ settings }) => ({
	title: getMessages(settings.settings.locale).errorPages['500'].title
})

function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)]
}