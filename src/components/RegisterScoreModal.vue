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
        <div v-if="show" class="modal-mask">
            <div class="modal-container">
                <div class="modal-body">
                    <slot name="body">default body</slot>
                </div>

                <div class="modal-footer">
                    <slot name="footer">
                        <div class=" flex flex-row justify-around">
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
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    transition: opacity 0.3s ease;
}

.modal-container {
    width: 350px;
    margin: auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
}

.modal-body {
    margin: 20px 0;
}

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