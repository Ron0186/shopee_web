import axios from '@/plugins/axios' // 假设您已经配置了axios实例

/**
 * 获取商店列表
 * @returns {Promise<Array>} 商店列表数据
 */
export const fetchStores = async () => {
    try {
        const response = await axios.get('http://localhost:8081/api/shop/allShop')
        return response.data
    } catch (error) {
        console.error('获取商店列表失败:', error)
        return {
            success: false,
            message: error.response?.data?.message || '获取商店列表失败'
        }
    }
}

/**
 * 获取未读消息计数
 * @param {string} userId 用户ID (在這裡應該是 sellerId)
 * @returns {Promise<Array>} 未读消息计数数据
 */
export const fetchUnreadCounts = async (userId) => {
    try {
        const response = await axios.get(`/api/chat/unread?sellerId=${userId}`)
        return response.data
    } catch (error) {
        console.error('获取未读消息计数失败:', error)
        return {
            success: false,
            message: error.response?.data?.message || '获取未读消息计数失败'
        }
    }
}