import { createRouter, createWebHistory } from 'vue-router';
import App from '@/App.vue';

// レギュラー会員用のページ
import SignUpView from '@/views/SignUpView.vue';
import LoginView from '@/views/LoginView.vue';
import TopView from '@/views/TopView.vue';
import MediaView from '@/views/MediaView.vue';
import PickupNewsView from '@/views/PickupNewsView.vue';
import PickupNewsArticleView from '@/views/PickupNewsArticleView.vue';
import MediaArticleView from '@/views/MediaArticleView.vue';
import ArchiveView from '@/views/ArchiveView.vue';
import ClubListView from '@/views/ClubListView.vue';
import ClubIntroductionView from '@/views/ClubIntroductionView.vue';
import PicsCategoryListView from '@/views/PicsCategoryListView.vue';
import PicsListView from '@/views/PicsListView.vue';
import VideosView from '@/views/VideosView.vue';
import FaqView from '@/views/FaqView.vue';
import ContactView from '@/views/ContactView.vue';
import PremiumView from '@/views/PremiumView.vue';

// 会社概要や利用規約などの目立たせないようにするページ
import CompanyInfoView from '@/views/site-info/CompanyInfoView.vue';
import CopyrightInfoView from '@/views/site-info/CopyrightInfoView.vue';
import PrivacyPolicyView from '@/views/site-info/PrivacyPolicyView.vue';
import TermsOfServiceView from '@/views/site-info/TermsOfServiceView.vue';
import SctlNotationsView from '@/views/site-info/SctlNotationsView.vue';

// コネクター用のページ
import LatestResultsView from '@/views/LatestResultsView.vue';
import RegisterMatchResultView from '@/views/connecter/RegisterMatchResultView.vue';
import EditMatchResultView from '@/views/connecter/EditMatchResultView.vue';
// import SelectReportingMatchView from '@/views/connecter/SelectReportingMatchView.vue';
import SelectReportingMatchU12andWView from '@/views/connecter/SelectReportingMatchU12andWView.vue';
import SelectReportingMatchU15View from '@/views/connecter/SelectReportingMatchU15View.vue';
import SelectReportingMatchU18View from '@/views/connecter/SelectReportingMatchU18View.vue';

// 404ルート
import NotFoundView from '@/views/NotFoundView.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/signup',
			name: 'Signup',
			component: SignUpView,
			props: true
		},

		{
			path: '/login',
			name: 'Login',
			component: LoginView
		},
		
		{
			path: '/',
			name: 'Home',
			component: TopView
		},
		
		{
			path: '/top',
			name: 'Top',
			component: TopView
		},

		{
			path: '/media',
			// path: '/media/:articleId?',
			name: 'Media',
			component: MediaView
		},

		{
			path: '/media/article/:fiscalYear/:articleId',
			name: 'MediaArticle',
			component: MediaArticleView,
			props: true
		},

		{
			path: '/pickup-news',
			name: 'PickupNews',
			component: PickupNewsView
		},

		{
			path: '/pickup-news/article/:fiscalYear/:newsId',
			name: 'PickupNewsArticle',
			component: PickupNewsArticleView,
			props: true
		},

		{
			path: '/archive',
			name: 'Archive',
			component: ArchiveView,
		},

		{
			path: '/club-list',
			name: 'ClubList',
			component: ClubListView
		},

		{
			path: '/club-introduction',
			name: 'ClubIntroduction',
			component: ClubIntroductionView
		},

		{
			path: '/pics-category-list',
			name: 'PicsCategoryList',
			component: PicsCategoryListView
		},

		{
			path: '/pics-list',
			name: 'PicsList',
			component: PicsListView
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

		// 会社概要、特商法、利用規約、プライバシーポリシー、著作権情報へのルーティング
		{
			path: '/site-info/company-info',
			name: 'CompanyInfo',
			component: CompanyInfoView
		},
		
		{
			path: '/site-info/copyright-info',
			name: 'CopyrightInfo',
			component: CopyrightInfoView
		},

		{
			path: '/site-info/privacy-policy',
			name: 'PrivacyPolicy',
			component: PrivacyPolicyView
		},

		{
			path: '/site-info/terms-of-service',
			name: 'TermsOfService',
			component: TermsOfServiceView
		},

		{
			path: '/site-info/specified-commercial-transactions-law-notations',
			name: 'SctlNotations',
			component: SctlNotationsView
		},

		{
			path: '/latest-results',
			name: 'LatestResults',
			component: LatestResultsView,
		},

		{
			path: '/connecter/register-match-result/:championshipId/:matchId',
			name: 'RegisterMatchResult',
			component: RegisterMatchResultView,
			props: true
		},

		// {
		// 	path: '/connecter/select-reporting-match',
		// 	name: 'SelectReportingMatch',
		// 	component: SelectReportingMatchView,
		// },

		{
			path: '/connecter/select-reporting-match-u12andw',
			name: 'SelectReportingMatchU12andW',
			component: SelectReportingMatchU12andWView,
		},

		{
			path: '/connecter/select-reporting-match-u15',
			name: 'SelectReportingMatchU15',
			component: SelectReportingMatchU15View,
		},

		{
			path: '/connecter/select-reporting-match-u18',
			name: 'SelectReportingMatchU18',
			component: SelectReportingMatchU18View
			// props: (route) => ({ accessToken: route.query.access_token })
		},

		{
			path: '/connecter/edit-match-result/:championshipId/:matchId',
			name: 'EditMatchResult',
			component: EditMatchResultView,
			props: true
		},

		// 404ルート この記載場所は最下部から動かさないこと
		{
			path: '/:pathMatch(.*)*',
			name: 'NotFound',
			component: NotFoundView
		}
	]
})

export default router