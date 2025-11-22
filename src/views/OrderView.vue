<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { ShoppingBag, Check } from 'lucide-vue-next'

const route = useRoute()
const token = route.params.token as string

const menu = ref<any>(null)
const items = ref<any[]>([])
const loading = ref(true)
const submitted = ref(false)

const buyerName = ref('')
const cart = ref<Record<string, number>>({}) // itemId -> quantity

const fetchMenu = async () => {
  loading.value = true
  const { data: menuData, error } = await supabase
    .from('menus')
    .select('*')
    .eq('share_token', token)
    .single()
    
  if (error || !menuData) {
    alert('Menu not found')
    loading.value = false
    return
  }
  
  menu.value = menuData
  
  const { data: itemsData } = await supabase
    .from('menu_items')
    .select('*')
    .eq('menu_id', menuData.id)
    
  items.value = itemsData || []
  loading.value = false
}

const updateCart = (itemId: string, delta: number) => {
  const current = cart.value[itemId] || 0
  const next = Math.max(0, current + delta)
  if (next === 0) {
    delete cart.value[itemId]
  } else {
    cart.value[itemId] = next
  }
}

const totalItems = computed(() => Object.values(cart.value).reduce((a, b) => a + b, 0))
const totalPrice = computed(() => {
  return Object.entries(cart.value).reduce((sum, [id, qty]) => {
    const item = items.value.find(i => i.id === id)
    return sum + (item ? item.price * qty : 0)
  }, 0)
})

const submitOrder = async () => {
  if (!buyerName.value) return alert('Please enter your name')
  if (totalItems.value === 0) return alert('Please select items')

  const orderContent = Object.entries(cart.value).map(([id, qty]) => {
    const item = items.value.find(i => i.id === id)
    return {
      id,
      name: item.name,
      price: item.price,
      quantity: qty
    }
  })

  const { error } = await supabase
    .from('orders')
    .insert({
      menu_id: menu.value.id,
      buyer_name: buyerName.value,
      total_price: totalPrice.value,
      content: orderContent
    })

  if (error) {
    alert('Failed to submit order')
  } else {
    submitted.value = true
  }
}

onMounted(() => {
  fetchMenu()
})
</script>

<template>
  <div class="max-w-md mx-auto min-h-screen bg-gray-50 pb-32">
    <div v-if="loading" class="p-10 text-center text-gray-500">Loading menu...</div>
    
    <div v-else-if="submitted" class="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
      <div class="w-20 h-20 bg-green-100 text-primary rounded-full flex items-center justify-center mb-6">
        <Check class="w-10 h-10" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Order Sent!</h1>
      <p class="text-gray-600">Your order has been sent to {{ menu?.company_name || 'the organizer' }}.</p>
    </div>

    <div v-else>
      <!-- Header -->
      <header class="bg-white p-6 shadow-sm sticky top-0 z-10">
        <span class="text-xs font-bold text-primary bg-green-50 px-2 py-1 rounded-md mb-2 inline-block" v-if="menu.company_name">
          {{ menu.company_name }}
        </span>
        <h1 class="text-2xl font-bold text-gray-900">{{ menu.title }}</h1>
      </header>

      <!-- Items -->
      <main class="p-4 space-y-4">
        <div v-for="item in items" :key="item.id" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h3 class="font-bold text-gray-900">{{ item.name }}</h3>
            <p class="text-sm text-gray-500 mb-1">{{ item.description }}</p>
            <p class="font-bold text-primary">${{ item.price }}</p>
          </div>
          
          <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
            <button @click="updateCart(item.id, -1)" class="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-primary disabled:opacity-50" :disabled="!cart[item.id]">-</button>
            <span class="font-bold w-4 text-center">{{ cart[item.id] || 0 }}</span>
            <button @click="updateCart(item.id, 1)" class="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-primary">+</button>
          </div>
        </div>
      </main>

      <!-- Bottom Bar -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg max-w-md mx-auto">
        <div class="mb-4">
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Your Name</label>
          <input v-model="buyerName" type="text" placeholder="Enter your name" class="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
        </div>
        
        <button @click="submitOrder" :disabled="totalItems === 0" class="w-full bg-primary disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all">
          <ShoppingBag class="w-5 h-5" />
          <span>Place Order • ${{ totalPrice }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
