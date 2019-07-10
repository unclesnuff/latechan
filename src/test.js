import { loadYouTubeLinksTestWithApiKey } from 'webapp-frontend/src/utility/post/loadYouTubeLinks.test'
import './UserData/test'

import configuration from './configuration'

const youTubeApiKey = configuration.youtube && configuration.youtube.apiKey
if (youTubeApiKey) {
	loadYouTubeLinksTestWithApiKey(youTubeApiKey)
}