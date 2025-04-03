<script setup>
import { ref, computed } from 'vue';
import { MEMBER_API_URL } from '../utils/constants';

// フォームの入力値
const email = ref('');
const inputPassword = ref('');
const ageGroup = ref('');
const gender = ref('');
const favoriteTeam = ref('');
const membershipType = ref('regular');

const isProcessing = ref(false);
const failedMsg = ref('');

const ageGroups = [
    { value: '', label: '非回答' },
    { value: '10s', label: '10代' },
    { value: '20s', label: '20代' },
    { value: '30s', label: '30代' },
    { value: '40s', label: '40代' },
    { value: '50s', label: '50代' },
    { value: '60s', label: '60代' },
    { value: '70s', label: '70代以上' }
];

const genders = [
    { value: '', label: '非回答' },
    { value: 'male', label: '男' },
    { value: 'female', label: '女' }
];

const inputPasswordValidation = computed(() => {
    if (!inputPassword.value) return { isValid: false, message: 'パスワードを入力してください' }

    if (inputPassword.value.length < 8 || inputPassword.value.length > 20) {
        return { isValid: false, message: 'パスワードは8文字以上20文字以下で入力してください' }
    }

    const hasUpperCase = /[A-Z]/.test(inputPassword.value)
    const hasLowerCase = /[a-z]/.test(inputPassword.value)
    const hasNumber = /[0-9]/.test(inputPassword.value)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return { isValid: false, message: 'パスワードは大文字、小文字、数字をそれぞれ1文字以上含める必要があります' }
    }

    return { isValid: true, message: '' }
});

const handleSubmit = async () => {
    if (!inputPasswordValidation.value.isValid) {
        alert(inputPasswordValidation.value.message)
        return
    }

    console.log({
        email: email.value,
        inputPassword: inputPassword.value,
        ageGroup: ageGroup.value,
        gender: gender.value,
        favoriteTeam: favoriteTeam.value,
        membershipType: membershipType.value
    })

    isProcessing.value = true;
    const postUrl = new URL(`${MEMBER_API_URL}/signup`);

    try {
        const response = await fetch(postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                email: email.value,
                input_password: inputPassword.value,
                age_group: ageGroup.value,
                gender: gender.value,
                favorite_team: favoriteTeam.value,
                membership_type: membershipType.value
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
    } catch (error) {
        failedMsg.value = '登録に失敗しました。時間を置いてから再度お試しください。それでも改善されない場合は、Connectまでお問い合わせください。';
        console.error('登録に失敗しました。');
    } finally {
        isProcessing.value = false;
    }
}
</script>

<template>
    <div class="max-w-2xl mx-auto p-8">
        <div v-if="isProcessing" class="flex justify-center items-center h-screen">
            <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>
        <div v-else-if="failedMsg" class="flex justify-center items-center h-screen">
            <p>{{ failedMsg }}</p>
        </div>
        <div v-else>
            <h1 class="text-2xl font-bold mb-6">新規会員登録</h1>
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <div class="space-y-2">
                    <label for="email" class="block text-sm font-medium text-gray-700">メールアドレス <span
                            class="text-red-500">*必須</span></label>
                    <input type="email" id="email" v-model="email" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div class="space-y-2">
                    <label for="inputPassword" class="block text-sm font-medium text-gray-700">パスワード <span
                            class="text-red-500">*必須</span><p class="text-black text-xs">（半角英数字8〜20字。大文字、小文字、数字をそれぞれ1文字以上）</p></label>
                    <input type="inputPassword" id="inputPassword" v-model="inputPassword" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <p v-if="!inputPasswordValidation.isValid" class="text-sm text-red-600 mt-1">
                        {{ inputPasswordValidation.message }}
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">年代</label>
                    <div class="flex flex-wrap gap-4">
                        <div v-for="group in ageGroups" :key="group.value" class="flex items-center">
                            <input type="radio" :id="'age-' + group.value" :value="group.value" v-model="ageGroup"
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                            <label :for="'age-' + group.value" class="ml-2 text-sm text-gray-700">
                                {{ group.label }}
                            </label>
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">性別</label>
                    <div class="flex flex-wrap gap-4">
                        <div v-for="genderOption in genders" :key="genderOption.value" class="flex items-center">
                            <input type="radio" :id="'gender-' + genderOption.value" :value="genderOption.value"
                                v-model="gender" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                            <label :for="'gender-' + genderOption.value" class="ml-2 text-sm text-gray-700">
                                {{ genderOption.label }}
                            </label>
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="favoriteTeam" class="block text-sm font-medium text-gray-700">推しチーム（50字以内）</label>
                    <input type="text" id="favoriteTeam" v-model="favoriteTeam" maxlength="50"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <button type="submit"
                    class="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
                    登録
                </button>
            </form>
        </div>
    </div>
</template>

<style></style>