<template>
    <div v-if="selectedArticle">
        <h3 class="fw-bold">{{ selectedArticle.question }}</h3>
        <p>{{ selectedArticle.answer }}</p>
    </div>
    <div v-else>
        <p>請選擇一個問題來查看詳細內容。</p>
    </div>
</template>

<script>
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useHelpStore } from "../stores/HelpStore";

export default {
    setup() {
        const store = useHelpStore();
        const route = useRoute();

        const selectedArticle = computed(() =>
            store.faqCategories.flatMap(category => category.items).find(item => item.id === route.params.id)
        );

        watch(() => route.params.id, newId => {
            store.setSelectedArticle(newId);
        }, { immediate: true });

        return { selectedArticle };
    }
};
</script>
<style>
h3 {
    margin-bottom: 10px;
    font-size: 30px;
}

p {
    line-height: 2.5;
    font-size: 20px;
}
</style>