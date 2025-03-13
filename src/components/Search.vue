<template>
    <div class="container-search">
        <div class="container-fluid">
            <h1 style="color: aliceblue;text-align: center;margin-bottom: 0;font-size: 45px;">
                <svg xmlns="http://www.w3.org/2000/svg" height="60px" viewBox="0 -960 960 960" width="60px"
                    fill="#ecfb13" style="margin-bottom: 8px;">
                    <path
                        d="M720-40v-120H600v-80h120v-120h80v120h120v80H800v120h-80ZM80-160v-240H40v-80l40-200h600l40 200v80h-40v120h-80v-120H440v240H80Zm80-80h200v-160H160v160Zm-38-240h516-516ZM80-720v-80h600v80H80Zm42 240h516l-24-120H146l-24 120Z" />
                </svg>
                歡迎來到商城幫助中心
            </h1>
            <!-- 搜尋框 -->
            <div class="d-flex">


                <input type="text" class="form-control me-3" placeholder="遇到問題了? 輸入關鍵字搜尋看看!!!" v-model="query"
                    :style="searched ? 'background-color: white;' : ''" @input="updateSuggestions"
                    @focus="showSuggestions = true" @keydown.down.prevent="moveDown" @keydown.up.prevent="moveUp"
                    @keydown.enter.prevent="selectSuggestion" />
                <!-- 使用 fromButton 標示這是按鈕觸發 -->
                <button type="submit" class="btn btn-primary" @click="search(null, true)">
                    <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px"
                        fill="#FFFFFF">
                        <path
                            d="M400-320q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170q0 100 70 170t170 70Zm-40-120v-280h80v280h-80Zm-140 0v-200h80v200h-80Zm280 0v-160h80v160h-80ZM824-80 597-307q-41 32-91 49.5T400-240q-134 0-227-93T80-560q0-134 93-227t227-93q134 0 227 93t93 227q0 56-17.5 106T653-363l227 227-56 56Z" />
                    </svg>
                </button>
            </div>

            <!-- 下拉式選單 -->
            <div v-if="showSuggestions && suggestions.length" class="dropdown-overlay">
                <ul class="list-group w-50 shadow bg-white mt-1 mx-auto" style="max-height: 300px; overflow-y: auto;">
                    <li v-for="(item, index) in suggestions" :key="item.id" class="list-group-item"
                        :class="{ 'active': index === activeIndex }" @click="search(item.question)"
                        @mouseover="activeIndex = index">
                        <HighlightText :text="item.question" :query="query" />
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useHelpStore } from "../stores/HelpStore";
import HighlightText from "./HighlightText.vue";

const store = useHelpStore();
const router = useRouter();
const route = useRoute();

const query = ref("");
const showSuggestions = ref(false);
// 預設設定 activeIndex 為 -1 表示無選取
const activeIndex = ref(-1);
const searched = ref(false);

// 計算符合的建議結果（只要包含輸入文字即為匹配）
const suggestions = computed(() => {
    if (!query.value.trim()) return [];
    return store.faqCategories
        .flatMap(category => category.items)
        .filter(item => item.question.toLowerCase().includes(query.value.toLowerCase()));
});

// 檢查是否有任何匹配結果
const hasResults = (searchText) => {
    return store.faqCategories.flatMap(category => category.items)
        .some(item => item.question.toLowerCase().includes(searchText.toLowerCase()));
};

// 更新建議清單狀態
const updateSuggestions = () => {
    showSuggestions.value = !!query.value;
    activeIndex.value = -1; // 重置為 -1
};

// 搜尋功能：新增 fromButton 參數來區分來源
const search = (searchQuery = null, fromButton = false) => {
    // 若 searchQuery 是事件物件則忽略它
    if (searchQuery && searchQuery instanceof Event) {
        searchQuery = null;
    }
    let searchText = "";
    if (fromButton) {
        // 按下搜尋按鈕時，直接使用輸入框內的文字
        searchText = query.value.trim();
    } else {
        // 若有明確傳入參數（例如從建議項點選或按 Enter 時）
        searchText = searchQuery !== null ? searchQuery : query.value.trim();
    }

    if (!searchText || !hasResults(searchText)) {
        router.push({ path: "/search", query: { q: "404" } });
    } else {
        store.setSearchQuery(searchText);
        router.push({ path: "/search", query: { q: searchText } });
    }

    showSuggestions.value = false;
    searched.value = true;
    query.value = ""; // 搜尋後清空輸入框
};

// 鍵盤上下選擇功能
const moveDown = () => {
    if (suggestions.value.length === 0) return;
    if (activeIndex.value < suggestions.value.length - 1) {
        activeIndex.value = activeIndex.value === -1 ? 0 : activeIndex.value + 1;
    }
};

const moveUp = () => {
    if (suggestions.value.length === 0) return;
    if (activeIndex.value > 0) {
        activeIndex.value--;
    } else {
        activeIndex.value = -1;
    }
};

// 修改處：按下 Enter 時始終使用輸入框內容進行搜尋，不採用鍵盤選取的建議
const selectSuggestion = () => {
    search(); // 不管 activeIndex 狀態如何，都直接用輸入框內容搜尋
};
</script>

<style scoped>
.container-search {
    background-color: orangered;
    height: 300px;
}

.container-fluid {
    background-color: orangered;
    max-width: 900px;
    padding: 80px 0 31px;
    margin: 0 auto;

}

.d-flex {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 65px;
    padding: 2px;
    margin-top: 50px;
    background: #fff;
    border-radius: 4px;
}

.form-control {
    height: 65px;
    border-style: hidden;
    font-size: 20px;
    box-shadow: none;
}

/* 移除下拉式選單的外框線 */
.list-group {
    border: none !important;
}

/* 移除 list-group-item 的邊框，預設為白色 */
.list-group-item {
    border: none !important;
    background-color: white !important;
    cursor: pointer;
}

/* 滑鼠移到項目時背景色改為灰色 */
.list-group-item:hover {
    background-color: #f0f0f0 !important;
}

/* 下拉式選單定位 */
.dropdown-overlay {
    position: absolute;
    top: 280px;
    left: 0px;
    width: 103%;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

/* active 狀態背景為白色 */
.list-group-item.active {
    color: black;
    border-color: white;
    background-color: white;
}

/* 移除焦點虛線 */
.list-group-item:focus {
    outline: none;
    box-shadow: none;
}
</style>
