import UpdateHomeAddress from "@/views/member/UpdateHomeAddress.vue";
import UpdateCVSAddress from "@/views/member/UpdateCVSAddress.vue";
import ProductDetails from "@/views/seller/ProductDetails.vue";
import OrderDetails from "@/views/seller/OrderDetails.vue";
import SkuDetails from "@/views/seller/SkuDetails.vue";
import ReviewDetails from "@/views/seller/ReviewDetails.vue";
import ChatRoomComponent from "@/views/pages/CustomerService/ChatRoom.vue"; // <-- 改為靜態導入

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
        // 幫助中心搜尋內容頁面 留哪個自己判斷~
        // {
        //   path: "/search",
        //   name: "search-link",
        //   component: SearchResult,
        //   props: (route) => ({ query: route.query.q }),
        // },
        {
          path: "/search",
          name: "search-link",
          component: () => import("@/components/SearchResult.vue"),
          props: (route) => ({ query: route.query.q }),
        },
        {
          path: "/article/:id",
          name: "article-link",
          component: () => import("@/views/pages/HelpCenter.vue"),
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
        //會員中心
        {
          path: "/memberCenter",
          name: "memberCenter",
          component: () => import("@/views/member/MemberCenter.vue"),
        },
        {
          path: "/profile",
          name: "profile",
          component: () => import("@/views/member/Profile.vue"),
        },
        {
          path: "/address",
          name: "address",
          component: () => import("@/views/member/Address.vue"),
        },
        {
          path: "/HomeAddressCreate",
          name: "HomeAddressCreate",
          component: () => import("@/views/member/HomeAddressCreate.vue"),
        },
        {
          path: "/CVSAddressCreate",
          name: "CVSAddressCreate",
          component: () => import("@/views/member/CVSAddressCreate.vue"),
        },
        // {
        //   path: "/memberOrders",
        //   name: "memberOrders",
        //   component: () => import("@/views/member/MemberOrders.vue"),
        // },
        {
          path: "/memberCoupons",
          name: "memberCoupons",
          component: () => import("@/views/member/MemberCoupons.vue"),
        },
        {
          path: "/updateHomeAddress/:addressId",
          name: "UpdateHomeAddress",
          component: UpdateHomeAddress,
          props: true, // 讓 route 參數能當作 props 傳給元件
        },
        {
          path: "/updateCVSAddress/:addressId",
          name: "UpdateCVSAddress",
          component: UpdateCVSAddress,
          props: true, // 讓 route 參數能當作 props 傳給元件
        },
        {
          path: "/changePassword",
          name: "changePassword",
          component: () => import("@/views/member/ChangePassword.vue"),
        },
        //賣家營收
        {
          path: "/revenue",
          name: "revenue",
          component: () => import("@/views/seller/RevenueDetails.vue"),
        },

        {
          path: "/product-details",
          name: "product-details",
          component: ProductDetails,
          props: true,
        },
        {
          path: "/order-details",
          name: "order-details",
          component: OrderDetails,
          props: true,
        },
        {
          path: "/sku-details",
          name: "sku-details",
          component: SkuDetails,
          props: true,
        },
        {
          path: "/review-details",
          name: "review-details",
          component: ReviewDetails,
          props: true,
        },
        {
          path: "/revenueSummary",
          name: "revenueSummary",
          component: () => import("@/views/seller/RevenueSummary.vue"),
        },
        {
          path: "/cvs",
          name: "cvs",
          component: () => import("@/components/address/EcpayCvsPicker.vue"),
        },


        //下單頁面
        // {
        //   path: "/checkout",
        //   name: "Checkout",
        //   component: () => import("@/views/pages/Checkout.vue"),
        //   meta: { requiresAuth: true }, // 可選：需要登入才能進入
        // },
        {
          path: "/quick-checkout",
          name: "QuickCheckout",
          component: () => import("@/views/pages/QuickCheckout.vue"),
          meta: { requiresAuth: true },
        },

        //評價頁面
        {
          path: "/submitReview",
          name: "SubmitReview",
          component: () => import("@/views/pages/SubmitReview.vue"),
        },

        {
          path: "/seller-setting",
          name: "SellerSetting",
          component: () => import("@/views/pages/SellerSetting.vue"),
          meta: { requiresAuth: true, requiresSeller: true },
        },

        {
          path: "/403",
          name: "Forbidden",
          component: () => import("@/views/errors/Forbidden.vue"),
        },

        // 添加支付結帳頁面
        {
          path: "/checkout/:orderId",
          name: "OrderCheckout",
          component: () => import("@/views/CheckoutPage.vue"),
          meta: { role: "USER" }, // 一般使用者用
        },
        {
          path: "/checkout/pay/:orderId",
          name: "OrderPayment",
          component: () =>
            import("@/components/order.components/OrderPayment.vue"),
          meta: { requiresAuth: true },
        },

        // 添加支付結果頁面
        {
          path: "/checkout/payment/:orderId",
          name: "OrderPaymentAlias",
          component: () =>
            import("@/components/order.components/OrderPayment.vue"),
          meta: { role: "USER" }, // 一般使用者用
        },
        {
          path: "/payment/result/:orderId",
          name: "PaymentResult",
          component: () => import("@/views/front/PaymentResult.vue"),
        },
        {
          path: "/debug/payment/:id",
          name: "DebugPayment",
          component: () => import("@/views/DebugPaymentPage.vue"),
        },
        // ,
        // {
        //   path: '/wishlist',
        //   name: 'Wishlist',
        //   component: () => import('@/views/Placeholder.vue')
        // },
        // {
        //   path: '/order-tracking',
        //   name: 'OrderTracking',
        //   component: () => import('@/views/Placeholder.vue')
        // }
        //客服中心
        // {
        //   path: "/chat/:chatRoomId",
        //   name: "ChatRoom",
        //   component: () => import("@/views/pages/CustomerService/ChatRoom.vue"),
        // },

        //聊天室頁面
        {
          path: "/chat/:chatRoomId",
          name: "ChatRoom",
          component: ChatRoomComponent, // <-- 直接使用靜態導入的組件
          meta: { requiresAuth: true },
        },

        //商品詳情頁(買家看到的)
        {
          path: "/products/:productId/detail",
          name: "FrontProductDetail",
          component: () => import("@/views/front/FrontProductDetail.vue"),
        },

        //賣家商店頁
        {
          path: "/store/:shopId",
          name: "Store",
          component: () => import("@/views/front/SellerStore.vue"),
        },

        // 「我的商品」頁面
        {
          path: "/seller/shops/:shopId/products",
          name: "Products",
          component: () => import("@/views/front/Products.vue"),
          meta: { requiresAuth: true }, // 如果需要登入驗證
        },
        // SKU 管理頁面
        {
          path: "/seller/shops/:shopId/products/:productId/skus",
          name: "ProductSkuManagement",
          component: () => import("@/views/front/ProductSkuManagement.vue"),
          meta: { requiresAuth: true, role: "seller" },
        },

        //賣家數據分析頁
        {
          path: "/seller/analytics",
          name: "SellerAnalytics",
          component: () => import("@/views/front/SellerAnalytics.vue"),
          meta: { role: "SELLER", requiresAuth: true }, // 只有 SELLER 角色的用戶可以訪問，並需要登入
        },

        //google登入後回填頁
        {
          path: "/fill-phone",
          name: "FillPhone",
          component: () => import("@/views/auth/FillPhone.vue"),
        },
        //google登入後成功頁
        {
          path: "/login/oauth2/success",
          name: "OAuth2Success",
          component: () => import("@/views/auth/OAuth2Success.vue"),
        },
        //google綁定帳號頁
        {
          path: "/link-account",
          name: "LinkAccount",
          component: () => import("@/views/auth/LinkAccount.vue"),
          meta: {
            title: "連結帳號",
            requiresAuth: false, // 此頁面不需要身份驗證
          },
        },
        //跳到商品的頁面
        {
          path: "/products/:productId",
          name: "ProductDetail",
          component: () => import("@/views/front/ProductDetail.vue"),
        },
        {
          path: "/seller/shops/:shopId/campaigns",
          name: "SellerCampaigns",
          component: () => import("@/views/front/SellerCampaigns.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "seller/coupon/apply", // 注意這是相對路徑
          name: "CouponApply",
          component: () => import("@/views/front/CouponApplicationForm.vue"),
          meta: { requiresAuth: true, role: "SELLER" }, // 設定路由元信息
        },
        {
          path: "/shops/list", // 或者 'shop-list' 等你喜歡的路徑
          name: "ShopListPage", // 給路由命名
          component: () => import("@/views/front/ShopListPage.vue"), // 指向新元件
          // meta: { requiresAuth: true } // 看是否需要登入才能查看列表
        },
      ],
    }, {
      path: '/cropper-popup',
      name: 'AvatarCropperWindow',
      component: () => import('@/components/profile/AvatarCropperWindow.vue')
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
          path: "dashboard",
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
          // 管理付款狀態頁面
          path: "payment-status-management",
          name: "PaymentStatusManagement",
          component: () => import("@/views/admin/PaymentStatusManagement.vue"),
        },
        {
          // 管理物流方式頁面
          path: "shipment-method-management",
          name: "ShipmentMethodManagement",
          component: () => import("@/views/admin/ShipmentMethodManagement.vue"),
        },
        {
          // 管理物流狀態頁面
          path: "shipment-status-management",
          name: "ShipmentStatusManagement",
          component: () => import("@/views/admin/ShipmentStatusManagement.vue"),
        },

        {
          // 整合管理付款/物流頁面
          path: "integrated-management",
          name: "IntegratedManagement",
          component: () => import("@/views/admin/IntegratedManagement.vue"),
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
          // 管理員商品頁面
          path: "product-review",
          name: "ProductReview",
          component: () => import("@/views/admin/ProductReview.vue"),
        },
        {
          // 管理員個人資料頁面
          path: "profile",
          name: "AdminProfile",
          component: () => import("@/views/admin/AdminProfile.vue"),
        },
        {
          // 管理員個人資料頁面
          path: "analytics/user-analytics",
          name: "UserAnalytics",
          component: () => import("@/views/admin/UserAnalyticsPage.vue"),
        },
        {
          // 分類管理頁面
          path: "category-management",
          name: "categoryManagement",
          component: () => import("@/views/admin/CategoryManagement.vue"),
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
          path: "orders",
          name: "AdminOrders",
          component: () => import("@/views/admin/AdminOrders.vue"),
        },
        {
          // 評價頁面
          path: "reviews",
          name: "Reviews",
          component: () => import("@/views/admin/Reviews.vue"),
        },
        // {
        //   // 優惠券頁面
        //   path: "coupons",
        //   name: "Coupons",
        //   component: () => import("@/views/admin/Coupons.vue"),
        // },
        {
          // 審核商店申請頁面
          path: "shop/review",
          name: "ShopReview",
          component: () => import("@/views/admin/AdminShopApplication.vue"),
        },
        {
          //優惠券管理頁面
          path: "/coupon/adminCouponManager",
          name: "adminCouponManager-link",
          component: () =>
            import(
              "@/components/admin/Coupon.components/AdminCouponManager.vue"
            ),
          props: true,
        },
        {
          //前往審核優惠券申請頁面
          path: "/admin/coupon/applicationReview",
          name: "applicationReview-link",
          component: () =>
            import(
              "@/components/admin/Coupon.components/CouponApplicationReview.vue"
            ),
          props: true,
        },
        // {
        //   //test add selector
        //   path: '/add/test',
        //   name: 'add-test',
        //   component: () => import("@/views/member/test.vue"),

        // },
      ],
    },
    // {
    //   path: "/article/:id",
    //   name: "article-link",
    //   component: HelpCenter,
    //   props: true,
    // },
    //會員中心
    // {
    //   path: "/memberCenter",
    //   name: "memberCenter",
    //   component: () => import("@/views/member/MemberCenter.vue"),
    // },
    // {
    //   path: "/profile",
    //   name: "profile",
    //   component: () => import("@/views/member/Profile.vue"),
    // },
    // {
    //   path: "/address",
    //   name: "address",
    //   component: () => import("@/views/member/Address.vue"),
    // },
    // {
    //   path: "/HomeAddressCreate",
    //   name: "HomeAddressCreate",
    //   component: () => import("@/views/member/HomeAddressCreate.vue"),
    // },
    // {
    //   path: "/CVSAddressCreate",
    //   name: "CVSAddressCreate",
    //   component: () => import("@/views/member/CVSAddressCreate.vue"),
    // },
    // {
    //   path: "/memberOrders",
    //   name: "memberOrders",
    //   component: () => import("@/views/member/MemberOrders.vue"),
    // },
    // {
    //   path: "/memberCoupons",
    //   name: "memberCoupons",
    //   component: () => import("@/views/member/MemberCoupons.vue"),
    // },
    // {
    //   path: "/updateHomeAddress/:addressId",
    //   name: "UpdateHomeAddress",
    //   component: UpdateHomeAddress,
    //   props: true, // 讓 route 參數能當作 props 傳給元件
    // },
    // {
    //   path: "/updateCVSAddress/:addressId",
    //   name: "UpdateCVSAddress",
    //   component: UpdateCVSAddress,
    //   props: true, // 讓 route 參數能當作 props 傳給元件
    // },
  ],
});

export default router;
