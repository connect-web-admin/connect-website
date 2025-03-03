import { createRouter, createWebHistory } from 'vue-router';
import App from '@/App.vue';
import LoginView from '@/views/LoginView.vue';

import TopView from '@/views/TopView.vue';
import ChampionshipScheduleView from '@/views/ChampionshipScheduleView.vue';
import ClubIntroductionView from '@/views/ClubIntroductionView.vue'
import PicsView from '@/views/PicsView.vue';
import VideosView from '@/views/VideosView.vue';
import MediaView from '@/views/MediaView.vue';
import FaqView from '@/views/FaqView.vue';
import LiveReportForUserView from '@/views/LiveReportForUserView.vue';

// 会社概要や利用規約などの目立たせないようにするページ
import CompanyInfoView from '@/views/CompanyInfoView.vue';
import CopyrightInfoView from '@/views/CopyrightInfoView.vue';
import PrivacyPolicyView from '@/views/PrivacyPolicyView.vue';
import TermsOfServiceView from '@/views/TermsOfServiceView.vue';

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
			name: 'Top',
			component: TopView
		},

		{
			path: '/login',
			name: 'Login',
			component: LoginView
		},

		{
			path: '/live-report-for-user',
			name: 'LiveReportForUser',
			component: LiveReportForUserView
		},


		{
			path: '/championship-schedule',
			name: 'ChampionshipSchedule',
			component: ChampionshipScheduleView
		},

		{
			path: '/media',
			name: 'Media',
			component: MediaView
		},

		{
			path: '/pics',
			name: 'Pics',
			component: PicsView
		},

		{
			path: '/videos',
			name: 'Videos',
			component: VideosView
		},

		{
			path: '/company-info',
			name: 'CompanyInfo',
			component: CompanyInfoView
		},

		{
			path: '/copyright-info',
			name: 'CopyrightInfo',
			component: CopyrightInfoView
		},

		{
			path: '/privacy-policy',
			name: 'PrivacyPolicy',
			component: PrivacyPolicyView
		},

		{
			path: '/terms-of-service',
			name: 'TermsOfService',
			component: TermsOfServiceView
		},

		{
			path: '/faq',
			name: 'Faq',
			component: FaqView
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
			path: '/club-introduction',
			name: 'ClubIntroduction',
			component: ClubIntroductionView,
		}
	],
})

export default router