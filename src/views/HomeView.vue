<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/lib/api'
import { useRouter } from 'vue-router'
import { Plus, Share2, FileText, LogOut } from 'lucide-vue-next'

const userStore = useUserStore()
const router = useRouter()
const menus = ref<any[]>([])
const loading = ref(true)

const fetchMenus = async () => {
  if (!userStore.user?.userId) return
  
  loading.value = true
  try {
    const data = await api.get('/menus', { userId: userStore.user.userId })
    menus.value = data
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

const createMenu = () => {
  router.push('/menu/new')
}

const copyLink = (token: string) => {
  const url = `${window.location.origin}/share/${token}`
  navigator.clipboard.writeText(url)
  alert('Link copied!')
}

const exportOrders = async (menuId: string) => {
  try {
    const orders = await api.get(`/menus/${menuId}/orders`)
    
    if (!orders || orders.length === 0) {
      alert('No orders to export')
      return
    }

  // Simple CSV Export
  const headers = ['Buyer', 'Total Price', 'Items']
  const rows = orders.map(o => {
    const items = o.content ? o.content.map((i: any) => `${i.name} x${i.quantity}`).join('; ') : ''
    return [o.buyer_name, o.total_price, items]
  })
  
  const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `orders_${menuId}.csv`
  link.click()
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchMenus()
  }
})
</script>

<template>
  <div class="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <header class="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <img :src="userStore.user?.pictureUrl" class="w-10 h-10 rounded-full" v-if="userStore.user" />
        <div>
          <h1 class="font-bold text-lg">My Menus</h1>
          <p class="text-xs text-gray-500">{{ userStore.user?.displayName }}</p>
        </div>
      </div>
      <button @click="userStore.logout" class="text-gray-400 hover:text-red-500">
        <LogOut class="w-5 h-5" />
      </button>
    </header>

    <!-- Content -->
    <main class="p-4 space-y-4">
      <div v-if="loading" class="text-center py-10 text-gray-400">Loading...</div>
      
      <div v-else-if="menus.length === 0" class="text-center py-20">
        <div class="bg-white p-6 rounded-xl shadow-sm inline-block mb-4">
          <FileText class="w-12 h-12 text-gray-300 mx-auto" />
        </div>
        <h3 class="text-gray-900 font-medium mb-1">No menus yet</h3>
        <p class="text-gray-500 text-sm mb-6">Create your first menu to start collecting orders.</p>
        <button @click="createMenu" class="bg-primary text-white px-6 py-2 rounded-full font-medium shadow-lg shadow-green-200">
          Create Menu
        </button>
      </div>

      <div v-else v-for="menu in menus" :key="menu.id" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex justify-between items-start mb-3">
          <div>
            <span class="text-xs font-bold text-primary bg-green-50 px-2 py-1 rounded-md mb-2 inline-block" v-if="menu.company_name">
              {{ menu.company_name }}
            </span>
            <h3 class="font-bold text-lg text-gray-800">{{ menu.title }}</h3>
            <p class="text-xs text-gray-400">{{ new Date(menu.created_at).toLocaleDateString() }}</p>
          </div>
          <div class="text-right">
             <span class="block text-2xl font-bold text-gray-900">{{ menu.orders[0]?.count || 0 }}</span>
             <span class="text-xs text-gray-500">Orders</span>
          </div>
        </div>
        
        <div class="flex gap-2 mt-4 pt-4 border-t border-gray-50">
          <button @click="copyLink(menu.share_token)" class="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors">
            <Share2 class="w-4 h-4" /> Share
          </button>
          <button @click="exportOrders(menu.id)" class="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors">
            <FileText class="w-4 h-4" /> Export
          </button>
        </div>
      </div>
    </main>

    <!-- FAB -->
    <button @click="createMenu" class="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform">
      <Plus class="w-8 h-8" />
    </button>
  </div>
</template>
