import { defineStore } from 'pinia'
import { ref } from 'vue'
import liff from '@line/liff'
import { api } from '@/lib/api'

export const useUserStore = defineStore('user', () => {
    const user = ref<any>(null)
    const isLoggedIn = ref(false)

    async function initLiff() {
        try {
            // Replace with your LIFF ID
            const liffId = import.meta.env.VITE_LIFF_ID
            if (!liffId) {
                console.error('LIFF ID not found')
                return
            }

            await liff.init({ liffId })

            if (liff.isLoggedIn()) {
                const profile = await liff.getProfile()
                user.value = profile
                isLoggedIn.value = true
                localStorage.setItem('line_user', JSON.stringify(profile))

                // Sync to Backend
                await api.post('/auth/login', {
                    userId: profile.userId,
                    displayName: profile.displayName,
                    pictureUrl: profile.pictureUrl
                })
            } else {
                // Auto login if not logged in (optional, or manual trigger)
                // liff.login()
            }
        } catch (error) {
            console.error('LIFF init failed', error)
        }
    }

    function login() {
        if (!liff.isLoggedIn()) {
            liff.login()
        }
    }

    function logout() {
        liff.logout()
        user.value = null
        isLoggedIn.value = false
        localStorage.removeItem('line_user')
        window.location.reload()
    }

    return { user, isLoggedIn, initLiff, login, logout }
})
