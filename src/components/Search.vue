<template>
    <div class="container-search">
        <div class="container-fluid">
            <h1 class="title">
                歡迎來到商城幫助中心
            </h1>
            <div class="d-flex">
                <div class="search-input-wrapper">
                    <input type="text" class="form-control" placeholder="遇到問題了? 輸入關鍵字搜尋看看!!!" v-model="query"
                        :style="searched ? 'background-color: white;' : ''" @input="updateSuggestions"
                        @focus="showSuggestions = true" @keydown.down.prevent="moveDown" @keydown.up.prevent="moveUp"
                        @keydown.enter.prevent="selectSuggestion" />
                </div> <button type="submit" class="btn btn-search" @click="search(null, true)">
                    <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px"
                        fill="#FFFFFF">
                        <path
                            d="M400-320q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170q0 100 70 170t170 70Zm-40-120v-280h80v280h-80Zm-140 0v-200h80v200h-80Zm280 0v-160h80v160h-80ZM824-80 597-307q-41 32-91 49.5T400-240q-134 0-227-93T80-560q0-134 93-227t227-93q134 0 227 93t93 227q0 56-17.5 106T653-363l227 227-56 56Z" />
                    </svg>
                </button>

                <div v-if="showSuggestions && suggestions.length" class="dropdown-overlay">
                    <ul class="list-group">
                        <li v-for="(item, index) in suggestions" :key="item.id" class="list-group-item"
                            :class="{ 'active': index === activeIndex }" @click="search(item.question)"
                            @mouseover="activeIndex = index">
                            <HighlightText :text="item.question" :query="query" />
                        </li>
                    </ul>
                </div>
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
const activeIndex = ref(-1);
const searched = ref(false);

const suggestions = computed(() => {
    if (!query.value.trim()) return [];
    return store.faqCategories
        .flatMap(category => category.items)
        .filter(item => item.question.toLowerCase().includes(query.value.toLowerCase()));
});

const hasResults = (searchText) => {
    return store.faqCategories.flatMap(category => category.items)
        .some(item => item.question.toLowerCase().includes(searchText.toLowerCase()));
};

const updateSuggestions = () => {
    showSuggestions.value = !!query.value;
    activeIndex.value = -1;
};

const search = (searchQuery = null, fromButton = false) => {
    if (searchQuery && searchQuery instanceof Event) {
        searchQuery = null;
    }
    let searchText = "";
    if (fromButton) {
        searchText = query.value.trim();
    } else {
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
    query.value = "";
};

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

const selectSuggestion = () => {
    search();
};
</script>

<style scoped>
.container-search {
    background-color: orangered;
    padding-bottom: 1px;
}

.container-fluid {
    background-color: orangered;
    max-width: 900px;
    padding: 80px 15px 31px;
    margin: 0 auto;
}

.title {
    color: aliceblue;
    text-align: center;
    margin-bottom: 30px;
    font-size: 45px;
    font-weight: bold;
}

.d-flex {
    box-sizing: border-box;
    display: flex;
    align-items: stretch;
    margin-top: 50px;
    background: #fff;
    border-radius: 4px;
    padding: 2px;
    flex-wrap: nowrap;
    position: relative;
    /* 新增: 重新將 d-flex 設為定位上下文 */
}

/* Input Wrapper 樣式 */
.search-input-wrapper {
    /* position: relative; <-- 移除: 不再是 dropdown 的定位上下文 */
    flex-grow: 1;
    display: flex;
    margin-right: 5px;
    min-width: 0;
}

.form-control {
    /* ... form-control 樣式保持不變 ... */
    min-height: 61px;
    border-style: hidden;
    font-size: 20px;
    box-shadow: none;
    width: 100%;
    border-radius: 4px 0 0 4px;
    padding-left: 15px;
    box-sizing: border-box;
}

.form-control:focus {
    outline: none;
}

/* 按鈕樣式 */
.btn-search {
    /* ... 按鈕樣式保持不變 ... */
    background-color: #ff5722;
    color: white;
    border: none;
    padding: 0 20px;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    transition: background-color 0.3s ease;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.btn-search:hover {
    background-color: #e64a19;
}

/* 下拉式選單樣式 */
/* 這些樣式基本不變，但現在是相對於 d-flex 定位和計算寬度 */
.dropdown-overlay {
    position: absolute;
    top: 100%;
    /* 在 d-flex 下方 */
    left: 0;
    /* 與 d-flex 左對齊 */
    z-index: 999;
    width: 100%;
    /* 寬度等於 d-flex */
    background-color: #fff;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 0;
    margin-top: 5px;
    /* 保持間隔 */
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-top: none;
}

.list-group {
    /* ... list-group 樣式保持不變 ... */
    border: none;
    max-height: 250px;
    overflow-y: auto;
    width: 100%;
    padding: 5px 0;
}

.list-group-item {
    /* ... list-group-item 樣式保持不變 ... */
    border: none;
    background-color: white;
    cursor: pointer;
    padding: 8px 15px;
    font-size: 16px;
}

.list-group-item:hover,
.list-group-item.active {
    background-color: #f0f0f0;
    color: black;
}

.list-group-item:focus {
    outline: none;
    box-shadow: none;
}

/* 響應式樣式 */
@media (max-width: 480px) {
    .title {
        font-size: 36px;
    }

    .form-control {
        font-size: 18px;
    }

    .btn-search {
        padding: 0 15px;
    }
}
</style>
