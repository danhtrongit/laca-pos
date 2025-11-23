<template>
  <el-container class="layout-container">
    <el-aside width="250px" class="aside">
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
    <el-container>
      <el-header class="header">
        <div class="header-content">
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Monitor, User, Setting, SwitchButton, List, TrendCharts } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const activeRoute = computed(() => route.path)
const pageTitle = computed(() => {
  switch (route.path) {
    case '/': return 'Bán hàng'
    case '/customers': return 'Quản lý Khách hàng'
    case '/settings': return 'Cài đặt'
    default: return 'Mini POS'
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.aside {
  background-color: #014E27;
  color: white;
  display: flex;
  flex-direction: column;
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
}
.header {
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
}
.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
