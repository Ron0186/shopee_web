<template>
    <div class="search-container">
        <div class="container-search">
            <Search />
        </div>
        <div class="container mt-5 content-box">
            <div v-if="!isNotFound">
                <h2 class="search-title">
                    <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px"
                        fill="#000000">
                        <path
                            d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                    </svg>搜尋結果：
                </h2>
                <ul class="list-group">
                    <li v-for="item in paginatedFAQs" :key="item.id" class="list-group-item">
                        <router-link :to="'/article/' + item.id" class="text-decoration-none">
                            <HighlightText :text="item.question" :query="store.searchQuery" />
                        </router-link>
                    </li>
                </ul>
            </div>
            <div v-else class="no-results">
                <div style="text-align: center;"><svg xmlns="http://www.w3.org/2000/svg" height="150px"
                        viewBox="0 -960 960 960" width="200px" fill="#BB271A">
                        <path
                            d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q88 0 166.5 36T782-742L480-440v-360q-134 0-227 93t-93 227q0 134 93 227t227 93q69 0 132-28.5T720-270v110q-53 38-114 59T480-80Zm320-160v-320h80v320h-80Zm40 160q-17 0-28.5-11.5T800-120q0-17 11.5-28.5T840-160q17 0 28.5 11.5T880-120q0 17-11.5 28.5T840-80Z" />
                    </svg></div>

                <h2 class="text-danger fw-bold mt-3" style="text-align: center;">找不到相關結果 (404)</h2>
                <p class="text-muted fw-bold" style="text-align: center;">
                    請嘗試其他關鍵字，或返回
                    <router-link to="/" class="text-primary">幫助中心</router-link>
                </p>
            </div>
        </div>
        <!-- 分頁控制區固定在視窗底部 -->
        <div class="pagination-container" v-if="totalPages > 0">
            <div class="pagination">
                <button class="btn-page" @click="goToPage(1)" :disabled="currentPage === 1">&lt;&lt;</button>
                <button v-for="page in totalPages" :key="page" class="btn-page"
                    :class="{ active: currentPage === page }" @click="goToPage(page)">
                    {{ page }}
                </button>
                <button class="btn-page" @click="goToPage(totalPages)"
                    :disabled="currentPage === totalPages">&gt;&gt;</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useHelpStore } from "../stores/HelpStore";
import Search from "./Search.vue";
import HighlightText from "./HighlightText.vue";

const store = useHelpStore();
const route = useRoute();

// 過濾 FAQ：只要包含搜尋字串的項目都會被顯示
const filteredFAQs = computed(() => {
    if (!store.searchQuery || store.searchQuery === "404") return [];
    return store.faqCategories.flatMap(category =>
        category.items.filter(item =>
            item.question.toLowerCase().includes(store.searchQuery.toLowerCase())
        )
    );
});

// 分頁參數設定
const currentPage = ref(1);
const itemsPerPage = 10;
const totalPages = computed(() => Math.ceil(filteredFAQs.value.length / itemsPerPage));
const paginatedFAQs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredFAQs.value.slice(start, start + itemsPerPage);
});

// 監聽 URL 查詢參數變化，更新搜尋字串並重設分頁
watch(() => route.query.q, (newQuery) => {
    store.setSearchQuery(newQuery || "");
    currentPage.value = 1;
});

onMounted(() => {
    store.setSearchQuery(route.query.q || "");
});

// 若搜尋結果為空且搜尋關鍵字不為空，則顯示 404
const isNotFound = computed(() => {
    return !filteredFAQs.value.length && store.searchQuery !== "";
});

// 分頁切換函式
const goToPage = (page) => {
    currentPage.value = page;
};
</script>

<style scoped>
.search-container {
    flex-direction: column;
    align-items: center;
}

.content-box {
    width: 80%;
    max-width: 51%;
}

/* 內容區與搜尋標題保持原有樣式 */
.search-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 33px;
    color: #0e0d0d;
    font-weight: 700;
}

.list-group-item {
    background: #fff;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 5px;
    font-size: 25px;
}


ul {
    line-height: 1;

}

.list-group {
    --bs-list-group-border-color: var(--bs-list-group-border-color);
    margin-top: 15px;
    margin-bottom: 6%;
}

.list-group li {
    list-style-type: none;
}

/* 固定分頁容器 */
.pagination-container {
    position: static;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px;
    text-align: center;
    z-index: 100;
}

/* 分頁按鈕樣式 */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 9px;
}

.btn-page {
    padding: 8px 12px;
    background: #f8f9fa;
    border: none;
    cursor: pointer;
}

.btn-page.active {
    background: #0376ea;
    color: white;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: default;
}

a {
    color: black;
}
</style>
