<script setup>
import { computed } from 'vue'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import UnauthorizedMessageView from './UnauthorizedMessageView.vue'

const props = defineProps({
    component: {
        type: Object,
        required: true
    }
})

const { authStatus } = useAuthenticator()
const currentView = computed(() =>
    authStatus.value === 'authenticated' ? props.component : UnauthorizedMessage
)
</script>

<template>
    <Suspense>
        <template #default>
            <component :is="currentView" />
        </template>
        <template #fallback>
            <div>Loading...</div>
        </template>
    </Suspense>
</template>
