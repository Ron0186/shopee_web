<template>
    <div class="order-filter">
        <!-- 訂單狀態篩選 -->
        <div class="filter-group">
            <label for="status">訂單狀態：</label>
            <select v-model="selectedStatus">
                <option value="all">全部</option>
                <option value="待付款">待付款</option>
                <option value="待出貨">待出貨</option>
                <option value="已完成">已完成</option>
                <option value="已取消">已取消</option>
            </select>
        </div>

        <!-- 訂單日期篩選 -->
        <div class="filter-group">
            <label for="startDate">起始日期：</label>
            <input type="date" v-model="startDate" />
        </div>

        <div class="filter-group">
            <label for="endDate">結束日期：</label>
            <input type="date" v-model="endDate" />
        </div>

        <!-- 篩選按鈕 -->
        <button class="filter-btn" @click="applyFilter">篩選</button>
    </div>
</template>

<script setup>
import { ref } from "vue";

const selectedStatus = ref("all");
const startDate = ref(null);
const endDate = ref(null);

const emit = defineEmits(["filter"]);

const applyFilter = () => {
    emit("filter", {
        status: selectedStatus.value,
        startDate: startDate.value || null,
        endDate: endDate.value || null,
    });
};
</script>

<style scoped>
/* ✅ 讓篩選區域變大 */
.order-filter {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 15px;
    padding: 15px 20px;
    background: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

/* ✅ 讓篩選區塊對齊並有適當間距 */
.filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* ✅ Label 標籤美化 */
label {
    font-weight: bold;
    font-size: 16px;
    color: #333;
}

/* ✅ Select 下拉選單美化 */
select,
input[type="date"] {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    transition: border 0.3s;
}

select:focus,
input[type="date"]:focus {
    border: 1px solid #007bff;
    outline: none;
}

/* ✅ 篩選按鈕樣式 */
.filter-btn {
    background: #007bff;
    color: white;
    padding: 10px 15px;
    font-size: 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
}

.filter-btn:hover {
    background: #0056b3;
}
</style>