<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>Cấu hình quy đổi điểm</span>
      </div>
    </template>
    <el-form :model="form" label-width="200px">
      <el-form-item label="Tỉ lệ Tiền -> Điểm">
        <el-input v-model="form.moneyToPointRate" type="number">
          <template #append>VND = 1 Điểm</template>
        </el-input>
        <div class="hint">Ví dụ: 10000 VND tích được 1 điểm</div>
      </el-form-item>
      <el-form-item label="Tỉ lệ Điểm -> Tiền">
        <el-input v-model="form.pointToMoneyRate" type="number">
          <template #prepend>1 Điểm =</template>
          <template #append>VND</template>
        </el-input>
        <div class="hint">Ví dụ: 1 điểm đổi được 1000 VND</div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveSettings" :loading="loading">Lưu cấu hình</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const form = reactive({
  moneyToPointRate: 10000,
  pointToMoneyRate: 1000
})
const loading = ref(false)

const fetchSettings = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/settings')
    if (res.data.moneyToPointRate) form.moneyToPointRate = res.data.moneyToPointRate
    if (res.data.pointToMoneyRate) form.pointToMoneyRate = res.data.pointToMoneyRate
  } catch (error) {
    console.error(error)
  }
}

const saveSettings = async () => {
  loading.value = true
  try {
    await axios.put('http://localhost:3000/api/settings', form)
    ElMessage.success('Đã lưu cấu hình')
  } catch (error) {
    ElMessage.error('Lỗi khi lưu cấu hình')
  } finally {
    loading.value = false
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.hint {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}
</style>
