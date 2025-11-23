<template>
  <div class="pos-container">
    <el-row :gutter="20">
      <!-- Left Column: Customer & Bill Input -->
      <el-col :span="14">
        <el-card class="mb-20">
          <template #header>
            <div class="card-header">
              <span>Thông tin đơn hàng</span>
            </div>
          </template>
          
          <el-form label-width="150px">
            <el-form-item label="Khách hàng">
              <el-select
                v-model="selectedCustomerId"
                filterable
                remote
                placeholder="Nhập SĐT hoặc Tên"
                :remote-method="searchCustomer"
                :loading="loadingSearch"
                @change="onCustomerSelect"
                style="width: 100%"
              >
                <el-option
                  v-for="item in customerOptions"
                  :key="item.phoneNumber"
                  :label="item.name ? `${item.name} (${item.phoneNumber})` : item.phoneNumber"
                  :value="item.phoneNumber"
                />
              </el-select>
            </el-form-item>

            <div v-if="currentCustomer" class="customer-info">
              <p>Tên: <strong>{{ currentCustomer.name || 'Chưa đặt tên' }}</strong></p>
              <p>Điểm khả dụng: <strong class="highlight">{{ currentCustomer.currentPoints }}</strong></p>
            </div>

            <el-divider />

            <el-form-item label="Tổng tiền hàng">
              <el-input-number v-model="totalAmount" :min="0" :step="1000" style="width: 100%" />
            </el-form-item>

            <el-form-item label="Giảm giá">
              <el-input v-model="discountValue" type="number" placeholder="Giá trị" style="width: 100%">
                <template #append>
                  <el-select v-model="discountType" style="width: 80px">
                    <el-option label="VND" value="fixed" />
                    <el-option label="%" value="percent" />
                  </el-select>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="Dùng điểm" v-if="currentCustomer">
              <el-switch v-model="usePoints" />
              <div v-if="usePoints" style="margin-top: 10px">
                <el-checkbox v-model="useAllPoints">Dùng tối đa ({{ maxPointsCanUse }})</el-checkbox>
                <el-input-number 
                  v-if="!useAllPoints" 
                  v-model="pointsToUseManual" 
                  :min="0" 
                  :max="maxPointsCanUse" 
                  style="width: 140px; margin-left: 10px"
                />
                <div style="font-size: 12px; color: #666; margin-top: 5px">
                  Giá trị quy đổi: {{ formatCurrency(pointsValue) }}
                </div>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- Right Column: Summary -->
      <el-col :span="10">
        <el-card class="summary-card">
          <template #header>
            <div class="card-header">
              <span>Thanh toán</span>
            </div>
          </template>
          
          <div class="summary-row">
            <span>Tổng tiền hàng:</span>
            <span>{{ formatCurrency(totalAmount) }}</span>
          </div>
          <div class="summary-row discount">
            <span>Giảm giá:</span>
            <span>- {{ formatCurrency(calculatedDiscount) }}</span>
          </div>
          <div class="summary-row points" v-if="usePoints">
            <span>Trừ điểm ({{ pointsToUse }} điểm):</span>
            <span>- {{ formatCurrency(pointsValue) }}</span>
          </div>
          
          <el-divider />
          
          <div class="summary-row total">
            <span>Khách phải trả:</span>
            <span>{{ formatCurrency(finalAmount) }}</span>
          </div>

          <div class="summary-row earn">
            <span>Điểm tích luỹ thêm:</span>
            <span>+ {{ pointsEarned }}</span>
          </div>

          <div class="actions">
            <el-button type="primary" size="large" class="pay-btn" @click="processOrder" :loading="processing">
              THANH TOÁN
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// Data
const customerOptions = ref([])
const selectedCustomerId = ref('')
const currentCustomer = ref(null)
const loadingSearch = ref(false)

const totalAmount = ref(0)
const discountValue = ref(0)
const discountType = ref('fixed') // 'fixed' or 'percent'
const usePoints = ref(false)
const useAllPoints = ref(true)
const pointsToUseManual = ref(0)

const settings = ref({
  moneyToPointRate: 10000,
  pointToMoneyRate: 1000
})

const processing = ref(false)

// Computed Logic
const calculatedDiscount = computed(() => {
  if (discountType.value === 'percent') {
    return (totalAmount.value * discountValue.value) / 100
  }
  return Number(discountValue.value)
})

const subTotalAfterDiscount = computed(() => {
  return Math.max(0, totalAmount.value - calculatedDiscount.value)
})

const maxPointsCanUse = computed(() => {
  if (!currentCustomer.value) return 0
  // Cannot use more points than needed to pay the bill
  const maxPointsForBill = Math.ceil(subTotalAfterDiscount.value / settings.value.pointToMoneyRate)
  return Math.min(currentCustomer.value.currentPoints, maxPointsForBill)
})

const pointsToUse = computed(() => {
  if (!usePoints.value) return 0
  if (useAllPoints.value) return maxPointsCanUse.value
  return Math.min(pointsToUseManual.value, maxPointsCanUse.value)
})

const pointsValue = computed(() => {
  return pointsToUse.value * settings.value.pointToMoneyRate
})

const finalAmount = computed(() => {
  return Math.max(0, subTotalAfterDiscount.value - pointsValue.value)
})

const pointsEarned = computed(() => {
  return Math.floor(finalAmount.value / settings.value.moneyToPointRate)
})

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const fetchSettings = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/settings')
    if (res.data.moneyToPointRate) settings.value.moneyToPointRate = Number(res.data.moneyToPointRate)
    if (res.data.pointToMoneyRate) settings.value.pointToMoneyRate = Number(res.data.pointToMoneyRate)
  } catch (error) {
    console.error(error)
  }
}

const searchCustomer = async (query) => {
  if (query) {
    loadingSearch.value = true
    try {
      const res = await axios.get('http://localhost:3000/api/customers')
      // Simple client-side filtering for demo (should be server-side for large data)
      customerOptions.value = res.data.filter(c => 
        c.phoneNumber.includes(query) || (c.name && c.name.toLowerCase().includes(query.toLowerCase()))
      )
    } finally {
      loadingSearch.value = false
    }
  } else {
    customerOptions.value = []
  }
}

const onCustomerSelect = async (val) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/customers/${val}`)
    currentCustomer.value = res.data
    usePoints.value = false // Reset switch
  } catch (error) {
    console.error(error)
  }
}

const processOrder = async () => {
  if (totalAmount.value <= 0) {
    ElMessage.warning('Vui lòng nhập tổng tiền hàng')
    return
  }
  
  processing.value = true
  try {
    const payload = {
      customerId: selectedCustomerId.value || null,
      totalAmount: totalAmount.value,
      discountAmount: calculatedDiscount.value,
      pointsUsed: pointsToUse.value,
      finalAmount: finalAmount.value
    }

    await axios.post('http://localhost:3000/api/orders', payload)
    
    ElMessage.success(`Thanh toán thành công! Tích được ${pointsEarned.value} điểm.`)
    
    // Reset form
    totalAmount.value = 0
    discountValue.value = 0
    usePoints.value = false
    
    // Refresh customer data if selected
    if (selectedCustomerId.value) {
      onCustomerSelect(selectedCustomerId.value)
    }
    
  } catch (error) {
    ElMessage.error(error.response?.data?.error || 'Có lỗi xảy ra')
  } finally {
    processing.value = false
  }
}

// Initial Load
onMounted(() => {
  fetchSettings()
  // Pre-load some customers for easier testing
  searchCustomer('0') 
})
</script>

<style scoped>
.mb-20 { margin-bottom: 20px; }
.ml-10 { margin-left: 10px; }
.customer-info {
  background: #f0f9eb;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}
.highlight { color: #014E27; font-size: 1.2em; }
.summary-card {
  background: #fff;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 16px;
}
.summary-row.discount { color: #e6a23c; }
.summary-row.points { color: #409eff; }
.summary-row.total {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}
.summary-row.earn {
  color: #67c23a;
  font-weight: bold;
}
.actions {
  margin-top: 20px;
}
.pay-btn {
  width: 100%;
  font-weight: bold;
  height: 50px;
  font-size: 18px;
}
</style>
