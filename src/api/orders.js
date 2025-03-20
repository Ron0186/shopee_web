import axios from "axios";

export async function fetchAllOrders() {
  try {
    const token = localStorage.getItem("token"); // 確保 token 存在
    if (!token) {
      console.error("❌ 錯誤：找不到 Token，請重新登入！");
      return;
    }

    const response = await axios.get(
      "http://localhost:8081/api/orders/user/orders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ 訂單數據：", response.data);
  } catch (error) {
    console.error(
      "❌ 獲取用戶訂單失敗:",
      error.response ? error.response.data : error
    );
  }
}

export async function fetchAllOrders() {
  const token = localStorage.getItem("token"); // ✅ 取得 JWT Token
  try {
    const response = await axios.get(
      "http://localhost:8081/api/orders/admin/orders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // ✅ 返回訂單數據
  } catch (error) {
    console.error("無法獲取訂單", error);
    return [];
  }
}
