<template>
    <div class="sidebar">
        <router-link to="/admin/dashboard">📊 儀表板</router-link>
        <router-link to="/admin/orders">📦 訂單管理</router-link>
        <router-link to="/admin/orders/all">📜 所有訂單</router-link>
        <router-link to="/admin/orders/pending">⏳ 待處理訂單</router-link>
        <router-link to="/admin/orders/cancelled">❌ 取消/退貨</router-link>
        <router-link to="/admin/products">🛒 商品管理</router-link>
        <router-link to="/admin/products/categories">📑 商品分類</router-link>
        <router-link to="/admin/products/tags">🔖 商品標籤</router-link>
        <router-link to="/admin/users">👥 會員管理</router-link>
        <router-link to="/admin/users/customers">🙍‍♂️ 客戶管理</router-link>
        <router-link to="/admin/users/sellers">🛍 商家管理</router-link>
        <router-link to="/admin/coupons">🎟️ 優惠券管理</router-link>
        <router-link to="/admin/analytics">📊 數據分析</router-link>
        <router-link to="/admin/analytics/sales">📈 銷售報告</router-link>
        <router-link to="/admin/analytics/user-behavior">👥 用戶行為分析</router-link>
        <router-link to="/admin/settings">⚙️ 系統設定</router-link>
        <router-link to="/admin/settings/admins">🔧 管理員帳號</router-link>
        <router-link to="/admin/settings/platform">🛠 平台設定</router-link>
    </div>
</template>

<style scoped>
.sidebar {
    width: 260px;
    height: 100vh;
    background: #2c3e50;
    color: white;
    display: flex;
    flex-direction: column;
    padding: 15px;
    overflow-y: auto;
}

.sidebar a {
    color: white;
    text-decoration: none;
    padding: 12px;
    display: block;
    border-radius: 5px;
    font-size: 16px;
}

.sidebar a:hover {
    background: #1a252f;
}
</style>
