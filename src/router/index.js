import SearchResult from "@/components/SearchResult.vue";
import HelpCenter from "@/views/pages/HelpCenter.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    /**
     * 前台
     */
    {
      path: "/",
      component: () => import("@/layouts/FrontLayout.vue"),
      children: [
        {
          path: "/",
          name: "FrontHome",
          component: () => import("@/views/front/Home.vue"),
        },
        {
          path: "/about",
          name: "FrontAbout",
          component: () => import("@/views/front/About.vue"),
        },
        // {
        //   path: "/Cart",
        //   name: "Cart",
        //   component: () => import("@/views/Cart.vue"),
        // },
        {
          path: "shop",
          name: "Shop",
          component: () => import("@/views/Shop.vue"),
        },
        // {
        //   path: "checkout",
        //   name: "Checkout",
…