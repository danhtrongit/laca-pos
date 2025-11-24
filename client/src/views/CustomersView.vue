<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openDialog()">Thêm Khách hàng</el-button>
    </div>

    <el-table :data="customers" style="width: 100%" v-loading="loading">
      <el-table-column prop="phoneNumber" label="Số điện thoại" width="150" />
      <el-table-column prop="name" label="Tên khách hàng" />
      <el-table-column prop="currentPoints" label="Điểm hiện tại" sortable />
      <el-table-column prop="totalPoints" label="Tổng điểm tích luỹ" sortable />
      <el-table-column label="Hành động" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">Sửa</el-button>
          <el-button size="small" type="danger" @click="deleteCustomer(scope.row)">Xoá</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Sửa khách hàng' : 'Thêm khách hàng'">
      <el-form :model="form" label-width="120px">
        <el-form-item label="Số điện thoại">
          <el-input v-model="form.phoneNumber" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="Tên">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Điểm hiện tại" v-if="isEdit">
          <el-input-number v-model="form.currentPoints" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Huỷ</el-button>
          <el-button type="primary" @click="saveCustomer">Lưu</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../config/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { API_URL } from '../config/api'

const customers = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  phoneNumber: '',
  name: '',
  currentPoints: 0
})

const fetchCustomers = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/customers')
    customers.value = res.data
  } catch (error) {
    ElMessage.error('Lỗi tải danh sách khách hàng')
  } finally {
    loading.value = false
  }
}

const openDialog = (customer = null) => {
  if (customer) {
    isEdit.value = true
    form.phoneNumber = customer.phoneNumber
    form.name = customer.name
    form.currentPoints = customer.currentPoints
  } else {
    isEdit.value = false
    form.phoneNumber = ''
    form.name = ''
    form.currentPoints = 0
  }
  dialogVisible.value = true
}

const saveCustomer = async () => {
  try {
    if (isEdit.value) {
      await api.put(`/api/customers/${form.phoneNumber}`, form)
      ElMessage.success('Cập nhật thành công')
    } else {
      await api.post('/api/customers', form)
      ElMessage.success('Thêm mới thành công')
    }
    dialogVisible.value = false
    fetchCustomers()
  } catch (error) {
    ElMessage.error(error.response?.data?.error || 'Có lỗi xảy ra')
  }
}

const deleteCustomer = (customer) => {
  ElMessageBox.confirm(
    `Bạn có chắc muốn xoá khách hàng ${customer.name}?`,
    'Cảnh báo',
    { confirmButtonText: 'Xoá', cancelButtonText: 'Huỷ', type: 'warning' }
  ).then(async () => {
    try {
      await api.delete(`/api/customers/${customer.phoneNumber}`)
      ElMessage.success('Đã xoá')
      fetchCustomers()
    } catch (error) {
      ElMessage.error('Lỗi khi xoá')
    }
  })
}

onMounted(fetchCustomers)
</script>

<style scoped>
.toolbar {
  margin-bottom: 20px;
}
</style>
