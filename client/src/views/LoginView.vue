<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>Đăng nhập Admin</h2>
        </div>
      </template>
      <el-form :model="form" label-width="0">
        <el-form-item>
          <el-input v-model="form.username" placeholder="Tên đăng nhập" prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="Mật khẩu" prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="w-100" @click="handleLogin" :loading="loading">Đăng nhập</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../config/api'
import { ElMessage } from 'element-plus'
import { API_URL } from '../config/api'

const router = useRouter()
const form = reactive({
  username: '',
  password: ''
})
const loading = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('Vui lòng nhập đầy đủ thông tin')
    return
  }
  loading.value = true
  try {
    const res = await api.post('/api/login', form)
    localStorage.setItem('token', res.data.token)
    ElMessage.success('Đăng nhập thành công')
    router.push('/')
  } catch (error) {
    ElMessage.error('Sai tên đăng nhập hoặc mật khẩu')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #014E27;
}
.login-card {
  width: 400px;
}
.card-header {
  text-align: center;
}
.w-100 {
  width: 100%;
}
</style>
