import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import FinishLiveReportView from '@/views/connecter/FinishLiveReportView.vue'
import EventView from '@/views/EventView.vue'
import ClubListView from '@/views/ClubListView.vue'
import LatestResultsView from '@/views/LatestResultsView.vue'
import TopicsView from '@/views/TopicsView.vue'
import RegisterMatchResultView from '@/views/connecter/RegisterMatchResultView.vue'
import SelectMatchToRegisterResultView from '@/views/connecter/SelectMatchToRegisterResultView.vue'
import ConnecterHomeView from '@/views/connecter/ConnecterHomeView.vue'
import ContactView from '@/views/ContactView.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'HOME',
			component: App,
		},

		{
			path:'/contact',
			name: 'CONTACT',
			component: ContactView
		},



		// コネクター用のルーティング
		{
			path:'/connecter_home',
			name: 'CONNECTER_HOME',
			component: ConnecterHomeView
		},

		{
			path: '/select_match_to_register_result',
			name: 'SELECT_MATCH_TO_REGISTER_RESULT',
			component: SelectMatchToRegisterResultView,
		},

		{
			path: '/finish_live_report',
			name: 'FINISH_LIVE_REPORT',
			component: FinishLiveReportView,
		},

		{
			path:'/register_match_result',
			name: 'REGISTER_MATCH_RESULT',
			component: RegisterMatchResultView,
		},

		// 一般会員（暫定）向けのルーティング
		{
			path: '/event_view',
			name: 'EVENT_VIEW',
			component: EventView,
		},

		{
			path: '/latest_results',
			name: 'LATEST_RESULTS',
			component: LatestResultsView,
		},

		{
			path: '/topics',
			name: 'TOPICS',
			component: TopicsView,
		},

		{
			path: '/club_list',
			name: 'CLUB_LIST',
			component: ClubListView,
		}
	],
})

export default router