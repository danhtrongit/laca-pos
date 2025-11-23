<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Kiểm tra điểm</span>
      </div>
    </template>
    <el-form :model="form" label-width="120px">
      <el-form-item label="Số điện thoại">
        <el-input v-model="form.phoneNumber" placeholder="Nhập SĐT" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onCheck" :loading="loading" color="#014E27">Kiểm tra</el-button>
      </el-form-item>
    </el-form>
    <div v-if="result" class="result-area">
      <p>SĐT: <strong>{{ result.phoneNumber }}</strong></p>
      <p>Điểm hiện có: <strong style="color: #014E27; font-size: 1.2em;">{{ result.points }}</strong></p>
    </div>
  </el-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const form = reactive({
  phoneNumber: ''
})

const result = ref(null)
const loading = ref(false)

const onCheck = async () => {
  if (!form.phoneNumber) {
    ElMessage.error('Vui lòng nhập số điện thoại')
    return
  }
  loading.value = true
  result.value = null
  try {
    const response = await axios.get(`http://localhost:3000/api/balance/${form.phoneNumber}`)
    result.value = response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      ElMessage.warning('Khách hàng chưa có trong hệ thống')
    } else {
      ElMessage.error(error.response?.data?.error || 'Có lỗi xảy ra')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.box-card {
  max-width: 480px;
  margin: 20px auto;
}
.result-area {
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 4px;
  text-align: center;
}
</style>
