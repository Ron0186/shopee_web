<template>
    <div class="container-fluid">
        <!-- 搜尋框 -->
        <div class="d-flex">
            <input type="text" class="form-control me-3" placeholder="搜尋問題..." v-model="query"
                :style="searched ? 'background-color: white;' : ''" @input="updateSuggestions"
                @focus="showSuggestions = true" @keydown.down.prevent="moveDown" @keydown.up.prevent="moveUp"
                @keydown.enter.prevent="selectSuggestion" />
            <button type="submit" class="btn btn-primary" @click="search">
                搜尋
            </button>
        </div>

        <!-- 下拉式選單 -->
        <div v-if="showSuggestions && suggestions.length" class="dropdown-overlay">
            <ul class="list-group w-50 shadow bg-white mt-1 mx-auto" style="max-height: 300px; overflow-y: auto;">
                <li v-for="(item, index) in suggestions" :key="item.id" class="list-group-item"
                    :class="{ 'active': index === activeIndex }" @click="goToSearchResult(item)"
                    @mouseover="activeIndex = index">
                    <HighlightText :text="item.question" :query="query" />
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useHelpStore } from "../stores/HelpStore";
import HighlightText from "./HighlightText.vue";

export default {
    name: "Search",
    components: { HighlightText },
    setup() {
        const store = useHelpStore();
        const router = useRouter();
        const query = ref(store.searchQuery);
        const showSuggestions = ref(false);
        const activeIndex = ref(0);
        const searched = ref(false);

        // 計算符合的建議結果
        const suggestions = computed(() => {
            if (!query.value) return [];
            return store.faqCategories
                .flatMap(category => category.items)
                .filter(item => item.question.includes(query.value));
        });

        // 更新建議清單狀態
        const updateSuggestions = () => {
            showSuggestions.value = !!query.value;
            activeIndex.value = 0;
        };

        // 搜尋功能：以目前 query 搜尋所有結果，
        // 並將輸入框內的文字清空，同時變更搜尋框背景為白色
        const search = () => {
            store.setSearchQuery(query.value);
            showSuggestions.value = false;
            router.push({ path: "/search", query: { q: query.value } });
            router.push({ path: "/search", query: { q: query.value } });
            searched.value = true;
            query.value = "";
        };

        // 點擊下拉式建議時同樣執行搜尋
        const goToSearchResult = (item) => {
            store.setSearchQuery(item.question);
            showSuggestions.value = false;
            router.push({ path: "/search", query: { q: item.question } });
            searched.value = true;
            query.value = "";
        };

        // 鍵盤上下選擇功能
        const moveDown = () => {
            if (activeIndex.value < suggestions.value.length - 1) {
                activeIndex.value++;
            }
        };

        const moveUp = () => {
            if (activeIndex.value > 0) {
                activeIndex.value--;
            }
        };

        // 按下 Enter 時直接呼叫 search()，不再依照下拉選單目前選取項目
        const selectSuggestion = () => {
            search();
        };

        // 當輸入框變空時，隱藏下拉式選單
        watch(query, newQuery => {
            if (!newQuery) showSuggestions.value = false;
        });

        return {
            query,
            search,
            suggestions,
            updateSuggestions,
            showSuggestions,
            goToSearchResult,
            moveDown,
            moveUp,
            selectSuggestion,
            activeIndex,
            searched
        };
    }
};
</script>

<style scoped>
.container-fluid {
    background-color: orangered;
    width: 105%;
    margin-left: -1%;
    height: 250px;
}

.d-flex {
    width: 50%;
    height: 90%;
    margin-left: 25%;
    padding-top: 165px;
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
