import "./assets/main.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import vue3GoogleLogin from "vue3-google-login";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// Bootstrap Vue Next
import { BModal, BButton } from "bootstrap-vue-next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

// Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faStar as fasStar } from "@fortawesome/free-solid-svg-icons";
import {
  faStar as farStar,
  faStarHalfStroke,
} from "@fortawesome/free-regular-svg-icons";

// 加入 icon 到 library
library.add(fasStar, farStar, faStarHalfStroke);

// 建立 app 實例
const app = createApp(App);

// 註冊全域元件
app.component("font-awesome-icon", FontAwesomeIcon);

// 註冊 plugin
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(vue3GoogleLogin, {
  clientId:
    "595128745585-61ldfgee16s2n72fd44hdanqq5hjnlj4.apps.googleusercontent.com",
});

// 最後掛載
app.mount("#app");
