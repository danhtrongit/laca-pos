import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import POSView from '../views/POSView.vue'
import CustomersView from '../views/CustomersView.vue'
import SettingsView from '../views/SettingsView.vue'
import LoginView from '../views/LoginView.vue'
import OrderHistoryView from '../views/OrderHistoryView.vue'
import ReportsView from '../views/ReportsView.vue'

const routes = [
    {
        path: '/login',
        component: LoginView
    },
    {
        path: '/',
        component: MainLayout,
        meta: { requiresAuth: true },
        children: [
            { path: '', component: POSView },
            { path: 'customers', component: CustomersView },
            { path: 'history', component: OrderHistoryView },
            { path: 'reports', component: ReportsView },
            { path: 'settings', component: SettingsView }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router
