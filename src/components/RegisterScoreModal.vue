<script setup>
const props = defineProps({
    show: Boolean,
    championshipId: String,
    matchId: String,
    gameStatus: String,
    isHome: Boolean,
    isAway: Boolean,
    isPlusScore: Boolean,
    isMinusScore: Boolean
});

// CSS
const btnBase = 'w-1/4 py-1 text-white rounded-md';
</script>

<template>
    <Transition name="modal">
        <div v-if="show" class="fixed inset-0 z-[9998] flex bg-black/20 transition-opacity duration-300">
            <div class="m-auto w-[350px] rounded-lg bg-white p-[20px_30px] shadow-[0_2px_8px_rgba(0,0,0,0.33)] transition-all duration-300">
                <div class="my-5">
                    <slot name="body">default body</slot>
                </div>

                <div class="modal-footer">
                    <slot name="footer">
                        <div class="flex flex-row justify-around">
                            <button type="submit" @click="$emit('close')" :class="btnBase" class="bg-gray-400">いいえ</button>
                            <button type="submit" v-if="isPlusScore && isHome" @click="$emit('plusScore', 'home'), $emit('close')" :class="btnBase" class="bg-blue-500">はい</button>
                            <button type="submit" v-if="isPlusScore && isAway" @click="$emit('plusScore', 'away'), $emit('close')" :class="btnBase" class="bg-blue-500">はい</button>
                            <button type="submit" v-if="isMinusScore && isHome" @click="$emit('minusScore', 'home'), $emit('close')" :class="btnBase" class="bg-blue-500">はい</button>
                            <button type="submit" v-if="isMinusScore && isAway" @click="$emit('minusScore', 'away'), $emit('close')" :class="btnBase" class="bg-blue-500">はい</button>
                        </div>
                    </slot>
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