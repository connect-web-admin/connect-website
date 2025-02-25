import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import EventView from '@/views/EventView.vue'
import ClubListView from '@/views/ClubListView.vue'
import LatestResultsView from '@/views/LatestResultsView.vue'
import TopicsView from '@/views/TopicsView.vue'
import RegisterMatchResultView from '@/views/connecter/RegisterMatchResultView.vue'
import SelectMatchToRegisterResultView from '@/views/connecter/SelectMatchToRegisterResultView.vue'
import ConnecterHomeView from '@/views/connecter/ConnecterHomeView.vue'
import ContactView from '@/views/ContactView.vue'
import AuthenticatedContentsView from '@/views/AuthenticatedContentsView.vue'
import UnauthorizedMessageView from '@/views/UnauthorizedMessageView.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'Home',
			component: App,
		},

		{
			path:'/contact',
			name: 'Contact',
			component: ContactView
		},

		{
			path: '/authenticated-contents',
			name: 'AuthenticatedContents',
			component: AuthenticatedContentsView,
		},

		{
			path: '/unauthorized-message',
			name: 'UnauthorizedMessage',
			component: UnauthorizedMessageView,
		},


		// コネクター用のルーティング
		{
			path:'/connecter/home',
			name: 'ConnecterHome',
			component: ConnecterHomeView
		},

		{
			path: '/connecter/select-match-to-register-result',
			name: 'SelectMatchToRegisterResult',
			component: SelectMatchToRegisterResultView,
		},

		{
			path: '/connecter/register-match-result/:championshipId/:matchId',
			name: 'RegisterMatchResult',
			component: RegisterMatchResultView,
			props: true
		},

		// 一般会員（暫定）向けのルーティング
		{
			path: '/event-view',
			name: 'EventView',
			component: EventView,
		},

		{
			path: '/latest-results',
			name: 'LatestResults',
			component: LatestResultsView,
		},

		{
			path: '/topics',
			name: 'Topics',
			component: TopicsView,
		},

		{
			path: '/club-list',
			name: 'ClubList',
			component: ClubListView,
		}
	],
})

export default router