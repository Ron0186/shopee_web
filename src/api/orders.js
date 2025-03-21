import axios from "axios";

/**
 * 取得「使用者」的訂單
 */
export async function fetchUserOrders() {
  try {
    const token = localStorage.getItem("token"); // 確保 token 存在
    if (!token) {
      console.error("❌ 錯誤：找不到 Token，請重新登入！");
      return [];
    }

    const response = await axios.get(
      "http://localhost:8081/api/orders/user/orders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ 使用者訂單數據：", response.data);
    return response.data; // ✅ 返回訂單數據
  } catch (error) {
    console.error(
      "❌ 獲取使用者訂單失敗:",
      error.response ? error.response.data : error
    );
    return [];
  }
}

/**
 * 取得「管理員」的訂單
 */
export async function fetchAdminOrders() {
  try {
    const token = localStorage.getItem("token"); // ✅ 取得 JWT Token
    if (!token) {
      console.error("❌ 錯誤：找不到 Token，請重新登入！");
      return [];
    }

    const response = await axios.get(
      "http://localhost:8081/api/orders/admin/orders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ 管理員訂單數據：", response.data);
    return response.data; // ✅ 返回訂單數據
  } catch (error) {
    console.error("❌ 無法獲取管理員訂單", error);
    return [];
  }
}
export async function fetchSellerOrders() {
  try {
    const token = localStorage.getItem("token"); // ✅ 取得 JWT Token
    if (!token) {
      console.error("❌ 錯誤：找不到 Token，請重新登入！");
      return [];
    }

    const response = await axios.get(
      "http://localhost:8081/api/orders/seller/orders", // ✅ 賣家 API
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ 賣家訂單數據：", response.data);
    return response.data; // ✅ 返回訂單數據
  } catch (error) {
    console.error("❌ 無法獲取賣家訂單", error);
    return [];
  }
}