<template>
    <div class="product-modal" v-if="visible" @click.self="close">
        <div class="modal-content">
            <div class="close-button-container">
                <span class="close-button" @click="close">&times;</span>
            </div>

            <div v-if="loading" class="loading-spinner">
                <div class="spinner"></div>
                <p>載入商品中...</p>
            </div>

            <div v-else-if="product" class="product-detail">
                <div class="product-image-container">
                    <img :src="product.primaryImageUrl
                        ? product.primaryImageUrl.startsWith('http')
                            ? product.primaryImageUrl
                            : `${baseUrl}${product.primaryImageUrl}`
                        : defaultImage" :alt="product.productName" class="product-main-image">
                    <!-- 如果有多張圖片，可以顯示縮略圖 -->
                    <div class="product-thumbnails" v-if="product.images && product.images.length > 0">
                        <div v-for="(image, index) in product.images.slice(0, 4)" :key="index" class="thumbnail">
                            <img :src="image" :alt="product.productName + ' 圖片 ' + (index + 1)">
                        </div>
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-header">
                        <h2>{{ product.productName }}</h2>
                        <div class="product-id">商品編號: {{ product.productId }}</div>
                    </div>

                    <div class="price-rating">
                        <div class="price-container">
                            <p class="price-label">售價</p>
                            <p class="price" v-if="product.minPrice === product.maxPrice">
                                $ {{ product.minPrice ? formatPrice(product.minPrice) : '未定價' }}
                            </p>
                            <p class="price" v-else>
                                $ {{ product.minPrice ? formatPrice(product.minPrice) : '未定價' }} -
                                {{ product.maxPrice ? formatPrice(product.maxPrice) : '' }}
                            </p>
                        </div>
                        <div class="rating-container">
                            <div class="rating">
                                <span class="stars">⭐</span>
                                <span>{{ product.rating || "暫無評分" }}</span>
                            </div>
                            <div class="sold-count">
                                已售出 {{ product.soldCount || 0 }} 件
                            </div>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="description">
                        <h3>商品描述</h3>
                        <p>{{ product.description || '暫無描述' }}</p>
                    </div>

                    <div class="specifications" v-if="product.specs && product.specs.length > 0">
                        <h3>規格</h3>
                        <div class="specs-grid">
                            <div v-for="(spec, index) in product.specs" :key="index" class="spec-item">
                                <strong>{{ spec.name }}:</strong> {{ spec.value }}
                            </div>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="purchase-section">
                        <div class="quantity-section">
                            <label for="quantity">數量:</label>
                            <div class="quantity-control">
                                <button class="quantity-btn minus" @click="decreaseQuantity">-</button>
                                <input type="number" id="quantity" v-model.number="quantity" min="1">
                                <button class="quantity-btn plus" @click="increaseQuantity">+</button>
                            </div>
                            <span class="stock" v-if="product.stock">庫存: {{ product.stock }} 件</span>
                        </div>

                        <div class="action-buttons">
                            <button class="add-to-cart" @click="addToCart">
                                <span class="icon">🛒</span> 加入購物車
                            </button>
                            <button class="buy-now" @click="buyNow">
                                <span class="icon">💳</span> 立即購買
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="product" class="product-tabs">
                <div class="tab-buttons">
                    <button v-for="tab in tabs" :key="tab.id" class="tab-button"
                        :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
                        {{ tab.name }}
                    </button>
                </div>

                <div class="tab-content">
                    <div id="details" class="tab-pane" :class="{ active: activeTab === 'details' }">
                        <h3>商品詳情</h3>
                        <div class="details-content">
                            {{ product.details || product.description || '暫無詳細資訊' }}
                        </div>
                    </div>

                    <div id="reviews" class="tab-pane" :class="{ active: activeTab === 'reviews' }">
                        <h3>顧客評價</h3>
                        <div v-if="product.reviews && product.reviews.length > 0" class="reviews-list">
                            <div v-for="(review, index) in product.reviews" :key="index" class="review-item">
                                <div class="review-header">
                                    <div class="reviewer-info">
                                        <span class="avatar">👤</span>
                                        <strong>{{ review.user }}</strong>
                                    </div>
                                    <div class="review-rating">
                                        {{ review.rating }} <span class="star">⭐</span>
                                    </div>
                                </div>
                                <p class="review-content">{{ review.content }}</p>
                                <div class="review-date" v-if="review.date">{{ review.date }}</div>
                            </div>
                        </div>
                        <div v-else class="no-reviews">
                            <p>暫無評價</p>
                            <button class="be-first-reviewer" v-if="product.active">成為第一個評論者</button>
                        </div>
                    </div>

                    <div id="shipping" class="tab-pane" :class="{ active: activeTab === 'shipping' }">
                        <h3>運送與退貨政策</h3>
                        <div class="shipping-info">
                            <div class="info-item">
                                <div class="info-icon">🚚</div>
                                <div class="info-content">
                                    <h4>台灣本島地區</h4>
                                    <p>購物滿 $500 即可享有免運費服務</p>
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-icon">🏝️</div>
                                <div class="info-content">
                                    <h4>外島地區</h4>
                                    <p>運費 $100，購物滿 $1000 免運費</p>
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-icon">↩️</div>
                                <div class="info-content">
                                    <h4>退貨政策</h4>
                                    <p>商品收到後 7 天內可申請無條件退貨</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from '@/plugins/axios';
import Swal from 'sweetalert2';

const formatPrice = (price) => {
    // 檢查 price 是否為 undefined、null 或非數字
    if (price === undefined || price === null || isNaN(Number(price))) {
        return '未定價';
    }
    // 將 price 轉換為數字並格式化
    return Number(price).toLocaleString('zh-TW');
};


const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    productId: {
        type: [String, Number],
        default: null
    }
});

const emit = defineEmits(['update:visible', 'close', 'add-to-cart', 'buy-now']);

// 數據
const product = ref(null);
const loading = ref(false);
const quantity = ref(1);
const activeTab = ref('details');
const baseUrl = ref(import.meta.env.VITE_API_URL);
const defaultImage = '/src/assets/default-image.png';

// 標籤頁
const tabs = [
    { id: 'details', name: '詳細資訊' },
    { id: 'reviews', name: '顧客評價' },
    { id: 'shipping', name: '運送與退貨' }
];

// 監聽商品ID變化
onMounted(() => {
    if (props.productId && props.visible) {
        fetchProductDetail(props.productId);
    }
});

// 監聽彈窗狀態變化
watch(() => props.visible, (newVal) => {
    if (newVal && props.productId) {
        fetchProductDetail(props.productId);
    }

    // 重置數量
    if (newVal) {
        quantity.value = 1;
    }
});

// 獲取商品詳情
const fetchProductDetail = async (productId) => {
    loading.value = true;
    try {
        const response = await axios.get(`/api/products/${productId}`);
        if (response.data) {
            product.value = response.data;

            // 如果沒有評價資料，添加空數組
            if (!product.value.reviews) {
                product.value.reviews = [];
            }
        }
    } catch (error) {
        console.error('獲取商品詳情失敗:', error);
        Swal.fire({
            title: '錯誤',
            text: '無法獲取商品詳情',
            icon: 'error',
            confirmButtonText: '確定'
        });
    } finally {
        loading.value = false;
    }
};

// 關閉彈窗
const close = () => {
    emit('update:visible', false);
    emit('close');
};

// 減少數量
const decreaseQuantity = () => {
    if (quantity.value > 1) {
        quantity.value--;
    }
};

// 增加數量
const increaseQuantity = () => {
    quantity.value++;
};

// 添加到購物車
const addToCart = () => {
    if (!product.value) return;

    emit('add-to-cart', {
        productId: props.productId,
        quantity: quantity.value
    });

    Swal.fire({
        title: '成功',
        text: `已添加 ${quantity.value} 件商品到購物車`,
        icon: 'success',
        showConfirmButton: false,
        timer: 1500
    });
};

// 立即購買
// 修改ProductDetail.vue文件中的buyNow函數

// 立即購買
const buyNow = async () => {
    if (!product.value) return;

    try {
        // 顯示處理中提示
        Swal.fire({
            title: '訂單建立中',
            text: '請稍候...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // 1. 創建訂單
        const orderData = {
            productId: props.productId,
            quantity: quantity.value,
            price: product.value.minPrice || 0,
            productName: product.value.productName
        };

        // 創建訂單
        const response = await axios.post('/api/orders/create', orderData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.orderId) {
            // 2. 獲取到訂單ID後，重定向到 ECPay 支付
            await redirectToECPay(response.data.orderId);
        } else {
            throw new Error('訂單創建失敗');
        }
    } catch (error) {
        console.error('購買失敗:', error);
        Swal.close();
        Swal.fire({
            title: '錯誤',
            text: error.response?.data?.message || '訂單創建失敗，請稍後再試',
            icon: 'error',
            confirmButtonText: '確定'
        });
    } finally {
        // 關閉彈窗
        emit('update:visible', false);
        emit('close');
    }
};

// 重定向到 ECPay 的函數
const redirectToECPay = async (orderId) => {
    try {
        // 獲取支付表單
        const headers = {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
        };

        const response = await axios.get(`/api/payment/redirect/${orderId}`, {
            headers,
            responseType: 'json',
        });

        // 處理支付表單
        if (response.data && response.data.formHtml) {
            // 創建一個臨時div來插入HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = response.data.formHtml;

            const form = tempDiv.querySelector('form');
            if (form) {
                document.body.appendChild(form);
                Swal.close();
                form.submit();
            } else {
                throw new Error('未找到支付表單');
            }
        } else if (response.data && response.data.redirectUrl) {
            // 如果有重定向URL，直接跳轉
            Swal.close();
            window.location.href = response.data.redirectUrl;
        } else {
            throw new Error('未獲得付款重定向信息');
        }
    } catch (error) {
        console.error('支付發起失敗:', error);
        Swal.close();

        Swal.fire({
            title: '支付發起失敗',
            text: error.message || '請稍後再試',
            icon: 'error',
            confirmButtonText: '確定'
        });
    }
};
</script>

<style scoped>
.product-modal {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.65);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #fff;
    margin: 2% auto;
    padding: 25px;
    border-radius: 12px;
    width: 90%;
    max-width: 1280px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    max-height: 95vh;
    overflow-y: auto;
    position: relative;
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.close-button-container {
    position: absolute;
    top: 15px;
    right: 20px;
    z-index: 10;
}

.close-button {
    color: #999;
    font-size: 32px;
    font-weight: bold;
    cursor: pointer;
    transition: color 0.2s;
}

.close-button:hover {
    color: #ff4757;
}

.product-detail {
    display: flex;
    margin-bottom: 30px;
    gap: 40px;
}

.product-image-container {
    flex: 0 0 45%;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.product-main-image {
    width: 100%;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    object-fit: cover;
    height: 400px;
    background-color: #f8f8f8;
    transition: transform 0.3s;
}

.product-main-image:hover {
    transform: scale(1.02);
}

.product-thumbnails {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 5px;
}

.thumbnail {
    width: 70px;
    height: 70px;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid #ddd;
    transition: border 0.2s;
}

.thumbnail:hover {
    border-color: #ff4757;
}

.thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.product-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.product-header h2 {
    margin: 0;
    font-size: 2rem;
    color: #333;
    line-height: 1.3;
}

.product-id {
    color: #777;
    font-size: 0.9rem;
}

.price-rating {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background-color: #f9f5eb;
    padding: 15px;
    border-radius: 10px;
}

.price-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.price-label {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
}

.price {
    font-size: 2rem;
    color: #ff4757;
    font-weight: bold;
    margin: 0;
}

.rating-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
}

.rating {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 1.1rem;
}

.stars {
    color: #f39c12;
}

.sold-count {
    color: #666;
    font-size: 0.9rem;
}

.divider {
    height: 1px;
    background-color: #eee;
    margin: 5px 0;
}

.description,
.specifications {
    margin-bottom: 10px;
}

.description h3,
.specifications h3 {
    font-size: 1.3rem;
    margin-bottom: 12px;
    color: #333;
    border-left: 4px solid #ff4757;
    padding-left: 10px;
}

.description p {
    line-height: 1.6;
    color: #444;
}

.specs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.spec-item {
    background-color: #f7f7f7;
    padding: 10px 15px;
    border-radius: 6px;
}

.purchase-section {
    background-color: #f9f5eb;
    padding: 20px;
    border-radius: 10px;
    margin-top: 10px;
}

.quantity-section {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}

.quantity-section label {
    font-weight: bold;
    color: #333;
}

.quantity-control {
    display: flex;
    align-items: center;
}

.quantity-btn {
    width: 36px;
    height: 36px;
    background-color: #fff;
    border: 1px solid #ddd;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.quantity-btn.minus {
    border-radius: 6px 0 0 6px;
}

.quantity-btn.plus {
    border-radius: 0 6px 6px 0;
}

.quantity-btn:hover {
    background-color: #f0f0f0;
}

.quantity input {
    width: 60px;
    height: 36px;
    text-align: center;
    border: 1px solid #ddd;
    border-left: none;
    border-right: none;
    font-size: 16px;
}

.stock {
    color: #666;
    font-size: 0.9rem;
}

.action-buttons {
    display: flex;
    gap: 15px;
}

.action-buttons button {
    flex: 1;
    padding: 12px 20px;
    font-size: 1.1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
}

.add-to-cart {
    background-color: #ff6b6b;
    color: white;
    border: 1px solid #ff6b6b;
}

.add-to-cart:hover {
    background-color: #ff4757;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
}

.buy-now {
    background-color: #ff4757;
    color: white;
}

.buy-now:hover {
    background-color: #e03b4b;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
}

.icon {
    font-size: 1.2rem;
}

.product-tabs {
    margin-top: 30px;
    border: 1px solid #eee;
    border-radius: 10px;
    overflow: hidden;
}

.tab-buttons {
    display: flex;
    background-color: #f9f9f9;
}

.tab-button {
    padding: 15px 25px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    position: relative;
    color: #666;
    transition: all 0.2s;
}

.tab-button:hover {
    color: #ff4757;
}

.tab-button.active {
    color: #ff4757;
    font-weight: bold;
}

.tab-button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #ff4757;
}

.tab-pane {
    display: none;
    padding: 25px;
}

.tab-pane.active {
    display: block;
}

.details-content {
    line-height: 1.7;
    color: #444;
}

.reviews-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.review-item {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 10px;
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.reviewer-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.avatar {
    font-size: 1.5rem;
}

.review-rating {
    background-color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
}

.star {
    color: #f39c12;
}

.review-content {
    line-height: 1.6;
    margin: 10px 0;
}

.review-date {
    text-align: right;
    color: #888;
    font-size: 0.85rem;
}

.no-reviews {
    text-align: center;
    padding: 30px;
    color: #777;
}

.be-first-reviewer {
    background-color: #f0f0f0;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    margin-top: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.be-first-reviewer:hover {
    background-color: #e0e0e0;
}

.shipping-info {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-item {
    display: flex;
    gap: 15px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 10px;
}

.info-icon {
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
}

.info-content {
    flex: 1;
}

.info-content h4 {
    margin: 0 0 8px 0;
    color: #333;
}

.info-content p {
    margin: 0;
    color: #666;
    line-height: 1.5;
}

/* 載入動畫 */
.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
}

.spinner {
    border: 5px solid rgba(255, 71, 87, 0.1);
    border-radius: 50%;
    border-top: 5px solid #ff4757;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 響應式樣式 */
@media (max-width: 992px) {
    .product-detail {
        flex-direction: column;
    }

    .product-image-container {
        margin-right: 0;
        margin-bottom: 30px;
    }

    .modal-content {
        width: 95%;
        padding: 20px 15px;
        margin: 3% auto;
    }

    .price-rating {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .rating-container {
        align-items: flex-start;
    }
}

@media (max-width: 576px) {
    .action-buttons {
        flex-direction: column;
    }

    .quantity-section {
        flex-wrap: wrap;
    }

    .tab-button {
        padding: 12px 15px;
        font-size: 0.95rem;
    }

    .tab-pane {
        padding: 20px 15px;
    }
}
</style>