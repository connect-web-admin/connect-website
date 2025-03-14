import { createRouter, createWebHistory } from 'vue-router';
import App from '@/App.vue';
import LoginView from '@/views/LoginView.vue';
import ArchiveView from '@/views/ArchiveView.vue';
import TopView from '@/views/TopView.vue';
import ClubIntroductionView from '@/views/ClubIntroductionView.vue';
import PickupNewsView from '@/views/PickupNewsView.vue';
import PicsView from '@/views/PicsView.vue';
import VideosView from '@/views/VideosView.vue';
import MediaView from '@/views/MediaView.vue';
import FaqView from '@/views/FaqView.vue';
import LiveReportForUserView from '@/views/LiveReportForUserView.vue';
import PremiumView from '@/views/PremiumView.vue';

// 会社概要や利用規約などの目立たせないようにするページ
import CompanyInfoView from '@/views/site-info/CompanyInfoView.vue';
import CopyrightInfoView from '@/views/site-info/CopyrightInfoView.vue';
import PrivacyPolicyView from '@/views/site-info/PrivacyPolicyView.vue';
import TermsOfServiceView from '@/views/site-info/TermsOfServiceView.vue';
import SctlNotationsView from '@/views/site-info/SctlNotationsView.vue';

import LatestResultsView from '@/views/LatestResultsView.vue'
import RegisterMatchResultView from '@/views/connecter/RegisterMatchResultView.vue'
import SelectReportingMatchView from '@/views/connecter/SelectReportingMatchView.vue'
import ConnecterHomeView from '@/views/connecter/ConnecterHomeView.vue'
import ContactView from '@/views/ContactView.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'Home',
			component: TopView
		},

		{
			path: '/login',
			name: 'Login',
			component: LoginView
		},

		/**
		 * ハンバーガーメニュー内のリンク
		 */
		{
			path: '/top',
			name: 'Top',
			component: TopView
		},

		{
			path: '/live-report-for-user',
			name: 'LiveReportForUser',
			component: LiveReportForUserView
		},

		{
			path: '/media',
			name: 'Media',
			component: MediaView
		},

		{
			path: '/club-introduction',
			name: 'ClubIntroduction',
			component: ClubIntroductionView
		},

		{
			path: '/pickup-news/:newsId?',
			name: 'PickupNews',
			component: PickupNewsView
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
			path: '/faq',
			name: 'Faq',
			component: FaqView
		},

		// 会社概要、特商法、利用規約、プライバシーポリシー、著作権情報へのルーティング
		{
			path: '/site-info/company-info',
			name: 'CompanyInfo',
			component: CompanyInfoView
		},
		
		{
			path: '/site-info/specified-commercial-transactions-law-notations',
			name: 'SctlNotations',
			component: SctlNotationsView
		},

		{
			path: '/site-info/terms-of-service',
			name: 'TermsOfService',
			component: TermsOfServiceView
		},

		{
			path: '/site-info/privacy-policy',
			name: 'PrivacyPolicy',
			component: PrivacyPolicyView
		},

		{
			path: '/site-info/copyright-info',
			name: 'CopyrightInfo',
			component: CopyrightInfoView
		},

		/**
		 * フッターに表示されるリンク
		 * ハンバーガーメニューと重複するChampionshipScheduleとLiveReportForUserを除く
		 */
		{
			path:'/contact',
			name: 'Contact',
			component: ContactView
		},

		{
			path:'/premium',
			name: 'Premium',
			component: PremiumView
		},

		/**
		 * コネクター用のルーティング
		 */
		{
			path:'/connecter/home',
			name: 'ConnecterHome',
			component: ConnecterHomeView
		},

		{
			path: '/connecter/select-match-to-report',
			name: 'SelectReportingMatch',
			component: SelectReportingMatchView,
		},

		{
			path: '/connecter/register-match-result/:championshipId/:matchId',
			name: 'RegisterMatchResult',
			component: RegisterMatchResultView,
			props: true
		},

		/**
		 * その他のルーティング
		 */
		{
			path: '/latest-results',
			name: 'LatestResults',
			component: LatestResultsView,
		},

		{
			path: '/archive',
			name: 'Archive',
			component: ArchiveView,
		}
	]
})

export default router