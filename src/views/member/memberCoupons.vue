<template>
    <div class="container">
      <h2>我的優惠券</h2>
  
      <!-- 分頁篩選 Tabs -->
      <div class="tabs">
        <button
          v-for="s in statusTabs"
          :key="s"
          @click="currentStatus = s"
          :class="{ active: currentStatus === s }"
        >
          {{ statusLabel[s] }}
        </button>
      </div>
  
      <!-- 資料區塊 -->
      <div v-if="loading">載入中...</div>
      <div v-else-if="coupons.length === 0">目前沒有 {{ statusLabel[currentStatus] }} 的優惠券。</div>
      <div v-else class="coupon-list">
        <div v-for="coupon in coupons" :key="coupon.couponId" class="coupon-card">
  <div class="card-left">
    <img
  :src="fullImageUrl(coupon.bannerImage)"
  alt="活動圖片"
  class="banner"
/>
  </div>
  <div class="card-right">
    <div class="card-header">
  <h3>{{ coupon.couponName }}</h3>
  <div class="right-info">
    <p class="end-date">截止日期：{{ formatDate(coupon.endDate) }}</p>
    <p :class="['status-badge', statusClass(coupon.status)]">{{ statusLabel[coupon.status] }}</p>
  </div>
</div>
    <p>折扣：{{ coupon.discountValue }}{{ coupon.discountType === 'PERCENT' ? '%' : '元' }}</p>
    <p>{{ coupon.description }}</p>
    
  </div>
</div>

      </div>
      <button type="button" class="func" @click="cancel">返回</button>
    </div>
  </template>
  
  
  <script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'vue-router'

const router = useRouter()
const coupons = ref([])
const loading = ref(true)
const token = localStorage.getItem('token')
const userId = jwtDecode(token).userId

const currentStatus = ref('ACTIVE')
const statusTabs = ['ACTIVE', 'USED', 'EXPIRED']
const statusLabel = {
  ACTIVE: '可使用',
  USED: '已使用',
  EXPIRED: '已過期'
}

const statusClass = (status) => {
  switch (status) {
    case 'USED': return 'used'
    case 'EXPIRED': return 'expired'
    default: return 'active'
  }
}

const handleImageError = (event) => {
  const target = event.target
  if (target && target.tagName === 'IMG') {
    target.src = '/img/default_coupon.jpg'
  }
}
const fullImageUrl = (path) => {
  if (!path) return '/img/default_coupon.jpg';
  if (path.startsWith('http')) return path;
  return `http://localhost:8081${path}`;
};
async function fetchCoupons() {
  loading.value = true
  try {
    const res = await axios.get(`http://localhost:8081/api/user-coupons/with-banner/${userId}`, {
      params: { status: currentStatus.value },
      headers: { Authorization: `Bearer ${token}` }
    })
    coupons.value = res.data
  } catch (err) {
    console.error('取得優惠券失敗', err)
    coupons.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function discountTypeLabel(type) {
  if (type === 'PERCENT') return '百分比折扣'
  if (type === 'FLAT') return '現金折抵'
  return type
}

function cancel() {
  router.push('/memberCenter')
}

watch(currentStatus, fetchCoupons)
onMounted(fetchCoupons)
</script>

  
  <style scoped>
  .container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
  }
  
  .tabs {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .tabs button {
    background-color: #eee;
    border: none;
    padding: 10px 18px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .tabs button.active {
    background-color: #ff9b20;
    color: white;
  }
  
  .coupon-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  
  .coupon-card {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);
    background: #fff;
    text-align: center;
  }
  
  .coupon-card h3 {
    color: #ff7b00;
    margin-bottom: 8px;
  }
  
  .coupon-card img.banner {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 12px;
  }
  
  .active {
    color: green;
  }
  .used {
    color: #999;
    text-decoration: line-through;
  }
  .expired {
    color: red;
  }

  .func {
    display: inline-block;
    padding: 15px 25px;
    font-size: 24px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    outline: none;
    color: #fff;
    background-color: #04AA6D;
    border: none;
    border-radius: 15px;
    box-shadow: 0 9px #999;
}

.func:hover {
    background-color: #3e8e41;
}

.func:active {
    background-color: #3e8e41;
    box-shadow: 0 5px #666;
    transform: translateY(4px);
}

.coupon-card {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);
  background: #fff;
  text-align: left;
  gap: 16px;
}

.card-left {
  flex: 0 0 120px;
}

.card-left img.banner {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.card-header h3 {
  color: #ff7b00;
  font-size: 18px;
  margin: 0;
}

.end-date {
  font-size: 14px;
  color: #666;
}

.right-info {
  text-align: right;
}

.status-badge {
  font-size: 13px;
  font-weight: bold;
  margin-top: 4px;
}

.status-badge.active {
  color: green;
}

.status-badge.used {
  color: #999;
  text-decoration: line-through;
}

.status-badge.expired {
  color: red;
}

  </style>
  