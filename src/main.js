import "./assets/main.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import vue3GoogleLogin from 'vue3-google-login';
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// 正確導入 Bootstrap Vue Next
import { BModal, BButton } from 'bootstrap-vue-next';

import { useChatStore } from '@/stores/chatStore'; // 正確導入 Store

// ✅ 確保正確引入 Bootstrap 核心樣式 & JS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
// import "bootstrap-icons/font/bootstrap-icons.css";

//font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar, faStarHalfStroke } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

<<<<<<< HEAD
app.use(pinia);
app.use(router);
app.use(vue3GoogleLogin, {
    clientId: '595128745585-61ldfgee16s2n72fd44hdanqq5hjnlj4.apps.googleusercontent.com', // ***替換成你的 Google Client ID***
});
app.mount("#app");
=======



app.use(router);
app.use(pinia);



const chatStore = useChatStore();
if (chatStore.currentUser) {
    chatStore.connectWebSocket(chatStore.currentUser.id);
}

// 註冊個別組件
app.component('BModal', BModal);
app.component('BButton', BButton);

// Google 登入配置
app.use(vue3GoogleLogin, {
    clientId: '595128745585-61ldfgee16s2n72fd44hdanqq5hjnlj4.apps.googleusercontent.com'
});

//font awesome
// ✅ 然後再註冊 FontAwesome
library.add(fasStar, farStar, faStarHalfStroke)
app.component("font-awesome-icon", FontAwesomeIcon)

// 只掛載一次應用程式
app.mount("#app");
>>>>>>> 263836fe10eaad330bbe61b454a707949420e8e5
