<template>
    <div class="accordion" id="faqAccordion">
        <div v-for="category in store.faqCategories" :key="category.id" class="accordion-item">
            <h2 class="accordion-header " :id="'heading' + category.id">
                <button
                    class="accordion-button btn-toggle justify-content-start align-items-center rounded border-0 fw-bold"
                    :class="{ collapsed: !isCategoryOpen(category.id) }" type="button" data-bs-toggle="collapse"
                    :data-bs-target="'#collapse' + category.id" :aria-expanded="isCategoryOpen(category.id)"
                    :aria-controls="'collapse' + category.id">
                    {{ category.title }}
                </button>
            </h2>

            <div :id="'collapse' + category.id" class="accordion-collapse collapse "
                :class="{ show: isCategoryOpen(category.id) }" :aria-labelledby="'heading' + category.id"
                data-bs-parent="#faqAccordion">
                <ul class="btn-toggle-nav">
                    <li v-for="item in category.items" :key="item.id">
                        <router-link :to="'/article/' + item.id" class="text-decoration-none "
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
import { ref, watch, onMounted } from "vue";
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
            isCategoryOpen
        };
    }
};
</script>

<style scoped>
.accordion {
    --bs-accordion-border-color: var(--bs-accordion-border-color);
}


.accordion-button {
    height: 10px;
    margin-top: 10px;
    border-color: white;
    background-color: rgb(255, 255, 255);
    margin-left: 1%;
    width: 350px;
    font-size: large;
}

.accordion-button.collapsed {
    background-color: white;
    font-size: large;
}

.accordion-button:focus {
    box-shadow: none;
    border-radius: 0;
}


.btn-toggle-nav li {
    margin-top: 15px;
    line-height: 2;
    list-style-type: none;
    margin-left: -2.1%;
}


a {
    color: black;
}
</style>
