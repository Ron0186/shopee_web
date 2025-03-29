import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useChatStore } from '@/stores/chatStore'; // 正確導入 Store
import { useHelpStore } from "./stores/HelpStore";
// ✅ 確保正確引入 Bootstrap 核心樣式 & JS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import "bootstrap-icons/font/bootstrap-icons.css";
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(router);
app.use(pinia);



const chatStore = useChatStore();
if (chatStore.currentUser) {
    chatStore.connectWebSocket(chatStore.currentUser.id);
}

app.mount("#app");
