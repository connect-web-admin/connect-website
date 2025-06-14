import { createRouter, createWebHistory } from 'vue-router';
import { ref } from 'vue';
import App from '@/App.vue';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-vue";
import { USER_ATTR_SESSION_ID, USER_ATTR_EMAIL, USER_ATTR_MEMBERSHIP_TYPE, MEMBER_API_URL } from '@/utils/constants';

// レギュラー会員用のページ
import LoginView from '@/views/LoginView.vue';
import TopView from '@/views/TopView.vue';
import LatestResultsView from '@/views/LatestResultsView.vue';
import LatestResultsByChampionshipView from '@/views/LatestResultsByChampionshipNameView.vue';
import MediaView from '@/views/MediaView.vue';
import PickupNewsView from '@/views/PickupNewsView.vue';
import PickupNewsArticleView from '@/views/PickupNewsArticleView.vue';
import MediaArticleView from '@/views/MediaArticleView.vue';
import ArchiveView from '@/views/ArchiveView.vue';
import ClubListView from '@/views/ClubListView.vue';
import PicsView from '@/views/PicsView.vue';
import PicsMatchListView from '@/views/PicsMatchListView.vue';
import PicsListView from '@/views/PicsListView.vue';
import VideosView from '@/views/VideosView.vue';
import FaqView from '@/views/FaqView.vue';
import ContactView from '@/views/ContactView.vue';
import MemberInfoView from '@/views/MemberInfoView.vue';
import CouponView from '@/views/CouponView.vue';

// 会社概要や利用規約などの目立たせないようにするページ
import CompanyInfoView from '@/views/site-info/CompanyInfoView.vue';
import CopyrightInfoView from '@/views/site-info/CopyrightInfoView.vue';
import PrivacyPolicyView from '@/views/site-info/PrivacyPolicyView.vue';
import TermsOfServiceView from '@/views/site-info/TermsOfServiceView.vue';
import SctlNotationsView from '@/views/site-info/SctlNotationsView.vue';
import ConfirmMatchInputView from '@/views/ConfirmMatchInputView.vue';

// コネクター用のページ
import RegisterMatchResultView from '@/views/connecter/RegisterMatchResultView.vue';
import EditMatchResultView from '@/views/connecter/EditMatchResultView.vue';
import SelectReportingMatchU12View from '@/views/connecter/SelectReportingMatchU12View.vue';
import SelectReportingMatchU15View from '@/views/connecter/SelectReportingMatchU15View.vue';
import SelectReportingMatchU18View from '@/views/connecter/SelectReportingMatchU18View.vue';
import SelectReportingMatchWOMANView from '@/views/connecter/SelectReportingMatchWOMANView.vue';
import TestRegisterMatchResultView from '@/views/connecter/TestRegisterMatchResultView.vue';
import TestSelectReportingMatchU18View from '@/views/connecter/TestSelectReportingMatchU18View.vue';

// 星取表作成用の試合結果表示用のページ
import AdminLatestResultsView from '@/views/admin/AdminLatestResultsView.vue';
import AdminLatestResultsByChampionshipNameView from '@/views/admin/AdminLatestResultsByChampionshipNameView.vue';

// 404ルート
import NotFoundView from '@/views/NotFoundView.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
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
			path: '/member-info',
			name: 'MemberInfo',
			component: MemberInfoView
		},

		{
			path: '/media',
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
			path: '/pics',
			name: 'Pics',
			component: PicsView
		},
		
		{
			path: '/pics-match-list/:championshipName/:championshipId',
			name: 'PicsMatchList',
			component: PicsMatchListView,
			props: true
		},

		{
			path: '/pics-list/:championshipName/:championshipId/:matchId/:matchDate/:club1/:club2',
			name: 'PicsList',
			component: PicsListView,
			props: true
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
			path:'/coupon',
			name: 'Coupon',
			component: CouponView
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
			path: '/latest-results-by-championship/:championshipId',
			name: 'LatestResultsByChampionship',
			component: LatestResultsByChampionshipView,
		},

		{
			path: '/admin-latest-results',
			name: 'AdminLatestResults',
			component: AdminLatestResultsView,
		},

		{
			path: '/admin-latest-results-by-championship-name/:championshipId',
			name: 'AdminLatestResultsByChampionshipName',
			component: AdminLatestResultsByChampionshipNameView,
		},

		{
			path: '/confirm-match-input',
			name: 'ConfirmMatchInput',
			component: ConfirmMatchInputView,
		},

		{
			path: '/connecter/register-match-result/:championshipId/:matchId',
			name: 'RegisterMatchResult',
			component: RegisterMatchResultView,
			props: true
		},

		{
			path: '/connecter/select-reporting-match-u12',
			name: 'SelectReportingMatchU12',
			component: SelectReportingMatchU12View,
			props: (route) => ({ accessToken: route.query.access_token })
		},

		{
			path: '/connecter/select-reporting-match-u15',
			name: 'SelectReportingMatchU15',
			component: SelectReportingMatchU15View,
			props: (route) => ({ accessToken: route.query.access_token })
		},

		{
			path: '/connecter/select-reporting-match-u18',
			name: 'SelectReportingMatchU18',
			component: SelectReportingMatchU18View,
			props: (route) => ({ accessToken: route.query.access_token })
		},

		{
			path: '/connecter/select-reporting-match-woman',
			name: 'SelectReportingMatchWoman',
			component: SelectReportingMatchWOMANView,
			props: (route) => ({ accessToken: route.query.access_token })
		},

		{
			path: '/connecter/edit-match-result/:championshipId/:matchId',
			name: 'EditMatchResult',
			component: EditMatchResultView,
			props: true
		},

		{
			path: '/connecter/test-register-match-result/:championshipId/:matchId',
			name: 'TestRegisterMatchResult',
			component: TestRegisterMatchResultView,
			props: true
		},

		{
			path: '/connecter/test-select-reporting-match-u18',
			name: 'TestSelectReportingMatchU18',
			component: TestSelectReportingMatchU18View,
			props: (route) => ({ accessToken: route.query.access_token })
		},

		// 404ルート この記載場所は最下部から動かさないこと
		{
			path: '/:pathMatch(.*)*',
			name: 'NotFound',
			component: NotFoundView
		}
	]
})

// 会員情報を格納する変数
const memberInfo = ref({});

// 保護されたルートのリスト
const protectedRoutes = [
	'Top',
	'Pics',
	'PicsMatchList',
	'PicsList',
	'PickupNews',
	'PickupNewsArticle',
	'MemberInfo',
	'Archive',
	'Coupon',
	'LatestResults',
	'MediaArticle',
	'Media',
	'ClubList'
];

// 管理者専用ルートのリスト (test@testest.com のみアクセス可能)
const adminRoutes = [
	'AdminLatestResults',
	'AdminLatestResultsByChampionshipName'
];

/**
 * session_idを削除する関数
 */
const removeSessionIdInMemberDDB = async () => {
    const idTokenForAuth = localStorage.getItem('idTokenForAuth');

    try {
        const putUrl = new URL(`${MEMBER_API_URL}/remove-session-id`);
        const requestBody = {
            email: localStorage.getItem(USER_ATTR_EMAIL),
            sessionId: localStorage.getItem(USER_ATTR_SESSION_ID)
        }

        const response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.error('Error details:', error);
    }
}

// ナビゲーションガードの実装
router.beforeEach(async (to, from, next) => {
	// 管理者専用ルートのアクセス制御
	if (adminRoutes.includes(to.name)) {
		const adminEmail = localStorage.getItem('email');
		if (adminEmail !== 'm3jyo4tyome@iCloud.com' && adminEmail !== 'pkpkggl@gmail.com') {
			// 管理者権限がない場合はホームページにリダイレクト
			next({ name: 'Top' });
			return;
		}
	}

	if (protectedRoutes.includes(to.name)) {
		const idToken = localStorage.getItem('idTokenForAuth');
		if (!idToken) {
			try {
				const authState = useAuthenticator();
				if (authState.user) {
					await removeSessionIdInMemberDDB();

					// ローカルストレージのアイテムを削除
					localStorage.removeItem('email');
					localStorage.removeItem('idTokenForAuth');
					localStorage.removeItem('isAccountAvailable');
					localStorage.removeItem('userAttrSub');
					localStorage.removeItem('custom:membership_type');
					localStorage.removeItem(USER_ATTR_SESSION_ID);
					localStorage.removeItem(USER_ATTR_EMAIL);

					// ユーザーが存在する場合はサインアウト
					await authState.signOut();
				}
			} catch (error) {
				console.error('認証エラー:', error);
			}
			// ログインページにリダイレクト
			next({ name: 'Home' });
			return;
		}
	}

	// if (!localStorage.getItem(USER_ATTR_MEMBERSHIP_TYPE)) {
	// 	// ログインしている会員の会員情報を取得
	// 	await getTargetMemberInfo();

	// 	// 取得した会員情報のうちmembership_typeをローカルストレージに保存
	// 	// regularかlightのどちらかを保存することになる。これにより閲覧権限を管理
	// 	localStorage.setItem(USER_ATTR_MEMBERSHIP_TYPE, memberInfo.value.membership_type);
	// }
	
	next();
});

/**
 * アクセス日から次の月曜日までに開催予定の試合を取得
 */
const getTargetMemberInfo = async () => {
    const queryUrl = new URL(`${MEMBER_API_URL}/member-info`);
    queryUrl.searchParams.append("email", localStorage.getItem(USER_ATTR_EMAIL));

    try {
        const response = await fetch(queryUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        memberInfo.value = await response.json();
    } catch (error) {
        console.error("会員情報の取得に失敗しました。");
    }
};

export default router