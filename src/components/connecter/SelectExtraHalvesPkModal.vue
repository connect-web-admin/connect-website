<script setup>
const props = defineProps({
    show: Boolean,
    gameStatus: String
});

// CSS
const btnBase = 'w-[200px] py-2 text-white rounded-md';
const textBase = 'text-xl text-white';
</script>

<template>
    <Transition name="modal">
        <div v-if="show" class="fixed inset-0 z-[9998] flex bg-black/20 transition-opacity duration-300"
            @click="$emit('close')">
            <div class="m-auto w-[350px] rounded-lg p-[20px_30px] shadow-[0_2px_8px_rgba(0,0,0,0.33)] transition-all duration-300"
                @click.stop>
                <div class="my-5">
                    <slot name="body">
                        <div class="text-center flex flex-col gap-10 justify-center items-center">
                            <h3>操作を選んでください。</h3>
                            <button type="submit" v-if="gameStatus !== '延長後半終了'"
                                @click="$emit('close'), $emit('register-extra-halves', 'apply')" :class="btnBase"
                                class="bg-orange-800">
                                <span
                                    :class="textBase" class="bg-orange-800">延長前半開始</span></button>
                            <button type="submit" v-if="gameStatus !== 'PK終了'"
                                @click="$emit('close'), $emit('register-pk', 'apply')" :class="btnBase"
                                class="bg-amber-500">
                                <span
                                    :class="textBase" class="bg-amber-500">PK戦開始</span></button>
                            <button type="submit" @click="$emit('close'), $emit('handle-game-status', 'end')" :class="btnBase" class="bg-blue-500">
                                <span
                                    :class="textBase" class="bg-blue-500">試合終了</span></button>
                        </div>
                    </slot>
                </div>

                <div class="modal-footer flex justify-around">
                    <slot name="footer">
                        <button type="submit" @click="$emit('close')"
                            class="text-white bg-gray-400 rounded-md px-4 py-2 mt-10">キャンセル</button>
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