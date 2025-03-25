<template>
  <div class="user-orders">
    <h2 v-if="isSeller">📦 賣家訂單管理</h2>
    <h2 v-else-if="isUser">🛍 我的訂單</h2>
    <h2 v-else>訂單</h2>

    <!-- 搜索和篩選區域 -->
    <div class="filters">
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="搜尋商品或訂單號碼" @input="filterOrders" />
      </div>
      <div class="filter-controls">
        <select v-model="statusFilter" @change="filterOrders">
          <option value="all">所有狀態</option>
          <option value="待付款">待付款</option>
          <option value="處理中">處理中</option>
          <option value="已出貨">已出貨</option>
          <option value="已完成">已完成</option>
          <option value="已取消">已取消</option>
        </select>
        <select v-model="timeFilter" @change="filterOrders">
          <option value="all">所有時間</option>
          <option value="month">最近一個月</option>
          <option value="three_months">最近三個月</option>
          <option value="six_months">最近六個月</option>
          <option value="year">最近一年</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">加載中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="filteredOrders.length === 0" class="no-orders">
      您目前沒有符合條件的訂單記錄
    </div>

    <!-- 訂單列表區域 -->
    <div v-else class="orders-container">
      <div v-for="order in displayedOrders" :key="order.orderId" class="order-card"
        :class="{ expanded: expandedOrderId === order.orderId }">
        <!-- 訂單基本資訊區塊 -->
        <div class="order-header" @click="toggleOrderDetails(order.orderId)">
          <div class="order-summary">
            <div class="order-id-date">
              <span class="order-id">訂單編號: {{ order.orderId }}</span>
              <span class="created-at">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-status" :class="getStatusClass(order.status)">
              {{ order.status }}
            </div>
          </div>
          <div class="order-brief">
            <span class="items-count">{{ getTotalItems(order) }}件商品</span>
            <span class="price">
              總金額: NT${{ order.totalPrice.toLocaleString() }}
            </span>
            <span class="expand-icon">
              {{ expandedOrderId === order.orderId ? "▲" : "▼" }}
            </span>
          </div>
        </div>

        <!-- 訂單詳細資訊區塊 -->
        <div v-if="expandedOrderId === order.orderId" class="order-details">
          <!-- 商品明細 -->
          <div class="products-section">
            <h3>商品明細</h3>
            <div class="product-items">
              <div v-for="item in order.items" :key="item.productId" class="product-item">
                <div class="product-image">
                  <img :src="getProductImageUrl(item)" :alt="item.productName" style="
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      display: block;
                    " />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ item.productName }}</div>
                  <div v-if="item.specs" class="product-specs">
                    {{ item.specs }}
                  </div>
                </div>
                <div class="product-quantity">x{{ item.quantity }}</div>
                <div class="product-price">
                  NT${{ (item.price > 0 ? item.price : item.unitPrice).toLocaleString() }}
                </div>
                <div class="product-subtotal">
                  NT${{ ((item.price > 0 ? item.price : item.unitPrice) * item.quantity).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>

          <!-- 訂單摘要和配送資訊 -->
          <div class="order-summary-delivery">
            <div class="price-summary">
              <h3>金額摘要</h3>
              <div class="summary-row">
                <span>商品小計:</span>
                <span>
                  NT${{
                    order.subtotal
                      ? order.subtotal.toLocaleString()
                      : order.totalPrice.toLocaleString()
                  }}
                </span>
              </div>
              <div v-if="order.shippingFee" class="summary-row">
                <span>運費:</span>
                <span>NT${{ order.shippingFee.toLocaleString() }}</span>
              </div>
              <div v-if="order.discount" class="summary-row">
                <span>折扣:</span>
                <span>-NT${{ order.discount.toLocaleString() }}</span>
              </div>
              <div class="summary-row total">
                <span>總金額:</span>
                <span>NT${{ order.totalPrice.toLocaleString() }}</span>
              </div>
              <div v-if="order.paymentMethod" class="summary-row payment-method">
                <span>付款方式:</span>
                <span>{{ order.paymentMethod }}</span>
              </div>
            </div>

            <div v-if="order.shipping" class="delivery-info">
              <h3>配送資訊</h3>
              <div class="info-row">
                <span>收件人:</span>
                <span>{{ order.shipping.recipientName }}</span>
              </div>
              <div class="info-row">
                <span>連絡電話:</span>
                <span>{{ order.shipping.recipientPhone }}</span>
              </div>
              <div class="info-row">
                <span>配送地址:</span>
                <span>{{ order.shipping.address }}</span>
              </div>
              <div v-if="order.shipping.trackingNumber" class="info-row">
                <span>物流編號:</span>
                <span>{{ order.shipping.trackingNumber }}</span>
              </div>
              <div v-if="order.shipping.shippingMethod" class="info-row">
                <span>配送方式:</span>
                <span>{{ order.shipping.shippingMethod }}</span>
              </div>
            </div>
          </div>

          <!-- 訂單時間軌跡 -->
          <div v-if="order.statusHistory && order.statusHistory.length" class="order-timeline">
            <h3>訂單狀態追蹤</h3>
            <div class="timeline">
              <div v-for="(status, index) in order.statusHistory" :key="index" class="timeline-item"
                :class="{ current: status.status === order.status }">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-status">{{ status.status }}</div>
                  <div class="timeline-date">{{ formatDate(status.date) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 可執行的動作按鈕 -->
          <div class="order-actions">
            <button v-if="canRepurchase(order)" @click="repurchaseOrder(order.orderId)"
              class="action-btn repurchase-btn">
              再次購買
            </button>
            <button v-if="canCancel(order)" @click="cancelOrder(order.orderId)" class="action-btn cancel-btn">
              取消訂單
            </button>
            <button v-if="canPayNow(order)" @click="payOrder(order.orderId)" class="action-btn pay-btn">
              立即付款
            </button>
            <button v-if="canReview(order)" @click="reviewOrder(order.orderId)" class="action-btn review-btn">
              評價商品
            </button>
            <button v-if="canTrack(order)" @click="trackOrder(order.orderId)" class="action-btn track-btn">
              追蹤訂單
            </button>
            <button @click="contactSupport(order.orderId)" class="action-btn contact-btn">
              聯繫客服
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁控制 -->
    <div v-if="totalPages > 1" class="pagination">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
        上一頁
      </button>
      <div class="page-numbers">
        <button v-for="page in displayedPages" :key="page" @click="changePage(page)" class="page-number"
          :class="{ active: currentPage === page }">
          {{ page }}
        </button>
      </div>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">
        下一頁
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import axios from "@/plugins/axios"
import { useUserStore } from "@/stores/user"
import { imageMap } from "@/utils/imageMap"
import { useRouter } from 'vue-router'

// 在 setup 函數中定義
const router = useRouter()

const userStore = useUserStore()
const isSeller = computed(() => userStore.roles?.includes("SELLER"))
const isUser = computed(() => userStore.roles?.includes("USER"))

// 資料和狀態管理
const orders = ref([])
const filteredOrders = ref([])
const loading = ref(true)
const error = ref(null)
const expandedOrderId = ref(null)

// 篩選狀態
const searchQuery = ref("")
const statusFilter = ref("all")
const timeFilter = ref("all")

// 分頁狀態
const currentPage = ref(1)
const itemsPerPage = 5
const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / itemsPerPage)
)

// 顯示目前頁面的訂單
const displayedOrders = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredOrders.value.slice(startIndex, endIndex)
})

// 根據產品獲取圖片URL的函數
const getProductImageUrl = (item) => {
  // 調試輸出，查看接收到的項目數據
  console.log("產品項目:", item)

  // 對於無線滑鼠，直接返回固定圖片路徑
  if (item.productName && item.productName.includes("無線滑鼠")) {
    return "/assets/shopping.jpg"
  }

  // 如果有image屬性，直接使用它
  if (item.image && item.image.trim() !== "") {
    return `/assets/${item.image}`
  }

  // 如果有imageUrl屬性
  if (item.imageUrl && item.imageUrl.trim() !== "") {
    if (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/")) {
      return item.imageUrl
    } else {
      return `/assets/${item.imageUrl}`
    }
  }

  // 使用產品名稱嘗試映射
  if (item.productName) {
    for (const [key, value] of Object.entries(imageMap)) {
      if (item.productName.includes(key)) {
        return value
      }
    }
  }

  // 默認圖片
  return "/assets/image.png"
}

const displayedPages = computed(() => {
  const pages = []
  const maxPagesToShow = 5

  if (totalPages.value <= maxPagesToShow) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    let startPage = Math.max(1, currentPage.value - 2)
    let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1)

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
  }

  return pages
})

// 格式化日期函數
const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// 計算訂單總商品數量
const getTotalItems = (order) => {
  if (!order.items || !Array.isArray(order.items)) return 0
  return order.items.reduce((total, item) => total + (item.quantity || 0), 0)
}

// 根據訂單狀態獲取對應的CSS類名
const getStatusClass = (status) => {
  const statusMap = {
    待付款: "status-pending",
    處理中: "status-processing",
    已出貨: "status-shipped",
    已完成: "status-completed",
    已取消: "status-canceled",
  }

  return statusMap[status] || "status-default"
}

// 篩選訂單
const filterOrders = () => {
  let filtered = [...orders.value]

  // 搜尋條件過濾
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((order) => {
      // 檢查訂單編號
      if (order.orderId.toLowerCase().includes(query)) return true

      // 檢查商品名稱
      return (
        order.items &&
        Array.isArray(order.items) &&
        order.items.some(
          (item) =>
            item.productName && item.productName.toLowerCase().includes(query)
        )
      )
    })
  }

  // 狀態過濾
  if (statusFilter.value !== "all") {
    filtered = filtered.filter((order) => order.status === statusFilter.value)
  }

  // 時間過濾
  if (timeFilter.value !== "all") {
    const now = new Date()
    const timeFilterMap = {
      month: 30,
      three_months: 90,
      six_months: 180,
      year: 365,
    }

    const daysBack = timeFilterMap[timeFilter.value]
    if (daysBack) {
      const cutoffDate = new Date(now.setDate(now.getDate() - daysBack))
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= cutoffDate
      )
    }
  }

  filteredOrders.value = filtered
  currentPage.value = 1 // 重設頁數
}

// 切換訂單詳情展開/收起
const toggleOrderDetails = (orderId) => {
  if (expandedOrderId.value === orderId) {
    expandedOrderId.value = null
  } else {
    expandedOrderId.value = orderId
  }
}

// 分頁功能
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // 當切換頁面時，收起任何展開的訂單詳情
    expandedOrderId.value = null
  }
}

// 檢查訂單可執行的動作
const canRepurchase = (order) => {
  return order.status === "已完成" || order.status === "已取消"
}

const canCancel = (order) => {
  return order.status === "待付款" || order.status === "處理中"
}

const canPayNow = (order) => {
  // 檢查訂單狀態是否為「待付款」
  const isPendingPayment = order.status === '待付款' || order.status === 'PENDING'

  // 檢查訂單是否存在且有效
  const isValidOrder = order && order.orderId

  // 檢查用戶是否已登入
  const isLoggedIn = Boolean(userStore.token)

  // 返回所有條件都滿足的結果
  return isPendingPayment && isValidOrder && isLoggedIn
}

const canReview = (order) => {
  return order.status === "已完成" && !order.isReviewed
}

const canTrack = (order) => {
  return (
    order.status === "已出貨" && order.shipping && order.shipping.trackingNumber
  )
}

// 訂單相關操作功能
const repurchaseOrder = async (orderId) => {
  try {
    await axios.post(
      `/api/orders/repurchase/${orderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      }
    )
    alert("已將商品加入購物車")
  } catch (err) {
    alert("再次購買失敗: " + (err.response?.data?.message || err.message))
  }
}

const cancelOrder = async (orderId) => {
  if (!confirm("確定要取消此訂單嗎？")) return

  try {
    await axios.put(
      `/api/orders/cancel/${orderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      }
    )
    alert("訂單已取消")
    fetchOrders() // 重新獲取訂單資料
  } catch (err) {
    alert("取消訂單失敗: " + (err.response?.data?.message || err.message))
  }
}

// 立即付款方法
// 立即付款方法
const payOrder = async (orderId) => {
  try {
    console.log('開始付款流程，訂單ID:', orderId)

    // 移除未定義的 showLoadingToast
    // const loadingToast = showLoadingToast ? showLoadingToast('檢查訂單狀態...') : null

    // 先調用API檢查訂單是否可以付款
    const checkResponse = await axios.get(`/api/orders/check-payment/${orderId}`, {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
        'Accept': 'application/json'
      }
    })

    console.log('檢查付款狀態回應:', checkResponse)

    // 如果API返回訂單不可付款，顯示相應提示
    if (checkResponse.data && checkResponse.data.status === 'success') {
      console.log('訂單建立成功，準備跳轉')
      router.push(`/checkout/payment/${orderId}`)
    } else {
      console.warn('訂單建立失敗', checkResponse.data)
      // 可以添加錯誤提示邏輯
      alert(checkResponse.data.message || '訂單建立失敗，請稍後再試')
    }

    // 檢查回應是否包含成功狀態
    if (!checkResponse.data || checkResponse.data.status !== 'success') {
      console.warn('檢查API返回了意外的格式:', checkResponse.data)
    }

    console.log('訂單檢查通過，準備跳轉到付款頁面')

    // 如果可以付款，繼續跳轉到付款頁面
    router.push(`/checkout/pay/${orderId}`)

  } catch (error) {
    console.error('付款檢查錯誤:', error)

    // 根據錯誤類型提供適當的錯誤信息
    let errorMessage = '付款流程發生錯誤，請稍後再試'

    if (error.response) {
      // 服務器回應了錯誤狀態碼
      const status = error.response.status

      if (status === 404) {
        errorMessage = '找不到訂單或付款檢查API尚未實現'
        console.log('API未實現，嘗試直接跳轉到付款頁面')

        // 如果是404錯誤（API可能尚未實現），嘗試直接跳轉
        router.push(`/checkout/pay/${orderId}`)
        return
      } else if (status === 401) {
        errorMessage = '您的登入已過期，請重新登入'
      } else if (status === 403) {
        errorMessage = '您沒有權限操作此訂單'
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      }
    } else if (error.request) {
      // 請求已發送但沒有收到回應
      errorMessage = '無法連接到伺服器，請檢查您的網路連接'
    }

    alert(errorMessage)
  }
}

const reviewOrder = (orderId) => {
  window.location.href = `/review/order/${orderId}`
}

const trackOrder = (orderId) => {
  // 根據您的物流追蹤系統實現
  // 例如開啟一個模態框或跳轉到物流追蹤頁面
  window.open(`/track-shipment/${orderId}`, "_blank")
}

const contactSupport = (orderId) => {
  window.location.href = `/support/contact?orderId=${orderId}`
}

// 獲取訂單資料函數
const fetchOrders = async () => {
  loading.value = true
  error.value = null

  try {
    // 檢查 token
    if (!userStore.token) {
      error.value = "您尚未登入或登入已過期，請重新登入"
      loading.value = false
      return
    }

    // 輸出調試信息
    console.log("⏳ 準備獲取訂單...")
    console.log("📝 當前Token:", userStore.token.substring(0, 15) + "...")
    console.log("📝 當前用戶角色:", userStore.roles)

    // 根據角色選擇適當的 API
    let apiUrl
    if (isSeller.value) {
      apiUrl = "/api/orders/seller/orders"
    } else if (isUser.value) {
      apiUrl = "/api/orders/user/orders"
    } else {
      error.value = "您沒有適當的角色權限"
      loading.value = false
      return
    }

    console.log("📤 發送請求:", apiUrl)

    // 發送請求，確保包含 Authorization header
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    })

    console.log("📥 收到回應:", response)

    // 處理 API 回應格式
    if (response.data && response.data.hasOwnProperty("statusCode")) {
      // API 回應格式 { statusCode, status, message, data }
      if (response.data.status === "success") {
        orders.value = response.data.data || []
        console.log("✅ 訂單數據:", response.data.message)
      } else {
        error.value = response.data.message || "獲取訂單失敗"
      }
    } else {
      // 舊的直接數據格式
      orders.value = response.data || []
    }

    // 在這裡添加調試輸出
    console.log("API 返回的訂單:", orders.value)
    if (orders.value.length > 0) {
      console.log("第一個訂單:", orders.value[0])
      if (orders.value[0].items && orders.value[0].items.length > 0) {
        console.log("第一個訂單的第一個項目:", orders.value[0].items[0])
      }
    }

    // 防護性檢查，確保每個訂單都有必要的欄位
    orders.value = orders.value.map((order) => {
      // 確保訂單有items陣列
      if (!order.items || !Array.isArray(order.items)) {
        order.items = []
      }

      // 確保totalPrice是數字
      if (typeof order.totalPrice !== "number") {
        order.totalPrice = parseFloat(order.totalPrice) || 0
      }

      // 確保每個item都有必要的屬性
      order.items = order.items.map((item) => {
        return {
          productId:
            item.productId ||
            `item-${Math.random().toString(36).substring(2, 9)}`,
          productName: item.productName || "未知商品",
          price:
            typeof item.price === "number" && item.price > 0
              ? item.price
              : (typeof item.unitPrice === "number" ? item.unitPrice : 0),
          quantity:
            typeof item.quantity === "number"
              ? item.quantity
              : parseInt(item.quantity) || 1,
          imageUrl: item.imageUrl || "",
          image: item.image || "",
          specs: item.specs || "",
          ...item,
        }
      })

      return order
    })

    // 初始化篩選後的訂單數據
    filteredOrders.value = [...orders.value]
    loading.value = false

  } catch (err) {
    console.error("❌ 獲取訂單錯誤:", err)

    // 處理不同類型的錯誤
    if (err.response) {
      // 服務器回應錯誤
      const statusCode = err.response.status
      const responseData = err.response.data

      console.error(`服務器錯誤(${statusCode}):`, responseData)

      if (statusCode === 403) {
        error.value = `權限不足，您沒有權限查看這些訂單 (角色: ${userStore.roles?.join(", ") || "無"})`
      } else if (statusCode === 401) {
        error.value = "登入已過期，請重新登入"
        // 可能需要重新導向到登入頁面
        // window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      } else {
        error.value = responseData.message || "獲取訂單時出現問題"
      }
    } else if (err.request) {
      // 請求發送但沒有收到回應
      error.value = "無法連接到伺服器，請檢查網絡連接"
    } else {
      // 請求設置出問題
      error.value = "訂單請求錯誤: " + err.message
    }

    loading.value = false
  }
}

// 監聽篩選條件變化
watch([searchQuery, statusFilter, timeFilter], () => {
  filterOrders()
})

// 在組件掛載時獲取訂單
onMounted(() => {
  console.log("當前用戶角色:", userStore.roles)
  fetchOrders()
})
</script>

<style scoped>
.user-orders {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
  font-family: "Microsoft JhengHei", Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
}

h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

/* 搜索和篩選區域 */
.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.filter-controls select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: white;
  font-size: 14px;
}

/* 加載和錯誤消息 */
.loading,
.error-message,
.no-orders {
  text-align: center;
  padding: 30px;
  margin: 20px 0;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-size: 16px;
}

.error-message {
  color: #dc3545;
  border: 1px solid #dc3545;
}

/* 訂單卡片樣式 */
.orders-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card.expanded {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.order-header {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.order-header:hover {
  background-color: #f9f9f9;
}

.order-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-id-date {
  display: flex;
  flex-direction: column;
}

.order-id {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.created-at {
  color: #777;
  font-size: 13px;
  margin-top: 3px;
}

.order-status {
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-processing {
  background-color: #cce5ff;
  color: #004085;
}

.status-shipped {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-canceled {
  background-color: #f8d7da;
  color: #721c24;
}

.order-brief {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-count {
  color: #555;
  font-size: 14px;
}

.price {
  font-weight: bold;
  color: #28a745;
  font-size: 16px;
}

.expand-icon {
  color: #777;
  font-size: 16px;
}

/* 訂單詳情樣式 */
.order-details {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 商品明細區塊 */
.products-section {
  margin-bottom: 20px;
}

.product-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.product-image {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  border-radius: 5px;
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #ddd;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.product-name {
  font-weight: bold;
  color: #333;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-specs {
  color: #777;
  font-size: 13px;
}

.product-quantity,
.product-price,
.product-subtotal {
  padding: 0 10px;
  color: #333;
  font-size: 14px;
  min-width: 80px;
  text-align: right;
}

.product-subtotal {
  font-weight: bold;
  color: #28a745;
}

/* 摘要和配送資訊區塊 */
.order-summary-delivery {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.price-summary,
.delivery-info {
  flex: 1;
  min-width: 300px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.summary-row,
.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}

.summary-row.total {
  font-weight: bold;
  font-size: 16px;
  color: #28a745;
  border-top: 1px solid #ddd;
  padding-top: 10px;
  margin-top: 10px;
}

/* 訂單時間軌跡 */
.order-timeline {
  margin-top: 20px;
}

.timeline {
  position: relative;
  padding-left: 20px;
}

.timeline:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #ddd;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
  color: #666;
}

.timeline-item.current {
  color: #007bff;
}

.timeline-dot {
  position: absolute;
  left: -9px;
  top: 5px;
  width: 16px;
  height: 16px;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 50%;
}

.timeline-item.current .timeline-dot {
  border-color: #007bff;
  background-color: #007bff;
}

.timeline-content {
  margin-left: 20px;
}

.timeline-status {
  font-weight: bold;
  margin-bottom: 5px;
}

.timeline-date {
  font-size: 13px;
  color: #777;
}

/* 按鈕區塊 */
.order-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.repurchase-btn {
  background-color: #28a745;
  color: white;
}

.repurchase-btn:hover {
  background-color: #218838;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
}

.cancel-btn:hover {
  background-color: #c82333;
}

.pay-btn {
  background-color: #007bff;
  color: white;
}

.pay-btn:hover {
  background-color: #0069d9;
}

.review-btn {
  background-color: #17a2b8;
  color: white;
}

.review-btn:hover {
  background-color: #138496;
}

.track-btn {
  background-color: #6c757d;
  color: white;
}

.track-btn:hover {
  background-color: #5a6268;
}

.contact-btn {
  background-color: #ffc107;
  color: #212529;
}

.contact-btn:hover {
  background-color: #e0a800;
}

/* 分頁控制 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 10px;
  align-items: center;
}

.page-btn {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number {
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
}

.page-number.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

/* 響應式設計 */
@media (max-width: 768px) {

  .order-summary,
  .order-brief {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .order-status {
    align-self: flex-start;
  }

  .product-item {
    flex-wrap: wrap;
  }

  .product-image {
    margin-bottom: 10px;
  }

  .product-quantity,
  .product-price,
  .product-subtotal {
    text-align: left;
    padding: 5px 0;
  }

  .order-actions {
    justify-content: center;
  }
}
</style>