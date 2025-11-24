<template>
  <div class="dashboard-container">
    <!-- Summary Cards -->
    <el-row :gutter="20" class="mb-20">
      <el-col :xs="24" :sm="8" :md="8" :lg="8">
        <el-card shadow="hover" class="summary-card revenue">
          <div class="card-title">Tổng doanh thu</div>
          <div class="card-value">{{ formatCurrency(summary.totalRevenue) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8" :md="8" :lg="8">
        <el-card shadow="hover" class="summary-card orders">
          <div class="card-title">Tổng đơn hàng</div>
          <div class="card-value">{{ summary.totalOrders }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8" :md="8" :lg="8">
        <el-card shadow="hover" class="summary-card points">
          <div class="card-title">Tổng điểm đã cấp</div>
          <div class="card-value">{{ summary.totalPointsGiven }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts -->
    <el-card>
      <template #header>
        <div class="chart-header">
          <span>Biểu đồ doanh thu</span>
          <el-radio-group v-model="chartType" size="small" @change="fetchData">
            <el-radio-button label="day">Theo Ngày</el-radio-button>
            <el-radio-button label="month">Theo Tháng</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="chart-container">
        <Bar v-if="chartData.labels" :data="chartData" :options="chartOptions" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../config/api'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { API_URL } from '../config/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const summary = ref({
  totalRevenue: 0,
  totalOrders: 0,
  totalPointsGiven: 0
})
const chartType = ref('day')
const chartData = ref({})
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const fetchData = async () => {
  try {
    const res = await api.get('/api/reports/dashboard', {
      params: { type: chartType.value }
    })
    
    summary.value = res.data.summary
    
    // Process Chart Data
    const labels = res.data.chart.map(item => item.date)
    const data = res.data.chart.map(item => item.revenue)
    
    chartData.value = {
      labels,
      datasets: [
        {
          label: 'Doanh thu',
          backgroundColor: '#014E27',
          data
        }
      ]
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(fetchData)
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.mb-20 { 
  margin-bottom: 20px; 
}

.summary-card { 
  text-align: center;
  margin-bottom: 16px;
}

.card-title { 
  font-size: 14px; 
  color: #666; 
}

.card-value { 
  font-size: 24px; 
  font-weight: bold; 
  margin-top: 10px; 
}

.summary-card.revenue .card-value { 
  color: #014E27; 
}

.summary-card.orders .card-value { 
  color: #409eff; 
}

.summary-card.points .card-value { 
  color: #e6a23c; 
}

.chart-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.chart-container { 
  height: 400px; 
}

/* Mobile Responsive Styles */
@media (max-width: 767px) {
  .card-value {
    font-size: 20px;
  }
  
  .card-title {
    font-size: 13px;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .summary-card {
    margin-bottom: 12px;
  }
}

/* Tablet Styles */
@media (min-width: 768px) and (max-width: 1024px) {
  .chart-container {
    height: 350px;
  }
}
</style>
