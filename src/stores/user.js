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

  // ✅ 改為 computed 確保 Vue 會自動監聽變更
  const isSeller = computed(() => roles.value.includes("SELLER"));
  const isAdmin = computed(() => roles.value.includes("ADMIN"));
  const isSuperAdmin = computed(() => roles.value.includes("SUPER_ADMIN"));
  const isUser = computed(() => roles.value.includes("USER"));
  shopId.value = localStorage.getItem("shopId") || ""; // 讀取賣場ID
  const isLoggedIn = computed(() => !!userId.value && !!token.value);

  console.log(isSeller.value)

  async function logout() {

    const chatStore = useChatStore(); // <--- *** 3. 獲取 chatStore 實例 ***

    // --- 4. 先嘗試清理 chatStore 狀態並斷開 WebSocket ---
    try {
      console.log("[UserStore logout] 正在呼叫 chatStore.resetChatState()...");
      chatStore.resetChatState(); // <--- *** 確保呼叫 chatStore 的清理函數 ***
      console.log("[UserStore logout] chatStore.resetChatState() 已呼叫。");
    } catch (error) {
      console.error("[UserStore logout] 呼叫 chatStore.resetChatState() 時發生錯誤:", error);
    }
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

  function setUserData(userData) {
    console.log("🚀 [UserStore] 設定使用者資料:", userData);

    const newUserId = Number(userData.userId);
    const newUsername = userData.username || '';
    const newToken = userData.token || ''; // JWT Token
    const newRoles = Array.isArray(userData.roles) ? userData.roles : [];
    const newShopId = userData.shopId ? Number(userData.shopId) : null;

    // 更新 Pinia State
    userId.value = newUserId;
    username.value = newUsername;
    token.value = newToken; // 更新 token ref
    roles.value = newRoles;
    shopId.value = newShopId;

    // --- 持久化到指定的儲存空間 ---
    // 核心身份資訊存 localStorage
    if (newUserId) localStorage.setItem('userId', String(newUserId)); else localStorage.removeItem('userId');
    if (newUsername) localStorage.setItem('username', newUsername); else localStorage.removeItem('username');
    localStorage.setItem('roles', JSON.stringify(newRoles));
    if (newShopId) localStorage.setItem('shopId', String(newShopId)); else localStorage.removeItem('shopId');
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

    // 清除 localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    localStorage.removeItem('shopId');
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
    console.log(`[UserStore] 從 localStorage 讀取: userId=${localUserId}, username=${localUsername}, roles=${localRoles}, shopId=${localShopId}`);

    userId.value = localUserId ? Number(localUserId) : null;
    username.value = localUsername || '';
    try {
      roles.value = localRoles ? JSON.parse(localRoles) : [];
    } catch (e) {
      console.error("解析 localStorage 中的 roles 失敗", e);
      roles.value = [];
    }
    shopId.value = localShopId ? Number(localShopId) : null;

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

    console.log("📌 [UserStore] 初始化狀態完成:", { userId: userId.value, username: username.value, token: !!token.value, roles: roles.value, shopId: shopId.value });
  }

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
    logout,
    isLoggedIn,
    loadUserFromStorage,
  };
});
