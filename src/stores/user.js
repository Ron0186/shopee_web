import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import router from "@/router";

export const useUserStore = defineStore("user", () => {
  const username = ref("");
  const userId = ref("");
  const token = ref("");
  const roles = ref([]);
  const shopId = ref(""); // 新增賣場ID欄位

  // ✅ 改為 computed 確保 Vue 會自動監聽變更
  const isSeller = computed(() => roles.value.includes("SELLER"));
  const isAdmin = computed(() => roles.value.includes("ADMIN"));
  const isSuperAdmin = computed(() => roles.value.includes("SUPER_ADMIN"));
  const isUser = computed(() => roles.value.includes("USER"));
  console.log(isSeller.value);

  function loadUserData() {
    username.value = localStorage.getItem("username") || "";
    userId.value = localStorage.getItem("userId") || "";
    token.value = localStorage.getItem("token") || "";
    shopId.value = localStorage.getItem("shopId") || ""; // 讀取賣場ID

    const rolesString = localStorage.getItem("roles");
    roles.value = rolesString ? JSON.parse(rolesString) : [];

    console.log("📌 讀取用戶數據: ", {
      username: username.value,
      userId: userId.value,
      token: token.value,
      roles: roles.value,
      shopId: shopId.value, // 加入日誌
    });
  }

  //登入儲存
  function saveUserData(newUsername, newUserId, newToken, newRoles) {
    username.value = newUsername;
    userId.value = newUserId;
    token.value = newToken;
    roles.value = newRoles || [];

    if (!Array.isArray(roles.value)) {
      console.error("roles 不是陣列，無法存入 localStorage:", roles.value);
      return;
    }

    localStorage.setItem("username", username.value);
    localStorage.setItem("userId", userId.value);
    localStorage.setItem("token", token.value);
    localStorage.setItem("roles", JSON.stringify(roles.value)); // 轉成 JSON 字串存入

    console.log("🚀 設定用戶數據:", {
      username: username.value,
      userId: userId.value,
      token: token.value,
      roles: roles.value,
    });
  }

  function reloadUserData() {
    // 重新從 localStorage 讀取
    username.value = localStorage.getItem("username") || "";
    userId.value = localStorage.getItem("userId") || "";
    token.value = localStorage.getItem("token") || "";
    roles.value = JSON.parse(localStorage.getItem("roles") || "[]");
    shopId.value = localStorage.getItem("shopId") || ""; // 重新讀取賣場ID
  }

  function setUserData(newUsername, newUserId, newToken, newRoles = []) {
    username.value = newUsername;
    userId.value = newUserId;
    token.value = newToken;
    roles.value = newRoles;

    saveUserData(newUsername, newUserId, newToken, newRoles);

    console.log("🚀 設定用戶角色:", roles.value);

    // ✅ 角色變更後確保 UI 反應正確
    if (isSeller.value) {
      console.log("✅ 使用者是 SELLER，導向 /seller/orders");
      router.push("/seller/orders");
    } else {
      console.log("✅ 使用者是 USER，導向 /user/orders");
      router.push("/user/orders");
    }
  }

  // 新增：更新賣場ID的函數
  function updateShopId(newShopId) {
    // 檢查是否為有效值 (不是 undefined, null, 空字串等)
    if (newShopId && newShopId !== "undefined") {
      shopId.value = newShopId;
      localStorage.setItem("shopId", newShopId);
      console.log("🔄 更新賣場ID:", shopId.value);
    } else {
      shopId.value = "";
      localStorage.removeItem("shopId");
      console.log("🔄 移除無效的賣場ID");
    }
  }

  function clearUserData() {
    username.value = "";
    userId.value = "";
    token.value = "";
    roles.value = [];
    shopId.value = ""; // 清除賣場ID

    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("shopId"); // 從 localStorage 中移除

    console.log("🗑️ 清除用戶數據");
  }

  // ✅ 監聽角色變更，確保 UI 更新
  watch(roles, (newRoles) => {
    console.log("🎯 角色變更:", newRoles);
  });

  // 監聽賣場ID變更
  watch(shopId, (newShopId) => {
    console.log("🏪 賣場ID變更:", newShopId);
  });

  loadUserData();

  return {
    username,
    userId,
    token,
    roles,
    shopId, // 暴露賣場ID
    isSeller,
    isAdmin,
    isUser,
    isSuperAdmin,
    setUserData,
    clearUserData,
    saveUserData,
    reloadUserData,
    updateShopId, // 暴露更新賣場ID的方法
  };
});
