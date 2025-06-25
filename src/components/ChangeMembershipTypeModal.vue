<script setup>
import { computed } from 'vue';

const props = defineProps({
    show: Boolean,
    targetMembershipType: {
        type: String,
        required: true,
        validator: (value) => ['regular', 'limited'].includes(value)
    }
});

// 会員種別の日本語表示
const membershipTypeNames = {
    regular: 'レギュラー',
    limited: 'リミテッド'
};

// 現在の会員種別から変更先の会員種別を判定（リアクティブに計算）
const currentMembershipType = computed(() => {
    return props.targetMembershipType === 'regular' ? 'limited' : 'regular';
});

// CSS
const btnBase = 'w-1/4 py-1 text-white rounded-md';
</script>

<template>
    <Transition name="modal">
        <div v-if="show" class="fixed inset-0 z-[9998] flex bg-black/20 transition-opacity duration-300">
            <div class="m-auto w-[350px] rounded-lg p-[20px_30px] shadow-[0_2px_8px_rgba(0,0,0,0.33)] transition-all duration-300 bg-white">
                <div v-if="targetMembershipType === 'regular'" class="my-5">
                    <p>会員種別を{{ membershipTypeNames[targetMembershipType] }}に変更します。<br />変更は即時反映され、レギュラー会員の会費との差額が決済されます。<br /><span class="text-red-500">翌月1日まで再度{{ membershipTypeNames[currentMembershipType] }}会員に変更することができません。</span><br />
                    よろしいですか？</p>
                </div>
                <div v-if="targetMembershipType === 'limited'" class="my-5">
                    <p>会員種別を{{ membershipTypeNames[targetMembershipType] }}に変更します。<br />変更は翌月1日から反映されます。<br /><span class="text-red-500">翌月1日まで再度{{ membershipTypeNames[currentMembershipType] }}会員に変更することができません。</span><br />
                    よろしいですか？</p>
                </div>

                <div class="modal-footer flex justify-around">
                    <button type="button" @click="$emit('close')" :class="btnBase" class="bg-gray-400">いいえ</button>
                    <button type="button" @click="$emit('confirm', targetMembershipType); $emit('close')" :class="btnBase" class="bg-blue-400">はい</button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style>
/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
    opacity: 0;
}

.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
}
</style> 