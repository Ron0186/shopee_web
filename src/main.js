import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import vue3GoogleLogin from 'vue3-google-login';
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// ✅ 確保正確引入 Bootstrap 核心樣式 & JS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
// import "bootstrap-icons/font/bootstrap-icons.css";

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vue3GoogleLogin, {
    clientId: '595128745585-61ldfgee16s2n72fd44hdanqq5hjnlj4.apps.googleusercontent.com', // ***替換成你的 Google Client ID***
});
app.mount("#app");
