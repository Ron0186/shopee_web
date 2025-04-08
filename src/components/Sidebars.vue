<template>
  <div class="accordion-container">
    <div class="accordion" id="faqAccordion">
      <div
        v-for="category in store.faqCategories"
        :key="category.id"
        class="accordion-item"
      >
        <h2 class="accordion-header" :id="'heading' + category.id">
          <button
            class="accordion-button btn-toggle justify-content-start align-items-center rounded border-0 fw-bold"
            :class="{ collapsed: !isCategoryOpen(category.id) }"
            type="button"
            @click="toggleCategory(category.id)"
          >
            <span class="category-icon">{{
              getCategoryIcon(category.title)
            }}</span>
            <span>{{ category.title }}</span>
          </button>
        </h2>

        <div
          :id="'collapse' + category.id"
          class="accordion-collapse collapse"
          :class="{ show: isCategoryOpen(category.id) }"
          :aria-labelledby="'heading' + category.id"
        >
          <div class="accordion-body">
            <ul class="btn-toggle-nav">
              <li
                v-for="item in category.items"
                :key="item.id"
                class="faq-item"
              >
                <router-link
                  :to="'/article/' + item.id"
                  class="faq-link"
                  :class="{ active: item.id === store.selectedArticleId }"
                >
                  <span class="question-icon">❓</span>
                  <span>{{ item.question }}</span>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useHelpStore } from "../stores/HelpStore";
import { ref, watch, computed } from "vue";
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
        openCategories.value = openCategories.value.filter(
          (id) => id !== categoryId
        );
      } else {
        // 若尚未開啟，則展開
        openCategories.value.push(categoryId);
      }
    };

    // 根據分類標題返回對應的圖標
    const getCategoryIcon = (title) => {
      const iconMap = {
        帳戶設定: "👤",
        訂單問題: "📦",
        支付問題: "💳",
        配送問題: "🚚",
        退款政策: "💰",
        技術支援: "🔧",
        隱私安全: "🔒",
      };

      return iconMap[title] || "📋"; // 默認圖標
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
        const foundCategory = store.faqCategories.find((cat) =>
          cat.items.some((item) => item.id === articleId)
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
      toggleCategory,
      getCategoryIcon,
    };
  },
};
</script>

<style scoped>
.accordion-container {
  overflow: hidden;
}

/* 優化手風琴容器樣式 */
.accordion {
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: white;
  overflow: hidden;
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
    margin-right: 1.5rem;
    transition: all 0.3s ease;
  }
}

/* 優化手風琴項目樣式 */
.accordion-item {
  border: none;
  border-bottom: 1px solid #f0f0f0;
}

.accordion-item:last-child {
  border-bottom: none;
}

/* 優化手風琴按鈕樣式 */
.accordion-button {
  padding: 1rem 1.25rem;
  margin: 0;
  background-color: white;
  font-size: 1.1rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  transition: all 0.2s ease;
}

.accordion-button:hover {
  background-color: #f9f9f9;
}

.accordion-button:focus {
  box-shadow: none;
  border-radius: 0;
  background-color: #f9f9f9;
}

.accordion-button.collapsed {
  background-color: white;
}

/* 分類圖標 */
.category-icon {
  font-size: 1.25rem;
  opacity: 0.9;
}

/* 箭頭圖標 */
.accordion-arrow {
  margin-left: auto;
  font-size: 0.75rem;
  transition: transform 0.3s ease;
  color: #777;
}

.accordion-arrow.rotate {
  transform: rotate(180deg);
}

/* 手風琴內容區 */
.accordion-body {
  padding: 0.5rem 0;
  background-color: #f9f9f9;
}

/* 問題列表樣式 */
.btn-toggle-nav {
  padding: 0;
  margin: 0;
}

.faq-item {
  margin: 0;
  list-style-type: none;
}

.faq-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem 0.75rem 3rem;
  color: #444;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.faq-link:hover {
  background-color: #eee;
  color: #000;
}

.faq-link.active {
  background-color: #fff0e0;
  color: #ff9b20;
  font-weight: 600;
  border-left: 3px solid #ff9b20;
}

.question-icon {
  opacity: 0.7;
}

/* 過渡動畫 */
.accordion-collapse {
  transition: all 0.3s ease-out;
}

.accordion-collapse.show {
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0.8;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
