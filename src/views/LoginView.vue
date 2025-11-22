<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { watchEffect } from 'vue'

const userStore = useUserStore()
const router = useRouter()

const handleLogin = () => {
  userStore.login()
}

watchEffect(() => {
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
      <h1 class="text-2xl font-bold mb-6 text-primary">Corporate Order System</h1>
      <p class="mb-8 text-gray-600">Please login with LINE to continue</p>
      
      <button 
        @click="handleLogin"
        class="w-full bg-[#06C755] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#05b34c] transition-colors flex items-center justify-center gap-2"
      >
        <span>Login with LINE</span>
      </button>
    </div>
  </div>
</template>
