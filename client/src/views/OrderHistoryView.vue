<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Lịch sử đơn hàng</span>
        </div>
      </template>

      <div class="filters">
        <el-input
          v-model="searchPhone"
          placeholder="Tìm theo SĐT khách hàng"
          style="width: 200px; margin-right: 10px"
          clearable
          @clear="fetchOrders"
          @keyup.enter="fetchOrders"
        />
        <el-button type="primary" @click="fetchOrders">Tìm kiếm</el-button>
      </div>

      <el-table :data="orders" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="Mã đơn" width="80" />
        <el-table-column label="Khách hàng" width="180">
          <template #default="scope">
            <div v-if="scope.row.Customer">
              {{ scope.row.Customer.name }}<br/>
              <small>{{ scope.row.Customer.phoneNumber }}</small>
            </div>
            <span v-else>Khách lẻ</span>
          </template>
        </el-table-column>
        <el-table-column label="Tổng tiền" width="120">
          <template #default="scope">
            {{ formatCurrency(scope.row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="Giảm giá" width="120">
          <template #default="scope">
            {{ formatCurrency(scope.row.discountAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="Điểm dùng" width="100">
          <template #default="scope">
            {{ scope.row.pointsUsed }}
          </template>
        </el-table-column>
        <el-table-column label="Thực thu" width="120">
          <template #default="scope">
            <strong>{{ formatCurrency(scope.row.finalAmount) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Điểm tích" width="100">
          <template #default="scope">
            <span style="color: green">+{{ scope.row.pointsEarned }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ngày tạo" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="limit"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { API_URL } from '../config/api'

const orders = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const loading = ref(false)
const searchPhone = ref('')

const fetchOrders = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`${API_URL}/api/orders`, {
      params: {
        page: page.value,
        limit: limit.value,
        customerId: searchPhone.value || undefined
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    orders.value = res.data.orders
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('Lỗi tải lịch sử đơn hàng')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage) => {
  page.value = newPage
  fetchOrders()
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN')
}

onMounted(fetchOrders)
</script>

<style scoped>
.filters {
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
