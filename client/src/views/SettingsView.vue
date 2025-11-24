<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Cấu hình quy đổi điểm</span>
        </div>
      </template>
      <el-form :model="form" :label-width="labelWidth" label-position="top" class="settings-form">
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

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>Quản lý mã QR giảm giá</span>
        </div>
      </template>
      
      <div class="qr-grid">
        <div v-for="percentage in [5, 10, 15, 20]" :key="percentage" class="qr-item">
          <div class="qr-card">
            <div class="qr-header">
              <h3>Giảm {{ percentage }}%</h3>
            </div>
            
            <div class="qr-upload-section">
              <el-upload
                name="qrImage"
                :action="`${API_URL}/api/settings/qr/${percentage}`"
                :headers="{ Authorization: `Bearer ${token}` }"
                :show-file-list="false"
                :on-success="(res) => handleUploadSuccess(res, percentage)"
                :on-error="handleUploadError"
                :before-upload="beforeUpload"
                accept="image/png,image/jpeg,image/jpg"
              >
                <el-button type="primary" size="small">
                  <el-icon><Upload /></el-icon>
                  Upload QR Image
                </el-button>
              </el-upload>
              
              <div v-if="qrImages[percentage]" class="qr-preview">
                <img :src="`${API_URL}${qrImages[percentage]}`" alt="QR Preview" />
              </div>
              <div v-else class="qr-placeholder">
                Chưa có ảnh QR
              </div>
            </div>

            <div v-if="qrImages[percentage]" class="qr-url-section">
              <div class="url-label">URL hiển thị:</div>
              <el-input 
                :value="`${API_URL}/qr/${percentage}`" 
                readonly
                size="small"
              >
                <template #append>
                  <el-button @click="copyUrl(percentage)" size="small">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </template>
              </el-input>
              
              <div class="qr-code-display">
                <canvas :ref="(el) => qrCanvasRefs[percentage] = el"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import api from '../config/api'
import { ElMessage } from 'element-plus'
import { Upload, CopyDocument } from '@element-plus/icons-vue'
import QRCode from 'qrcode'
import { API_URL } from '../config/api'

const form = reactive({
  moneyToPointRate: 10000,
  pointToMoneyRate: 1000
})
const loading = ref(false)
const token = ref(localStorage.getItem('token'))
const qrImages = reactive({})
const qrCanvasRefs = reactive({})

// Responsive label width
const labelWidth = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return 'auto'
  }
  return '200px'
})

const fetchSettings = async () => {
  try {
    const res = await api.get('/api/settings')
    if (res.data.moneyToPointRate) form.moneyToPointRate = res.data.moneyToPointRate
    if (res.data.pointToMoneyRate) form.pointToMoneyRate = res.data.pointToMoneyRate
  } catch (error) {
    console.error(error)
  }
}

const fetchQRImages = async () => {
  for (const percentage of [5, 10, 15, 20]) {
    try {
      const res = await api.get(`/api/settings/qr/${percentage}`)
      if (res.data.exists) {
        qrImages[percentage] = res.data.url
      }
    } catch (error) {
      console.error(`Error fetching QR for ${percentage}%:`, error)
    }
  }
}

const generateQRCodes = async () => {
  await new Promise(resolve => setTimeout(resolve, 100)) // Wait for DOM
  for (const percentage of [5, 10, 15, 20]) {
    if (qrImages[percentage] && qrCanvasRefs[percentage]) {
      try {
        const url = `${API_URL}/qr/${percentage}`
        await QRCode.toCanvas(qrCanvasRefs[percentage], url, {
          width: 150,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
      } catch (error) {
        console.error(`Error generating QR code for ${percentage}%:`, error)
      }
    }
  }
}

const saveSettings = async () => {
  loading.value = true
  try {
    await api.put('/api/settings', form)
    ElMessage.success('Đã lưu cấu hình')
  } catch (error) {
    ElMessage.error('Lỗi khi lưu cấu hình')
  } finally {
    loading.value = false
  }
}

const beforeUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('Chỉ chấp nhận file ảnh PNG, JPG hoặc JPEG!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('Kích thước ảnh phải nhỏ hơn 5MB!')
    return false
  }
  return true
}

const handleUploadSuccess = async (response, percentage) => {
  ElMessage.success('Upload thành công!')
  qrImages[percentage] = response.url
  await new Promise(resolve => setTimeout(resolve, 100))
  await generateQRCodes()
}

const handleUploadError = (error) => {
  ElMessage.error('Upload thất bại!')
  console.error(error)
}

const copyUrl = (percentage) => {
  const url = `${API_URL}/qr/${percentage}`
  navigator.clipboard.writeText(url)
  ElMessage.success('Đã copy URL!')
}

onMounted(async () => {
  await fetchSettings()
  await fetchQRImages()
  await generateQRCodes()
})
</script>

<style scoped>
.hint {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  margin-top: 4px;
}

.settings-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.qr-card {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}

.qr-header {
  text-align: center;
  margin-bottom: 15px;
}

.qr-header h3 {
  margin: 0;
  color: #014E27;
  font-size: 1.3rem;
}

.qr-upload-section {
  text-align: center;
  margin-bottom: 15px;
}

.qr-preview {
  margin-top: 15px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border: 2px solid #014E27;
}

.qr-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.qr-placeholder {
  margin-top: 15px;
  padding: 40px;
  background: white;
  border: 2px dashed #ccc;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
}

.qr-url-section {
  margin-top: 15px;
}

.url-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.qr-code-display {
  margin-top: 15px;
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.qr-code-display canvas {
  border-radius: 4px;
}

/* Mobile Responsive Styles */
@media (max-width: 767px) {
  .settings-form :deep(.el-form-item__label) {
    text-align: left;
    margin-bottom: 8px;
  }
  
  .qr-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .qr-card {
    padding: 16px;
  }
  
  .qr-header h3 {
    font-size: 1.2rem;
  }
  
  .qr-placeholder {
    padding: 30px 20px;
    font-size: 13px;
  }
  
  .qr-code-display canvas {
    max-width: 100%;
    height: auto;
  }
}

/* Tablet Styles */
@media (min-width: 768px) and (max-width: 1024px) {
  .qr-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
