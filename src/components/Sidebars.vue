<template>
    <!-- 讓手風琴容器可以在右側顯示 (之後用 RWD CSS) -->
    <div class="accordion" id="faqAccordion">
        <div v-for="category in store.faqCategories" :key="category.id" class="accordion-item">
            <h2 class="accordion-header" :id="'heading' + category.id">
                <!-- 移除 Bootstrap 的 data-bs-toggle, data-bs-target, aria-xxx 等屬性 -->
                <button
                    class="accordion-button btn-toggle justify-content-start align-items-center rounded border-0 fw-bold"
                    :class="{ collapsed: !isCategoryOpen(category.id) }" type="button"
                    @click="toggleCategory(category.id)">
                    {{ category.title }}
                </button>
            </h2>

            <!-- 同樣移除 data-bs-parent, 只保留視覺用的 class -->
            <div :id="'collapse' + category.id" class="accordion-collapse collapse"
                :class="{ show: isCategoryOpen(category.id) }" :aria-labelledby="'heading' + category.id">
                <ul class="btn-toggle-nav">
                    <li v-for="item in category.items" :key="item.id">
                        <router-link :to="'/article/' + item.id" class="text-decoration-none"
                            :class="{ 'text-danger fw-bold': item.id === store.selectedArticleId }">
                            {{ item.question }}
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>


<script>
import { useHelpStore } from "../stores/HelpStore";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

export default {
    setup() {
        const store = useHelpStore();
        const route = useRoute();

        // 用於記錄當前展開的分類 ID 清單
        const openCategories = ref([]);

        // 檢查某個分類是否開啟
        const isCategoryOpen = (categoryId) => {
            return openCategories.value.includes(categoryId);
        };

        // 切換分類展開／折疊狀態 (Vue 自行控制)
        const toggleCategory = (categoryId) => {
            if (isCategoryOpen(categoryId)) {
                // 若已經開啟，則關閉
                openCategories.value = openCategories.value.filter(id => id !== categoryId);
            } else {
                // 若尚未開啟，則展開
                openCategories.value.push(categoryId);
            }
        };

        // 監聽 route.params.id，並同步到 store.selectedArticleId
        watch(
            () => route.params.id,
            (newId) => {
                if (newId) {
                    store.selectedArticleId = newId;
                }
            },
            { immediate: true }
        );

        // 當 store.selectedArticleId 改變時，自動展開對應分類
        watch(
            () => store.selectedArticleId,
            (articleId) => {
                if (!articleId) return;

                // 尋找該文章所屬的分類
                const foundCategory = store.faqCategories.find(cat =>
                    cat.items.some(item => item.id === articleId)
                );

                if (foundCategory) {
                    // 若尚未展開，就將該分類加入 openCategories
                    if (!openCategories.value.includes(foundCategory.id)) {
                        openCategories.value.push(foundCategory.id);
                    }
                }
            },
            { immediate: true }
        );

        return {
            store,
            openCategories,
            isCategoryOpen,
            toggleCategory
        };
    }
};
</script>

<style scoped>
/* 讓 accordion 有 Bootstrap 的外觀 */
.accordion {
    margin: 0 auto;
    /* 先預設置中 */
}

/* 在小螢幕 (max-width: 767px) 時，accordion 佔滿 100% 寬度 */
@media (max-width: 767px) {
    .accordion {
        width: 100%;
        float: none;
    }
}

/* 在平板以上 (min-width: 768px) 時，accordion 浮動在右側，給定固定寬度 */
@media (min-width: 768px) {
    .accordion {
        margin-top: 32px;
        width: 380px;
        float: right;
        margin-right: 1rem;
        /* 可自行調整右側距離 */
    }
}

.accordion-button {
    margin-top: 10px;
    border-color: white;
    background-color: #fff;
    font-size: large;
}

.accordion-button.collapsed {
    background-color: #fff;
    font-size: 19px;
}

.accordion-button:focus {
    box-shadow: none;
    border-radius: 0;
}

.btn-toggle-nav li {
    margin-top: 15px;
    line-height: 2;
    list-style-type: none;
    margin-left: -3%;
}

a {
    color: rgb(0, 0, 0);
}
</style>
