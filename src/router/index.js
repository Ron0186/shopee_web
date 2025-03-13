import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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

        // ...其他前台路由
      ],
    },

    //使用者登入頁
    {
      path: "/user/login",
      name: "UserLogin",
      component: () => import("@/views/auth/UserLogin.vue"),
    },

    //使用者註冊頁
    {
      path: "/user/register",
      name: "UserRegister",
      component: () => import("@/views/auth/UserRegister.vue"),
    },

    /**
     * 後台登入頁
     */
    {
      path: "/admin/login",
      name: "AdminLogin",
      component: () => import("@/views/auth/AdminLogin.vue"),
    },

    /**
     * 後台
     */
    {
      path: "/admin",
      component: () => import("@/layouts/AdminLayout.vue"),
      children: [
        {
          // 首頁儀表板
          path: "/dashboard",
          name: "Dashboard",
          component: () => import("@/views/admin/Dashboard.vue"),
        },
        {
          // 活動頁面
          path: "/activities",
          name: "Activities",
          component: () => import("@/views/admin/Activities.vue"),
        },
        {
          // 幫助中心頁面
          path: "/help-center",
          name: "HelpCenter",
          component: () => import("@/views/admin/HelpCenter.vue"),
        },
        {
          // 物流管理頁面
          path: "/logistics",
          name: "Logistics",
          component: () => import("@/views/admin/Logistics.vue"),
        },
        {
          // 付款方式頁面
          path: "/payment-methods",
          name: "PaymentMethods",
          component: () => import("@/views/admin/PaymentMethods.vue"),
        },
        {
          // 後台管理頁面
          path: "/admin-management",
          name: "AdminManagement",
          component: () => import("@/views/admin/AdminManagement.vue"),
        },
        {
          // 數據分析頁面
          path: "/data-analysis",
          name: "DataAnalysis",
          component: () => import("@/views/admin/DataAnalysis.vue"),
        },
        {
          // 內容檢核頁面
          path: "/content-review",
          name: "ContentReview",
          component: () => import("@/views/admin/ContentReview.vue"),
        },
        {
          // 帳號頁面
          path: "/account",
          name: "Account",
          component: () => import("@/views/admin/Account.vue"),
        },
        {
          // 商品頁面
          path: "/products",
          name: "Products",
          component: () => import("@/views/admin/Products.vue"),
        },
        {
          // 商品分類頁面
          path: "/product-category",
          name: "ProductCategory",
          component: () => import("@/views/admin/ProductCategory.vue"),
        },
        {
          // 商品標籤頁面
          path: "/product-tag",
          name: "ProductTag",
          component: () => import("@/views/admin/ProductTag.vue"),
        },
        {
          // 商品屬性頁面
          path: "/product-attribute",
          name: "ProductAttribute",
          component: () => import("@/views/admin/ProductAttribute.vue"),
        },
        {
          // 訂單頁面
          path: "/orders",
          name: "Orders",
          component: () => import("@/views/admin/Orders.vue"),
        },
        {
          // 評價頁面
          path: "/reviews",
          name: "Reviews",
          component: () => import("@/views/admin/Reviews.vue"),
        },
        {
          // 優惠券頁面
          path: "/coupons",
          name: "Coupons",
          component: () => import("@/views/admin/Coupons.vue"),
        },
      ],
    },
  ],
});

export default router;
