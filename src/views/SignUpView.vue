<script setup>
import { ref, computed, watch } from 'vue';
import { MEMBER_API_URL } from '../utils/constants';
import { useRouter } from 'vue-router';

const router = useRouter();

// フォームの入力値
const lastName = ref('');
const firstName = ref('');
const lastNameKana = ref('');
const firstNameKana = ref('');
const phoneNumber = ref('');
const phoneNumberPart1 = ref('');
const phoneNumberPart2 = ref('');
const phoneNumberPart3 = ref('');
const postalCode = ref('');
const postalCodePart1 = ref('');
const postalCodePart2 = ref('');
const address = ref('');
const inputEmail = ref('');
const inputPassword = ref('');
const confirmPassword = ref('');
const paymentPlan = ref('yearly');
const termsAgreed = ref(false);

// パスワードの表示状態
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const isProcessing = ref(false);
const failedMsg = ref('');

// バリデーションエラーメッセージ
const lastNameError = ref('');
const firstNameError = ref('');
const lastNameKanaError = ref('');
const firstNameKanaError = ref('');
const phoneNumberError = ref('');
const postalCodeError = ref('');

// バリデーション関数
const validatePhoneNumber = (value) => {
    if (!value) return '電話番号を入力してください';
    if (!/^[0-9]+$/.test(value)) return '電話番号は数字のみ使用できます';
    return '';
};

const validatePostalCode = (value) => {
    if (!value) return '郵便番号を入力してください';
    if (!/^\d{3}-?\d{4}$/.test(value)) return '郵便番号は7桁の数字で入力してください（ハイフンは任意）';
    return '';
};

const validateName = (value, fieldName) => {
    if (!value) return `${fieldName}を入力してください`;
    if (value.length > 50) return `${fieldName}は50文字以内で入力してください`;
    return '';
};

// 電話番号の各部分のバリデーション
const validatePhoneNumberPart = (value, partName) => {
    if (!value) return `${partName}を入力してください`;
    if (!/^[0-9]+$/.test(value)) return `${partName}は数字のみ使用できます`;
    return '';
};

// 郵便番号の各部分のバリデーション
const validatePostalCodePart = (value, partName) => {
    if (!value) return `${partName}を入力してください`;
    if (!/^[0-9]+$/.test(value)) return `${partName}は数字のみ使用できます`;
    return '';
};

// 入力値の監視
watch(lastName, (newValue) => {
    lastNameError.value = validateName(newValue, '姓');
});

watch(firstName, (newValue) => {
    firstNameError.value = validateName(newValue, '名');
});

watch(lastNameKana, (newValue) => {
    lastNameKanaError.value = validateName(newValue, '姓（カナ）');
});

watch(firstNameKana, (newValue) => {
    firstNameKanaError.value = validateName(newValue, '名（カナ）');
});

// // 電話番号の各部分の監視
// watch(phoneNumberPart1, (newValue) => {
//     phoneNumberError.value = validatePhoneNumberPart(newValue, '市外局番');
// });

// watch(phoneNumberPart2, (newValue) => {
//     phoneNumberError.value = validatePhoneNumberPart(newValue, '市内局番');
// });

// watch(phoneNumberPart3, (newValue) => {
//     phoneNumberError.value = validatePhoneNumberPart(newValue, '加入者番号');
// });

// 電話番号の結合
watch([phoneNumberPart1, phoneNumberPart2, phoneNumberPart3], ([part1, part2, part3]) => {
    phoneNumber.value = `${part1}-${part2}-${part3}`;
});

// // 郵便番号の各部分の監視
// watch(postalCodePart1, (newValue) => {
//     postalCodeError.value = validatePostalCodePart(newValue, '郵便番号（上3桁）');
// });

// watch(postalCodePart2, (newValue) => {
//     postalCodeError.value = validatePostalCodePart(newValue, '郵便番号（下4桁）');
// });

// 郵便番号の結合
watch([postalCodePart1, postalCodePart2], ([part1, part2]) => {
    postalCode.value = `${part1}-${part2}`;
});

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

const confirmPasswordValidation = computed(() => {
    if (!confirmPassword.value) {
        return { isValid: false, message: '確認用パスワードを入力してください' };
    }
    if (confirmPassword.value !== inputPassword.value) {
        return { isValid: false, message: 'パスワードが一致しません' };
    }
    return { isValid: true, message: '' };
});

const checkForDuplicateEmailInDatabase = async () => {
    try {
        const response = await fetch(`${MEMBER_API_URL}/check-for-duplicate-email-in-database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ inputEmail: inputEmail.value })
        });

        const result = await response.json();
        if (result.status === 'ALREADY_REGISTERED_IN_DATABASE') {
            return true;
        } else if (result.status === 'NEW_USER') {
            return false;
        } else {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('ユーザー状態確認エラー:', error);
        throw error;
    }
};

const registerUserToDatabase = async () => {
    try {
        const response = await fetch(`${MEMBER_API_URL}/register-user-to-database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                lastName: lastName.value,
                firstName: firstName.value,
                lastNameKana: lastNameKana.value,
                firstNameKana: firstNameKana.value,
                phoneNumber: phoneNumber.value,
                postalCode: postalCode.value,
                address: address.value,
                inputEmail: inputEmail.value,
                paymentPlan: paymentPlan.value,
                isTermsAgreed: termsAgreed.value,
                membershipType: 'regular'
            })
        });

        const result = await response.json();
        if (result.status === 'USER_SUCCESSFULLY_REGISTERED_TO_DATABASE') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('ユーザー状態確認エラー:', error);
        throw error;
    }
};

const registerUserToCognito = async () => {
    try {
        const response = await fetch(`${MEMBER_API_URL}/register-user-to-cognito`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                inputEmail: inputEmail.value,
                inputPassword: inputPassword.value
            })
        });

        const result = await response.json();
        if (result.status === 'SUCCESSFULLY_REGISTERED_TO_COGNITO_AND_PENDING_CONFIRMATION') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('ユーザー状態確認エラー:', error);
        throw error;
    }
};

const registerNewAccount = async () => {
    // バリデーションチェック
    if (!inputPasswordValidation.value.isValid || !confirmPasswordValidation.value.isValid) {
        alert('パスワードの入力内容に誤りがあります。確認してください。');
        return;
    }

    // 郵便番号の各部分のバリデーション
    const postalCodePart1Error = validatePostalCodePart(postalCodePart1.value, '郵便番号（上3桁）');
    const postalCodePart2Error = validatePostalCodePart(postalCodePart2.value, '郵便番号（下4桁）');

    if (postalCodePart1Error || postalCodePart2Error) {
        alert('郵便番号の入力内容に誤りがあります。確認してください。');
        return;
    }

    isProcessing.value = true;

    try {
        // まずユーザーの状態を確認
        const isDuplicateEmail = await checkForDuplicateEmailInDatabase();
        if (isDuplicateEmail) {
            alert('すでに登録されているメールアドレスです。別のメールアドレスでお試しください。');
            return;
        }

        // 通常の新規登録処理１　DynamoDBにユーザーを作成
        const isSuccessFullyRegisteredToDatabase = await registerUserToDatabase();
        if (!isSuccessFullyRegisteredToDatabase) {
            alert('ユーザー登録に失敗しました。時間を空けて再度お試しください。解消されない場合は運営までお問い合わせください。');
            return;
        }

        // 通常の新規登録処理２　Cognitoにユーザーを作成
        const isSuccessFullyRegisteredToCognito = await registerUserToCognito();
        if (!isSuccessFullyRegisteredToCognito) {
            alert('ユーザー登録に失敗しました。時間を空けて再度お試しください。解消されない場合は運営までお問い合わせください。');
            return;
        }

        alert('ユーザー登録に成功しました。メールアドレスに確認コードを送信しました。確認コードを入力してください。');

        router.push({
            path: '/confirm-signup',
            query: { inputEmail: inputEmail.value }
        });
    } catch (error) {
        console.error('登録エラー:', error);
        failedMsg.value = error.message || `登録に失敗しました。メールアドレスを変えるか、時間を空けて再度お試しください。解消されない場合は運営までお問い合わせください。`;
    } finally {
        isProcessing.value = false;
    }
}

// 登録ボタンの活性化状態を制御
const isRegisterButtonEnabled = computed(() => {
    return termsAgreed.value;
});
</script>

<template>
    <div class="max-w-2xl mx-auto p-8">
        <div v-if="isProcessing" class="flex justify-center items-center">
            <img src="../assets/icons/loading.gif" alt="読み込み中" class="w-10 h-10 mx-auto">
        </div>
        <div v-else-if="failedMsg" class="flex justify-center items-center">
            <p>{{ failedMsg }}</p>
        </div>
        <div v-else>
            <h1 class="text-xl font-bold">新規会員登録</h1>
            <p class="text-red-600 text-sm mb-6">すべての項目を入力してください。</p>

            <form @submit.prevent="registerNewAccount" class="space-y-5">
                <!-- 氏名 -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label for="lastName" class="block text-sm font-medium text-black">姓</label>
                        <input type="text" id="lastName" v-model="lastName" required autocomplete="family-name"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <p v-if="lastNameError" class="text-sm text-red-600 mt-1">{{ lastNameError }}</p>
                    </div>
                    <div class="space-y-2">
                        <label for="firstName" class="block text-sm font-medium text-black">名</label>
                        <input type="text" id="firstName" v-model="firstName" required autocomplete="given-name"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <p v-if="firstNameError" class="text-sm text-red-600 mt-1">{{ firstNameError }}</p>
                    </div>
                </div>

                <!-- フリガナ -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label for="lastNameKana" class="block text-sm font-medium text-black">姓（カナ）</label>
                        <input type="text" id="lastNameKana" v-model="lastNameKana" required autocomplete="off"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <p v-if="lastNameKanaError" class="text-sm text-red-600 mt-1">{{ lastNameKanaError }}</p>
                    </div>
                    <div class="space-y-2">
                        <label for="firstNameKana" class="block text-sm font-medium text-black">名（カナ）</label>
                        <input type="text" id="firstNameKana" v-model="firstNameKana" required autocomplete="off"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <p v-if="firstNameKanaError" class="text-sm text-red-600 mt-1">{{ firstNameKanaError }}</p>
                    </div>
                </div>

                <!-- 電話番号 -->
                <div class="space-y-2">
                    <label for="phoneNumberPart1" class="block text-sm font-medium text-black">電話番号</label>
                    <div class="flex items-center space-x-2">
                        <input type="tel" id="phoneNumberPart1" v-model="phoneNumberPart1" required autocomplete="off"
                            maxlength="4"
                            class="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <span class="text-gray-500">-</span>
                        <input type="tel" id="phoneNumberPart2" v-model="phoneNumberPart2" required autocomplete="off"
                            maxlength="4"
                            class="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <span class="text-gray-500">-</span>
                        <input type="tel" id="phoneNumberPart3" v-model="phoneNumberPart3" required autocomplete="off"
                            maxlength="4"
                            class="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <p v-if="phoneNumberError" class="text-sm text-red-600 mt-1">{{ phoneNumberError }}</p>
                </div>

                <!-- 郵便番号 -->
                <div class="space-y-2">
                    <label for="postalCodePart1" class="block text-sm font-medium text-black">郵便番号</label>
                    <div class="flex items-center space-x-2">
                        <input type="text" id="postalCodePart1" v-model="postalCodePart1" required autocomplete="off"
                            maxlength="3"
                            class="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <span class="text-gray-500">-</span>
                        <input type="text" id="postalCodePart2" v-model="postalCodePart2" required autocomplete="off"
                            maxlength="4"
                            class="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <p v-if="postalCodeError" class="text-sm text-red-600 mt-1">{{ postalCodeError }}</p>
                </div>

                <!-- 住所 -->
                <div class="space-y-2">
                    <label for="address" class="block text-sm font-medium text-black">住所（都道府県から入力）</label>
                    <input type="text" id="address" v-model="address" required autocomplete="street-address"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <!-- メールアドレス -->
                <div class="space-y-2">
                    <label for="inputEmail" class="block text-sm font-medium text-black">メールアドレス</label>
                    <input type="email" id="inputEmail" v-model="inputEmail" required autocomplete="email"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <!-- パスワード -->
                <div class="space-y-2">
                    <label for="inputPassword" class="block text-sm font-medium text-black">パスワード</label>
                    <p class="text-black text-xs">（半角英数字8〜20字。大文字、小文字、数字をそれぞれ1文字以上）</p>
                    <input :type="showPassword ? 'text' : 'password'" id="inputPassword" v-model="inputPassword"
                        required autocomplete="new-password"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <div class="flex items-center mt-2">
                        <input type="checkbox" id="showPasswordCheckbox" v-model="showPassword"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                        <label for="showPasswordCheckbox" class="ml-2 block text-sm text-black">パスワードを表示する</label>
                    </div>
                    <p v-if="!inputPasswordValidation.isValid" class="text-sm text-red-600 mt-1">
                        {{ inputPasswordValidation.message }}
                    </p>
                </div>

                <!-- パスワード（確認） -->
                <div class="space-y-2">
                    <label for="confirmPassword" class="block text-sm font-medium text-black">パスワード（確認）</label>
                    <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                        v-model="confirmPassword" required autocomplete="new-password"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <div class="flex items-center mt-2">
                        <input type="checkbox" id="showConfirmPasswordCheckbox" v-model="showConfirmPassword"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                        <label for="showConfirmPasswordCheckbox"
                            class="ml-2 block text-sm text-black">パスワードを表示する</label>
                    </div>
                    <p v-if="!confirmPasswordValidation.isValid" class="text-sm text-red-600 mt-1">
                        {{ confirmPasswordValidation.message }}
                    </p>
                </div>

                <!-- お支払いプラン選択 -->
                <div class="space-y-2">
                    <p class="block text-sm font-medium text-black">お支払いプラン選択</p>
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <input type="radio" id="oneYear" name="paymentPlan" v-model="paymentPlan" value="oneYear"
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                            <label for="oneYear" class="ml-2 block text-sm text-black">
                                年払い 3,960円（翌年の同じ月の末日まで利用可能。自動継続ではありません。）
                            </label>
                        </div>
                        <div class="flex items-center">
                            <input type="radio" id="monthly" name="paymentPlan" v-model="paymentPlan" value="monthly"
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                            <label for="monthly" class="ml-2 block text-sm text-black">
                                毎月払い 440円<span class="text-red-600">（今だけ４月・５月分の利用料無料！）</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 利用規約、特商法確認 -->
                <div class="space-y-2 flex items-start">
                    <input type="checkbox" id="termsAgreed" v-model="termsAgreed"
                        class="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    <label for="termsAgreed" class="ml-2 block text-sm">
                        <a href="/terms" target="_blank"
                            class="text-blue-600 hover:text-blue-800 underline">利用規約</a>と
                        <a href="/commercial-transaction" target="_blank"
                            class="text-blue-600 hover:text-blue-800 underline">特定商取引法に基づく表記</a>を読み、内容を十分に理解しました。
                    </label>
                </div>
                <p class="text-sm">会員登録が終わると、クレジットカード情報入力画面に移動します。</p>

                <!-- 登録ボタン -->
                <button type="submit" :disabled="!isRegisterButtonEnabled" :class="[
                    'w-full py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200',
                    isRegisterButtonEnabled
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-white cursor-not-allowed'
                ]">
                    登録
                </button>
            </form>
        </div>
    </div>
</template>

<style></style>