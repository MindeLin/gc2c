<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.initLiff()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <router-view></router-view>
  </div>
</template>
