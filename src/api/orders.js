import axios from "axios";

export async function fetchSellerOrders() {
    const token = localStorage.getItem("token"); // ✅ 取得 JWT Token
    try {
        const response = await axios.get("http://localhost:8080/api/orders/seller", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; // ✅ 返回訂單數據
    } catch (error) {
        console.error("無法獲取訂單", error);
        return [];
    }
}

export async function fetchAllOrders() {
    const token = localStorage.getItem("token"); // ✅ 取得 JWT Token
    try {
        const response = await axios.get("http://localhost:8080/api/orders/admin", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; // ✅ 返回訂單數據
    } catch (error) {
        console.error("無法獲取訂單", error);
        return [];
    }
}
