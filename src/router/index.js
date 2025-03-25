import SearchResult from "@/components/SearchResult.vue";
import HelpCenter from "@/views/pages/HelpCenter.vue";
import UpdateHomeAddress from '@/views/member/UpdateHomeAddress.vue';
import UpdateCVSAddress from '@/views/member/UpdateCVSAddress.vue';


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
          path: "/home",
          name: "FrontHome",
          component: () => import("@/views/front/Home.vue"),
        },
        {
          path: "/about",
          name: "FrontAbout",
          component: () => import("@/views/front/About.vue"),
        },
        {
          path: "/Cart",
          name: "Cart",
          component: () => import("@/views/Cart.vue"),
        },
        {
          path: "shop",
          name: "Shop",
          component: () => import("@/views/Shop.vue"),
        },
        // {
        //   path: "checkout",
        //   name: "Checkout",
        //   component: () => import("@/views/Checkout.vue")
        // }

        // ...其他前台路由
        {
          path: "/seller/orders",
          name: "SellerOrders",
          component: () => import("@/views/front/SellerOrders.vue"),
          meta: { role: "SELLER" }, // 只有 SELLER 會用到
        },
        {
          path: "/user/orders",
          name: "UserOrders",
          component: () => import("@/views/front/UserOrders.vue"),
          meta: { role: "USER" }, // 一般使用者用
        },

        // 幫助中心
        {
          path: "/helpCenter",
          name: "help-center",
          component: () => import("@/views/pages/HelpCenter.vue"),
        },
        // 幫助中心搜尋內容頁面
        {
          path: "/search",
          name: "search-link",
          component: SearchResult,
          props: (route) => ({ query: route.query.q }),
        },
        {
          path: "/article/:id",
          name: "article-link",
          component: HelpCenter,
          props: true,
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

        //使用者註冊頁
        {
          path: "/forgot-password",
          name: "ForgotPassword",
          component: () => import("@/views/auth/ForgotPassword.vue"),
        },

        //使用者註冊頁
        {
          path: "/password-reset",
          name: "PasswordReset",
          component: () => import("@/views/auth/ResetPassword.vue"),
        },

        //申請賣家頁
        {
          path: "/shop/apply",
          name: "ApplyShop",
          component: () => import("@/views/front/ApplyShop.vue"),
        },

        //客服中心
        {
          path: "/customerService",
          name: "CustomerService",
          component: () => import("@/views/pages/CustomerService/CustomerService.vue"),
        },
        //賣家商店頁
        {
          path: "/store/:shopId",
          name: "Store",
          component: () => import("@/views/front/SellerStore.vue"),
        },
      ],
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
          path: "activities",
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
          path: "logistics",
          name: "Logistics",
          component: () => import("@/views/admin/Logistics.vue"),
        },
        {
          // 管理付款方式頁面
          path: "payment-method-management",
          name: "PaymentMethodManagement",
          component: () => import("@/views/admin/PaymentMethodManagement.vue"),
        },
        {
          // 後台管理頁面
          path: "admin-management",
          name: "AdminManagement",
          component: () => import("@/views/admin/AdminManagement.vue"),
        },
        {
          // 數據分析頁面
          path: "data-analysis",
          name: "DataAnalysis",
          component: () => import("@/views/admin/DataAnalysis.vue"),
        },
        {
          // 內容檢核頁面
          path: "content-review",
          name: "ContentReview",
          component: () => import("@/views/admin/ContentReview.vue"),
        },
        {
          // 帳號頁面
          path: "users",
          name: "Users",
          component: () => import("@/views/admin/Users.vue"),
        },
        {
          // 管理員帳號頁面
          path: "administrators",
          name: "administrators",
          component: () => import("@/views/admin/Administrators.vue"),
        },
        {
          // 分類管理頁面
          path: "category-management",
          name: "categoryManagement",
          component: () => import("@/views/admin/CategoryManagement.vue"),
        },
        {
          // 商品頁面
          path: "products",
          name: "Products",
          component: () => import("@/views/admin/Products.vue"),
        },
        {
          // 商品分類頁面
          path: "product-category",
          name: "ProductCategory",
          component: () => import("@/views/admin/ProductCategory.vue"),
        },
        {
          // 商品標籤頁面
          path: "product-tag",
          name: "ProductTag",
          component: () => import("@/views/admin/ProductTag.vue"),
        },
        {
          // 商品屬性頁面
          path: "product-attribute",
          name: "ProductAttribute",
          component: () => import("@/views/admin/ProductAttribute.vue"),
        },
        {
          // 訂單頁面
          path: "AdminOrders",
          name: "AdminOrders",
          component: () => import("@/views/admin/AdminOrders.vue"),
        },
        {
          // 評價頁面
          path: "reviews",
          name: "Reviews",
          component: () => import("@/views/admin/Reviews.vue"),
        },
        {
          // 優惠券頁面
          path: "coupons",
          name: "Coupons",
          component: () => import("@/views/admin/Coupons.vue"),
        },
        {
          // 審核商店申請頁面
          path: "shop/review",
          name: "ShopReview",
          component: () => import("@/views/admin/AdminShopApplication.vue"),
        },
        {
          //優惠券管理頁面
          path: '/coupon/adminCouponManager',
          name: 'adminCouponManager-link',
          component: () => import("@/components/admin/Coupon.components/AdminCouponManager.vue"),
          props: true
        },
      ],

    },
    // {
    //   path: "/article/:id",
    //   name: "article-link",
    //   component: HelpCenter,
    //   props: true,
    // },
    //會員中心
    {
      path: '/memberCenter',
      name: 'memberCenter',
      component: () => import('@/views/member/MemberCenter.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/member/Profile.vue')
    },
    {
      path: '/address',
      name: 'address',
      component: () => import('@/views/member/Address.vue')
    },
    {
      path: '/HomeAddressCreate',
      name: 'HomeAddressCreate',
      component: () => import('@/views/member/HomeAddressCreate.vue')
    },
    {
      path: '/CVSAddressCreate',
      name: 'CVSAddressCreate',
      component: () => import('@/views/member/CVSAddressCreate.vue')
    },
    {
      path: '/memberOrders',
      name: 'memberOrders',
      component: () => import('@/views/member/memberOrders.vue')
    },
    {
      path: '/memberCoupons',
      name: 'memberCoupons',
      component: () => import('@/views/member/memberCoupons.vue')
    },
    {
      path: '/updateHomeAddress/:addressId',
      name: 'UpdateHomeAddress',
      component: UpdateHomeAddress,
      props: true // 讓 route 參數能當作 props 傳給元件
    },
    {
      path: '/updateCVSAddress/:addressId',
      name: 'UpdateCVSAddress',
      component: UpdateCVSAddress,
      props: true // 讓 route 參數能當作 props 傳給元件
    },
  ],
});

export default router;