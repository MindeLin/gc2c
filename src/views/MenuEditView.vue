<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import { useUserStore } from '@/stores/user'
import { ArrowLeft, Plus, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  title: '',
  company_name: '',
  items: [] as { id?: string, name: string, price: number, description: string }[]
})

const addItem = () => {
  form.value.items.push({ name: '', price: 0, description: '' })
}

const removeItem = (index: number) => {
  form.value.items.splice(index, 1)
}

const saveMenu = async () => {
  if (!form.value.title) return alert('Please enter a title')
  if (form.value.items.length === 0) return alert('Please add at least one item')

  const shareToken = Math.random().toString(36).substring(2, 10)
  
  // 1. Create Menu
  try {
    const menu = await api.post('/menus', {
      ownerId: userStore.user.userId,
      title: form.value.title,
      companyName: form.value.company_name,
      items: form.value.items
    })
    
    router.push('/')
  } catch (e) {
    console.error(e)
    alert('Error creating menu')
  }
}
</script>

<template>
  <div class="max-w-md mx-auto min-h-screen bg-white pb-20">
    <header class="p-4 border-b flex items-center gap-4 sticky top-0 bg-white z-10">
      <button @click="router.back()" class="p-2 -ml-2 text-gray-600">
        <ArrowLeft class="w-6 h-6" />
      </button>
      <h1 class="font-bold text-lg">New Menu</h1>
    </header>

    <main class="p-4 space-y-6">
      <!-- Basic Info -->
      <section class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Menu Title</label>
          <input v-model="form.title" type="text" placeholder="e.g. Friday Lunch" class="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Company / Group (Optional)</label>
          <input v-model="form.company_name" type="text" placeholder="e.g. Tech Team" class="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all" />
        </div>
      </section>

      <!-- Items -->
      <section>
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-bold text-gray-900">Menu Items</h2>
        </div>
        
        <div class="space-y-4">
          <div v-for="(item, index) in form.items" :key="index" class="p-4 border rounded-xl bg-gray-50 relative group">
            <button @click="removeItem(index)" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1">
              <Trash2 class="w-4 h-4" />
            </button>
            
            <div class="grid gap-3">
              <input v-model="item.name" placeholder="Item Name" class="w-full p-2 bg-transparent border-b border-gray-200 focus:border-primary outline-none font-medium" />
              <div class="flex gap-3">
                <div class="relative flex-1">
                  <span class="absolute left-0 top-2 text-gray-400">$</span>
                  <input v-model="item.price" type="number" placeholder="0" class="w-full pl-4 p-2 bg-transparent border-b border-gray-200 focus:border-primary outline-none" />
                </div>
                <input v-model="item.description" placeholder="Note (optional)" class="flex-[2] p-2 bg-transparent border-b border-gray-200 focus:border-primary outline-none text-sm" />
              </div>
            </div>
          </div>
        </div>

        <button @click="addItem" class="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
          <Plus class="w-5 h-5" /> Add Item
        </button>
      </section>
    </main>

    <div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t max-w-md mx-auto">
      <button @click="saveMenu" class="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#05b34c] transition-colors">
        Save Menu
      </button>
    </div>
  </div>
</template>
