<template>
    <div class="search-container">
        <!-- 搜尋元件 -->
        <Search />

        <div class="container mt-4 content-box">
            <div class="col-md-9">
                <!-- 有搜尋結果時 -->
                <div v-if="filteredFAQs.length">
                    <h2 class="search-title">
                        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px"
                            fill="#F19E39">
                            <path
                                d="M435.21-579.74q27.17 0 46.11-19.02 18.94-19.01 18.94-46.19 0-27.18-19.02-46.11Q462.23-710 435.05-710q-27.18 0-46.11 19.02Q370-671.97 370-644.79q0 27.17 19.02 46.11 19.01 18.94 46.19 18.94Zm.64 160q36.18 0 69.81-14.19 33.64-14.18 59.52-40.56-31.85-18.05-64.49-26.78-32.64-8.73-65.18-8.73-36 0-69.6 8.92-33.6 8.93-60.19 26.59 26.37 26.22 59.97 40.48 33.59 14.27 70.16 14.27Zm406.46 297.82L631.92-332.31q-41.87 33.92-91.1 53.25-49.23 19.32-105.77 19.32-127.38 0-216.22-88.84Q130-437.41 130-564.87t88.83-216.3Q307.67-870 435.13-870q127.46 0 216.29 88.83 88.84 88.84 88.84 216.22 0 56.54-19.32 105.96-19.33 49.43-53.25 91.3l210 210-35.38 35.77ZM435.46-310q105.67 0 180.1-74.77Q690-459.54 690-565.21q0-105.66-74.38-180.1-74.38-74.43-180.49-74.43-105.34 0-180.1 74.38-74.77 74.38-74.77 180.49 0 105.33 74.77 180.1Q329.79-310 435.46-310Zm-.33-254.87Z" />
                        </svg>
                        搜尋結果：
                    </h2>

                    <!-- FAQ 列表 -->
                    <ul class="list-group">
                        <li v-for="category in paginatedFAQs" :key="category.id" class="list-group-item">
                            <strong style="font-size: large;">{{ category.title }}</strong>
                            <ul>
                                <li v-for="item in category.items" :key="item.id">
                                    <router-link :to="'/article/' + item.id" class="text-decoration-none">
                                        <HighlightText :text="item.question" :query="store.searchQuery" />
                                    </router-link>
                                </li>
                            </ul>
                        </li>
                    </ul>

                    <!-- 分頁按鈕 -->
                    <div class="pagination">
                        <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-secondary">«</button>
                        <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
                            :class="['btn', 'btn-page', { 'active': currentPage === page }]">
                            {{ page }}
                        </button>
                        <button @click="nextPage" :disabled="currentPage === totalPages"
                            class="btn btn-secondary">»</button>
                    </div>
                </div>

                <!-- 無搜尋結果時 -->
                <div v-else class="no-results">
                    <svg xmlns="http://www.w3.org/2000/svg" width="250px" height="250px" viewBox="0 -960 960 960"
                        fill="#999999">
                        <path
                            d="M185.39-814.61v287.3-4 385.92-669.22 169.84-169.84Zm104 389.99h154.58q9.26-12.76 20.11-24.11 10.84-11.35 23.23-21.27H289.39v45.38Zm0 167.31h111.07q-1.61-11.15-1.5-22.69.12-11.54 1.35-22.69H289.39v45.38ZM197.69-100q-23.53 0-40.61-17.08T140-157.69v-644.62q0-23.53 17.08-40.61T197.69-860h347.54L740-665.23v152.69q-10.54-5.08-21.89-8.61-11.34-3.54-23.5-6.16v-117.46H522.54v-169.84H197.69q-4.61 0-8.46 3.84-3.84 3.85-3.84 8.46v644.62q0 4.61 3.84 8.46 3.85 3.84 8.46 3.84H440q8.31 12.77 18.42 24.12 10.12 11.35 21.27 21.27h-282Z" />
                    </svg>
                    <h3 class="text-danger fw-bold mt-3">找不到相關結果 (404)</h3>
                    <p class="text-muted">
                        請嘗試其他關鍵字，或返回
                        <a href="/" class="text-primary text-decoration-none">幫助中心</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useHelpStore } from "../stores/HelpStore";
import Search from "./Search.vue";
import HighlightText from "./HighlightText.vue";

const store = useHelpStore();
const filteredFAQs = computed(() => store.filteredFAQs);
const currentPage = ref(1);
const itemsPerPage = 5;

const totalPages = computed(() => Math.ceil(filteredFAQs.value.length / itemsPerPage));
const paginatedFAQs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredFAQs.value.slice(start, start + itemsPerPage);
});

const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const goToPage = (page) => { currentPage.value = page; };
</script>

<style scoped>
.search-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.content-box {
    width: 80%;
    max-width: 800px;
}

.search-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 24px;
    color: #f13939;
    font-weight: 700;
}

.list-group-item {
    background: #fff;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 5px;

}

.list-group-item ul {
    padding-left: 0;
    padding-top: 10px;
    line-height: 2.2;
}

.list-group {
    --bs-list-group-border-color: var(--bs-list-group-border-color)
}

.list-group li {
    list-style-type: none;

}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 9px;
    margin-top: 20px;
    margin-left: 40%;
}

.btn-page {
    padding: 8px 12px;
    background: #f8f9fa;
}

.btn-page.active {
    background: #0376ea;
    color: white;
}

a {
    color: black;
}
</style>
