<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Tích điểm</span>
      </div>
    </template>
    <el-form :model="form" label-width="120px">
      <el-form-item label="Số điện thoại">
        <el-input v-model="form.phoneNumber" placeholder="Nhập SĐT (VD: 1900 xxx xxx)" />
      </el-form-item>
      <el-form-item label="Số ly mua">
        <el-input-number v-model="form.drinks" :min="1" label="Số ly" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" :loading="loading" color="#014E27">Tích điểm</el-button>
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
  drinks: 1
})

const loading = ref(false)

const onSubmit = async () => {
  if (!form.phoneNumber) {
    ElMessage.error('Vui lòng nhập số điện thoại')
    return
  }
  loading.value = true
  try {
    const response = await axios.post('http://localhost:3000/api/accumulate', {
      phoneNumber: form.phoneNumber,
      drinks: form.drinks
    })
    ElMessage.success(`Đã tích ${form.drinks} điểm cho SĐT ${form.phoneNumber}. Tổng điểm: ${response.data.customer.points}`)
    form.phoneNumber = ''
    form.drinks = 1
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
