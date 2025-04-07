import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import router from '@/router';
import { useChatStore } from './chatStore';  // 引入 chatStore 获取 stompClient
import axios from '@/plugins/axios'; // 确保您已引入 axios

export const useUserStore = defineStore("user", () => {
  const username = ref("");
  const userId = ref("");
  const token = ref("");
  const roles = ref([]);
  const shopId = ref(""); // 新增賣場ID欄位
  const currentUser = ref(null);
  const profilePhoto = ref(""); // 新增頭像 URL ref

  // ✅ 改為 computed 確保 Vue 會自動監聽變更
  const isSeller = computed(() => roles.value.includes("SELLER"));
  const isAdmin = computed(() => roles.value.includes("ADMIN"));
  const isSuperAdmin = computed(() => roles.value.includes("SUPER_ADMIN"));
  const isUser = computed(() => roles.value.includes("USER"));
  shopId.value = localStorage.getItem("shopId") || ""; // 讀取賣場ID
  const isLoggedIn = computed(() => !!userId.value && !!token.value);

  // 新增 computed 用來獲取頭像，處理預設頭像的邏輯
  const getProfilePhoto = computed(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
    // 如果頭像 URL 已經是完整路徑就直接使用，否則加上 baseUrl
    const photoUrl = profilePhoto.value || '/uploads/default.jpg';
    return photoUrl.startsWith('http') ? photoUrl : `${baseUrl}${photoUrl}`;
  });

  console.log(isSeller.value)

  async function logout() {
    console.log("[UserStore] 執行登出...");
    // 清理本地資料
    clearUserData();
    // 通知後端 (可選)
    // try { await axios.post('/api/auth/logout'); } catch (e) { console.error("後端登出失敗:", e); }
    // 斷開 WebSocket (應由 App.vue 或登出元件觸發 chatStore.disconnectWebSocket())
    console.log("✅ [UserStore] 登出完成。");
    router.push('/user/login'); // 導向登入頁
  }

  function loadUserData() {
    username.value = localStorage.getItem('username') || '';
    userId.value = localStorage.getItem('userId') || '';
    token.value = localStorage.getItem('token') || '';
    profilePhoto.value = localStorage.getItem('profilePhoto') || ''; // 讀取頭像URL

    try {
      const rolesString = localStorage.getItem('roles');
      if (rolesString && rolesString.startsWith('[')) {
        // ✅ 正常的 JSON 陣列字串
        roles.value = JSON.parse(rolesString);
      } else if (typeof rolesString === 'string') {
        // ✅ 單一角色（字串）
        roles.value = [rolesString];
      } else {
        roles.value = [];
      }
    } catch (err) {
      console.warn("⚠️ 讀取角色時發生錯誤，自動重置：", err);
      localStorage.removeItem('roles');
      roles.value = [];
    }

    console.log("📌 讀取用戶數據: ", {
      username: username.value,
      userId: userId.value,
      token: token.value,
      roles: roles.value,
      shopId: shopId.value,
      profilePhoto: profilePhoto.value, // 加入日誌
    });
  }

  //登入儲存
  function saveUserData(newUsername, newUserId, newToken, newRoles, newProfilePhoto) {
    username.value = newUsername;
    userId.value = newUserId;
    token.value = newToken;
    roles.value = newRoles || [];

    // 新增設定頭像
    if (newProfilePhoto) {
      profilePhoto.value = newProfilePhoto;
      localStorage.setItem("profilePhoto", newProfilePhoto);
    }

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
      profilePhoto: profilePhoto.value, // 加入日誌
    });
  }

  function reloadUserData() {
    // 重新從 localStorage 讀取
    username.value = localStorage.getItem("username") || "";
    userId.value = localStorage.getItem("userId") || "";
    token.value = localStorage.getItem("token") || "";
    roles.value = JSON.parse(localStorage.getItem("roles") || "[]");
    shopId.value = localStorage.getItem("shopId") || ""; // 重新讀取賣場ID
    profilePhoto.value = localStorage.getItem("profilePhoto") || ""; // 重新讀取頭像URL
  }

  function setUserData(userData) {
    console.log("🚀 [UserStore] 設定使用者資料:", userData);

    const newUserId = Number(userData.userId);
    const newUsername = userData.username || '';
    const newToken = userData.token || ''; // JWT Token
    const newRoles = Array.isArray(userData.roles) ? userData.roles : [];
    const newShopId = userData.shopId ? Number(userData.shopId) : null;
    const newProfilePhoto = userData.profilePhoto || ''; // 新增頭像處理

    // 更新 Pinia State
    userId.value = newUserId;
    username.value = newUsername;
    token.value = newToken; // 更新 token ref
    roles.value = newRoles;
    shopId.value = newShopId;
    profilePhoto.value = newProfilePhoto; // 更新頭像 ref

    // --- 持久化到指定的儲存空間 ---
    // 核心身份資訊存 localStorage
    if (newUserId) localStorage.setItem('userId', String(newUserId)); else localStorage.removeItem('userId');
    if (newUsername) localStorage.setItem('username', newUsername); else localStorage.removeItem('username');
    localStorage.setItem('roles', JSON.stringify(newRoles));
    if (newShopId) localStorage.setItem('shopId', String(newShopId)); else localStorage.removeItem('shopId');
    if (newProfilePhoto) localStorage.setItem('profilePhoto', newProfilePhoto); else localStorage.removeItem('profilePhoto');
    localStorage.removeItem('token'); // 確保 localStorage 不存 token
    localStorage.removeItem('userData'); // 移除舊的組合鍵

    // Token 【只】存 sessionStorage
    if (newToken) {
      sessionStorage.setItem('authToken', newToken);
      // 立刻更新 Axios 全域設定 (如果 axios 是在這裡引入的話)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      console.log("[UserStore] Axios 標頭已設定新 Token。");
    } else {
      sessionStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
      console.log("[UserStore] Axios 標頭已清除。");
    }

    console.log("✅ [UserStore] 使用者資料已儲存至 state、localStorage(身份)、sessionStorage(Token)。");
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

  // 新增：更新頭像URL的函數
  function updateProfilePhoto(newProfilePhoto) {
    if (newProfilePhoto && newProfilePhoto !== "undefined") {
      profilePhoto.value = newProfilePhoto;
      localStorage.setItem("profilePhoto", newProfilePhoto);
      console.log("🖼️ 更新使用者頭像:", profilePhoto.value);
    } else {
      profilePhoto.value = "";
      localStorage.removeItem("profilePhoto");
      console.log("🖼️ 移除使用者頭像");
    }
  }

  /**
   * 清除使用者資料（登出時呼叫）
   */
  function clearUserData() {
    console.log("🗑️ [UserStore] 清除使用者資料...");
    // 清除 Pinia State
    userId.value = null;
    username.value = '';
    token.value = ''; // 清除 token ref
    roles.value = [];
    shopId.value = null;
    profilePhoto.value = ''; // 清除頭像 ref

    // 清除 localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    localStorage.removeItem('shopId');
    localStorage.removeItem('profilePhoto'); // 清除頭像
    localStorage.removeItem('token'); // 確保清除
    localStorage.removeItem('userData');

    // 清除 sessionStorage
    sessionStorage.removeItem('authToken'); // 清除 token
    // 你可能還存了其他 session 資料也一併清除
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('roles');

    // 清除 Axios 標頭
    delete axios.defaults.headers.common['Authorization'];
    console.log("✅ [UserStore] 使用者資料已清除。");
  }

  // ✅ 監聽角色變更，確保 UI 更新
  watch(roles, (newRoles) => {
    console.log("🎯 角色變更:", newRoles);
  });

  // 監聽賣場ID變更
  watch(shopId, (newShopId) => {
    console.log("🏪 賣場ID變更:", newShopId);
  });

  // 監聽頭像URL變更
  watch(profilePhoto, (newProfilePhoto) => {
    console.log("🖼️ 頭像URL變更:", newProfilePhoto);
  });

  // 🔴 新增 fetchCurrentUser 函式
  async function fetchCurrentUser() {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/user/login');
        return;
      }
      const response = await axios.get(`http://localhost:8081/api/user/check/${userId.value}`, { // 使用 userId.value
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      currentUser.value = response.data; // 假設後端返回包含使用者資訊的物件
      updateShopId(response.data.shopId); // 如果後端也返回 shopId，則更新
      updateProfilePhoto(response.data.profilePhoto); // 如果後端返回頭像URL，則更新
    } catch (error) {
      console.error('獲取用戶失敗', error);
      clearUserData();
      router.push('/user/login');
    }
  }

  /**
   * Store 初始化時從儲存空間載入資料
   */
  function loadUserFromStorage() {
    console.log("--- [UserStore] 從儲存空間載入使用者資料 ---");
    // 從 localStorage 載入核心身份
    const localUserId = localStorage.getItem('userId');
    const localUsername = localStorage.getItem('username');
    const localRoles = localStorage.getItem('roles');
    const localShopId = localStorage.getItem('shopId');
    const localProfilePhoto = localStorage.getItem('profilePhoto');
    console.log(`[UserStore] 從 localStorage 讀取: userId=${localUserId}, username=${localUsername}, roles=${localRoles}, shopId=${localShopId}, profilePhoto=${localProfilePhoto}`);

    userId.value = localUserId ? Number(localUserId) : null;
    username.value = localUsername || '';
    try {
      roles.value = localRoles ? JSON.parse(localRoles) : [];
    } catch (e) {
      console.error("解析 localStorage 中的 roles 失敗", e);
      roles.value = [];
    }
    shopId.value = localShopId ? Number(localShopId) : null;
    profilePhoto.value = localProfilePhoto || '';

    // 從 sessionStorage 載入 Token
    const sessionToken = sessionStorage.getItem('authToken');
    console.log(`[UserStore] 從 sessionStorage 讀取 authToken: 是否存在? ${!!sessionToken}`);
    token.value = sessionToken || '';

    // 根據載入的 Token 設定 Axios 標頭
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      console.log("[UserStore] Axios 標頭已根據初始 Token 設定。");
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log("[UserStore] 未找到初始 Token，Axios 標頭已清除。");
    }

    console.log("📌 [UserStore] 初始化狀態完成:", {
      userId: userId.value,
      username: username.value,
      token: !!token.value,
      roles: roles.value,
      shopId: shopId.value,
      profilePhoto: profilePhoto.value
    });
  }

  loadUserData();

  return {
    username,
    userId,
    token,
    roles,
    shopId, // 暴露賣場ID
    profilePhoto, // 暴露頭像URL
    getProfilePhoto, // 暴露獲取頭像方法
    isSeller,
    isAdmin,
    isUser,
    isSuperAdmin,
    setUserData,
    clearUserData,
    saveUserData,
    reloadUserData,
    updateShopId, // 暴露更新賣場ID的方法
    updateProfilePhoto, // 暴露更新頭像的方法
    fetchCurrentUser, // 🔴 暴露 fetchCurrentUser 函式
    currentUser, // 🔴 暴露 currentUser ref
    logout,
    isLoggedIn,
    loadUserFromStorage,
  };
});