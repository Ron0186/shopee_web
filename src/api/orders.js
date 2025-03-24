import axios from "axios";
import { useUserStore } from "@/stores/user"; // 引入用戶狀態管理

/**
 * 獲取授權標頭
 * @returns {Object} 包含Authorization標頭的物件
 */
function getAuthHeaders() {
  const userStore = useUserStore();

  // 優先使用 store 中的 token (更可靠)
  const token = userStore.token;

  if (!token) {
    throw new Error("未找到有效的授權令牌，請重新登入");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * 處理 API 回應
 * @param {Object} response - API 回應物件
 * @returns {Array|Object} 處理後的資料
 */
function handleResponse(response) {
  // 檢查是否為新的API回應格式 { statusCode, status, message, data }
  if (response.data && response.data.hasOwnProperty("statusCode")) {
    console.log(
      `✅ API 回應 (${response.data.statusCode}): ${response.data.message}`
    );
    return response.data.data;
  } else {
    // 舊的直接回傳格式
    return response.data;
  }
}

/**
 * 取得「使用者」的訂單
 * @returns {Promise<Array>} 訂單數據陣列
 */
export async function fetchUserOrders() {
  try {
    console.log("⏳ 獲取使用者訂單...");

    const headers = getAuthHeaders();
    console.log(
      "📝 使用授權標頭:",
      headers.Authorization.substring(0, 15) + "..."
    );

    const response = await axios.get(
      "/api/orders/user/orders", // 使用相對路徑
      { headers }
    );

    return handleResponse(response);
  } catch (error) {
    console.error("❌ 獲取使用者訂單失敗:", error);

    // 提供更詳細的錯誤信息
    if (error.response) {
      const statusCode = error.response.status;
      const responseData = error.response.data;

      console.error(`服務器錯誤 (${statusCode}):`, responseData);

      // 如果是權限問題，提供更具體的錯誤訊息
      if (statusCode === 403) {
        throw new Error("權限不足，您沒有權限查看使用者訂單");
      }

      throw new Error(responseData.message || "獲取訂單時發生伺服器錯誤");
    }

    throw error; // 重新拋出其他類型的錯誤
  }
}

/**
 * 取得「管理員」的訂單
 * @returns {Promise<Array>} 訂單數據陣列
 */
export async function fetchAdminOrders() {
  try {
    console.log("⏳ 獲取管理員訂單...");

    const headers = getAuthHeaders();

    const response = await axios.get(
      "/api/orders/admin/orders", // 使用相對路徑
      { headers }
    );

    return handleResponse(response);
  } catch (error) {
    console.error("❌ 獲取管理員訂單失敗:", error);

    if (error.response?.status === 403) {
      throw new Error("權限不足，您沒有管理員權限");
    }

    throw new Error(
      "無法獲取管理員訂單: " + (error.response?.data?.message || error.message)
    );
  }
}

/**
 * 取得「賣家」的訂單
 * @returns {Promise<Array>} 訂單數據陣列
 */
export async function fetchSellerOrders() {
  try {
    console.log("⏳ 獲取賣家訂單...");

    const headers = getAuthHeaders();

    const response = await axios.get(
      "/api/orders/seller/orders", // 使用相對路徑
      { headers }
    );

    return handleResponse(response);
  } catch (error) {
    console.error("❌ 獲取賣家訂單失敗:", error);

    if (error.response?.status === 403) {
      throw new Error("權限不足，您沒有賣家權限");
    }

    throw new Error(
      "無法獲取賣家訂單: " + (error.response?.data?.message || error.message)
    );
  }
}

/**
 * 更新訂單狀態
 * @param {number} orderId - 訂單ID
 * @param {string} status - 新狀態
 * @returns {Promise<Object>} 更新結果
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const headers = getAuthHeaders();

    const response = await axios.put(
      `/api/orders/${orderId}`,
      { status },
      { headers }
    );

    return handleResponse(response);
  } catch (error) {
    console.error(`❌ 更新訂單 #${orderId} 狀態失敗:`, error);
    throw new Error(
      "更新訂單狀態失敗: " + (error.response?.data?.message || error.message)
    );
  }
}
