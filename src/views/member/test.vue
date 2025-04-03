<template>
    <div class="test-container">
        <h1>🏡 地址選擇測試</h1>

        <!-- AddressSelector 使用 v-model 雙向綁定 addressInfo -->
        <AddressSelector v-model="addressInfo" />

        <div class="result">
            <h2>📬 填寫結果</h2>
            <p><strong>完整地址：</strong>{{ addressInfo.fullAddress }}</p>
            <p><strong>郵遞區號：</strong>{{ addressInfo.zipCode }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import AddressSelector from '@/components/address/AddressSelector.vue'

// 測試用的地址物件
const addressInfo = ref({
    fullAddress: '',
    zipCode: ''
})
</script>

<style scoped>
.test-container {
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
    text-align: center;
    color: #4caf50;
    margin-bottom: 20px;
}

.result {
    margin-top: 20px;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
}
</style>
