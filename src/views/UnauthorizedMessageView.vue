        
<script setup>
    import { useRouter } from 'vue-router'
    const router = useRouter()
</script>

<template>
    <div class="unauthorized-message">
        <h2>This page is for logged-in users only.</h2>
        <p>Please log in to access the content.</p>
        <button @click="router.push('/login')" class="login-button">
            Log In
        </button>
    </div>
</template>

<style scoped>
.unauthorized-message {
    text-align: center;
    padding: 2rem;
}

.login-button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.login-button:hover {
    background-color: #0056b3;
}
</style>