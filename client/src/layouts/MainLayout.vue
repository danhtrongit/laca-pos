<template>
  <el-container class="layout-container">
    <!-- Mobile Overlay -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>
    
    <!-- Sidebar -->
    <el-aside 
      :class="['aside', { 'sidebar-open': isSidebarOpen }]"
      width="250px"
    >
      <div class="logo-area">
        <img src="/logo.png" alt="Logo" class="logo" />
        <span class="brand-name">Laca POS</span>
      </div>
      <el-menu
        :default-active="activeRoute"
        class="el-menu-vertical"
        router
        background-color="#014E27"
        text-color="#fff"
        active-text-color="#ffd04b"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/">
          <el-icon><Monitor /></el-icon>
          <span>Bán hàng (POS)</span>
        </el-menu-item>
        <el-menu-item index="/customers">
          <el-icon><User /></el-icon>
          <span>Khách hàng</span>
        </el-menu-item>
        <el-menu-item index="/history">
          <el-icon><List /></el-icon>
          <span>Lịch sử đơn hàng</span>
        </el-menu-item>
        <el-menu-item index="/reports">
          <el-icon><TrendCharts /></el-icon>
          <span>Báo cáo</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>Cài đặt</span>
        </el-menu-item>
        <el-menu-item @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>Đăng xuất</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- Main Content -->
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <!-- Hamburger Menu (Mobile Only) -->
          <button 
            class="hamburger-menu mobile-only"
            @click="toggleSidebar"
            aria-label="Toggle Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h2>{{ pageTitle }}</h2>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Monitor, User, Setting, SwitchButton, List, TrendCharts } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isSidebarOpen = ref(false)

const activeRoute = computed(() => route.path)
const pageTitle = computed(() => {
  switch (route.path) {
    case '/': return 'Bán hàng'
    case '/customers': return 'Quản lý Khách hàng'
    case '/history': return 'Lịch sử đơn hàng'
    case '/reports': return 'Báo cáo'
    case '/settings': return 'Cài đặt'
    default: return 'Laca POS'
  }
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleMenuSelect = () => {
  // Close sidebar on mobile when menu item is selected
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  position: relative;
}

/* Sidebar Overlay for Mobile */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.aside {
  background-color: #014E27;
  color: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 999;
}

.logo-area {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  padding: 2px;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.el-menu-vertical {
  border-right: none;
  flex: 1;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.header-content h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

/* Hamburger Menu */
.hamburger-menu {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1000;
}

.hamburger-menu span {
  width: 30px;
  height: 3px;
  background-color: #014E27;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-menu:hover span {
  background-color: #016633;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

/* Mobile Styles: < 768px */
@media (max-width: 767px) {
  .aside {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
  }
  
  .aside.sidebar-open {
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    display: block;
  }
  
  .hamburger-menu {
    display: flex;
  }
  
  .header {
    padding: 0 15px;
  }
  
  .header-content h2 {
    font-size: 1.2rem;
  }
  
  .main-content {
    padding: 15px;
  }
}

/* Tablet Styles: 768px - 1024px */
@media (min-width: 768px) and (max-width: 1024px) {
  .aside {
    width: 220px !important;
  }
  
  .header-content h2 {
    font-size: 1.3rem;
  }
  
  .main-content {
    padding: 18px;
  }
}

/* Desktop Styles: > 1024px */
@media (min-width: 1025px) {
  .aside {
    width: 250px;
  }
}
</style>
