import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OrderView from '../views/OrderView.vue'
import MenuEditView from '../views/MenuEditView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/menu/new',
            name: 'menu-new',
            component: MenuEditView,
            meta: { requiresAuth: true }
        },
        {
            path: '/menu/:id/edit',
            name: 'menu-edit',
            component: MenuEditView,
            meta: { requiresAuth: true }
        },
        {
            path: '/share/:token',
            name: 'order',
            component: OrderView
        }
    ]
})

// Simple navigation guard
router.beforeEach((to, _from, next) => {
    const isAuthenticated = localStorage.getItem('line_user') // Simple check
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else {
        next()
    }
})

export default router
