<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MEMBER_API_URL, USER_ATTR_EMAIL } from "@/utils/constants";

const failedMsg = ref("");
const isLoading = ref(false);
const memberInfo = ref([]);

/**
 * ログイン中の会員情報取得
 */
const getMemberInfo = async () => {
    isLoading.value = true;

    const email = localStorage.getItem(USER_ATTR_EMAIL);

    const queryUrl = new URL(`${MEMBER_API_URL}/member-info`);
    queryUrl.searchParams.append("email", email);

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
        failedMsg.value =
            "会員情報の取得に失敗しました。ブラウザを更新するか、時間を置いてからアクセスしてください。それでも改善されない場合は、Connectまでお問い合わせください。";
        console.error("会員情報の取得に失敗しました。");
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await getMemberInfo();

    // ページ遷移時に最上部へスクロール
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });
});
</script>
<template>
    <div class="p-5">
        <div v-if="isLoading" class="mt-20">
            <img
                src="../assets/icons/loading.gif"
                alt="読み込み中"
                class="w-10 h-10 mx-auto"
            />
        </div>
        <div v-else-if="failedMsg">
            <p>{{ failedMsg }}</p>
        </div>
        <div v-else>
            <h1 class="text-xl font-bold mb-5 border-b-1 border-gray-200 pb-2">
                会員情報
            </h1>
            <ul class="list-none">
                <li class="border-b-1 border-gray-200 py-2">
                    <p class="text-gray-600">会員ID</p>
                    <p>{{ memberInfo.member_id }}</p>
                </li>
                <li class="border-b-1 border-gray-200 py-2">
                    <p class="text-gray-600">お名前</p>
                    <p>{{ memberInfo.last_name }} {{ memberInfo.first_name }}</p>
                </li>
                <li class="border-b-1 border-gray-200 py-2">
                    <p class="text-gray-600">メールアドレス</p>
                    <p>{{ memberInfo.email }}</p>
                </li>
                <li class="border-b-1 border-gray-200 py-2">
                    <p class="text-gray-600">電話番号</p>
                    <p>{{ memberInfo.phone_number }}</p>
                </li>
                <li class="border-b-1 border-gray-200 py-2">
                    <p class="text-gray-600">郵便番号</p>
                    <p>{{ memberInfo.postal_code }}</p>
                </li>
                <li class="border-b-1 border-gray-200 py-2">
                    <p class="text-gray-600">住所</p>
                    <p>{{ memberInfo.address }}</p>
                </li>
                <li class="border-b-1 border-gray-200 py-2">
                    <p class="text-gray-600">会員種別</p>
                    <p v-if="memberInfo.membership_type === 'regular'">レギュラー</p>
                    <p v-else-if="memberInfo.membership_type === 'premium'">プレミアム</p>
                </li>
                <li class="border-b-1 border-gray-200 py-2">
                    <p class="text-gray-600">支払いプラン</p>
                    <p v-if="memberInfo.payment_plan === 'yearly'">年払い</p>
                    <p v-else-if="memberInfo.payment_plan === 'monthly'">月払い</p>
                </li>
                <li class="border-b-1 border-gray-200 py-2">
                    <p class="text-gray-600">有効期限</p>
                    <p>{{ memberInfo.expires_at }}</p>
                </li>
            </ul>
            <p class="mt-10 text-sm">
                退会につきましては、退会を希望される月の前の月の20日までに、「お名前」と「会員ID：{{ memberInfo.member_id }}」を添えて<a href="mailto:info@connect-goals.com" class="text-blue-500 underline">Connectまでご連絡</a>ください。<br />
                （例えば、６月15日にご連絡いただきますと、７月初日以降はご利用いただけなくなります。）
            </p>
        </div>
    </div>
</template>
<style></style>
