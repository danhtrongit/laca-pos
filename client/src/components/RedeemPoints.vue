<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Đổi quà</span>
      </div>
    </template>
    <el-form :model="form" label-width="120px">
      <el-form-item label="Số điện thoại">
        <el-input v-model="form.phoneNumber" placeholder="Nhập SĐT" />
      </el-form-item>
      <el-form-item label="Điểm cần đổi">
        <el-input-number v-model="form.pointsToRedeem" :min="1" label="Điểm" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onRedeem" :loading="loading" color="#014E27">Đổi quà</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const form = reactive({
  phoneNumber: '',
  pointsToRedeem: 10
})

const loading = ref(false)

const onRedeem = async () => {
  if (!form.phoneNumber) {
    ElMessage.error('Vui lòng nhập số điện thoại')
    return
  }
  loading.value = true
  try {
    const response = await axios.post('http://localhost:3000/api/redeem', {
      phoneNumber: form.phoneNumber,
      pointsToRedeem: form.pointsToRedeem
    })
    ElMessage.success(`Đổi quà thành công! Trừ ${form.pointsToRedeem} điểm. Còn lại: ${response.data.customer.points}`)
    form.phoneNumber = ''
    form.pointsToRedeem = 10
  } catch (error) {
    ElMessage.error(error.response?.data?.error || 'Có lỗi xảy ra')
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
</style>
