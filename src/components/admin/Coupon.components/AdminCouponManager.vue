<template>
    <div class="container my-4">
        <h3>後台管理者優惠券管理</h3>

        <!-- 搜尋、新增、每頁筆數 -->
        <div class="row mb-3 align-items-center">
            <div class="col-md-4 mb-2 mb-md-0">
                <button class="btn btn-primary w-100" @click="openModal('insert')">
                    <i class="bi bi-plus-lg"></i> 新增優惠券
                </button>
            </div>
            <div class="col-md-4 mb-2 mb-md-0">
                <input type="text" class="form-control" placeholder="搜尋優惠券名稱" v-model="findName" @input="callFind(1)" />
            </div>
            <div class="col-md-4">
                <CouponSelect :total="total" :options="[2, 3, 4, 5, 7]" v-model="rows" @change="callFind(1)" />
            </div>
        </div>

        <!-- Chart 統計圖表 -->
        <CouponChart ref="chartRef" />

        <!-- 🚀 ✅ 優惠券卡片列表 -->
        <div class="row">
            <template v-if="coupons.length > 0">
                <AdminCouponCard v-for="coupon in coupons" :key="coupon.couponId" :coupon="coupon"
                    @updateCoupon="onUpdateCoupon" @deleteCoupon="onDeleteCoupon" />
            </template>
            <div v-else class="text-center text-muted">
                目前沒有優惠券
            </div>
        </div>

        <!-- 分頁 -->
        <nav v-if="total > 0" class="mt-3">
            <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: current === 1 }" @click="callFind(1)">
                    <span class="page-link">«</span>
                </li>
                <li v-for="page in pages" :key="page" class="page-item" :class="{ active: page === current }"
                    @click="callFind(page)">
                    <span class="page-link">{{ page }}</span>
                </li>
                <li class="page-item" :class="{ disabled: current === pages }" @click="callFind(pages)">
                    <span class="page-link">»</span>
                </li>
            </ul>
        </nav>

        <!-- 優惠券 Modal -->
        <!-- 綁定 createCoupon 事件到 callCreate 方法 -->
        <AdminCouponModal v-if="isModalVisible" :isModalVisible="isModalVisible" :isInsert="isInsert"
            :coupon="selectedCoupon" @closeModal="closeModal" @createCoupon="addNewCoupon"
            @modifyCoupon="updateCoupon" />
    </div>
</template>

<script setup>
import { ref } from "vue";
import axiosapi from "@/plugins/axios"
import Swal from "sweetalert2";
import AdminCouponCard from "./AdminCouponCard.vue";
import AdminCouponModal from "./AdminCouponModal.vue";
import CouponSelect from "./CouponSelect.vue";
import CouponChart from "./CouponChart.vue";

const total = ref(0);
const pages = ref(0);
const current = ref(1);
const rows = ref(4);
const findName = ref("");
const coupons = ref([]);
const isModalVisible = ref(false);
const chartRef = ref(null);
const selectedCoupon = ref(null);
const isInsert = ref(false); // 用來區分「新增」或「修改」



// 開啟 Modal
function openModal(action, couponData = {}) {
    if (action === "insert") {
        isInsert.value = true;
        selectedCoupon.value = {
            couponId: "",
            couponName: "",
            couponCode: "",
            description: "",
            startDate: "",
            endDate: "",
            discountType: "percentage",
            discountValue: 0,
            usageLimit: 1,
            usagePerUser: 1,
            photo: null,
        };
    } else if (action === "update") {
        isInsert.value = false;
        selectedCoupon.value = { ...couponData }; // 從外部帶入要修改的資料
    }
    isModalVisible.value = true;
}

// 關閉 Modal
function closeModal() {
    isModalVisible.value = false;
}

// 讀取/搜尋優惠券
const callFind = async (page = 1) => {
    current.value = page;
    try {
        const response = await axiosapi.post("/coupons/find", {
            start: (page - 1) * rows.value,
            rows: rows.value,
            couponName: findName.value || null,
        });

        coupons.value = response.data.list || [];
        total.value = response.data.count;
        pages.value = Math.ceil(total.value / rows.value);
    } catch (error) {
        Swal.fire("錯誤!", "查詢失敗", "error");
    }
};

// 🔥 新增優惠券
async function addNewCoupon(newCoupon) {
    try {
        console.log("發送新增(優惠券)請求:", newCoupon);
        // 1) 建立優惠券本體
        const resp = await axiosapi.post("/coupons", JSON.stringify(newCoupon), {
            headers: { "Content-Type": "application/json" },
        });
        if (!resp.data.success) {
            throw new Error(resp.data.message || "新增失敗");
        }

        // 2) 若有上傳圖片 → newCoupon.photo 為 Base64
        //    photoId = couponId
        if (newCoupon.photo && newCoupon.couponId) {
            console.log("發送新增(圖片)請求, photoId=", newCoupon.couponId);
            const detailResp = await axiosapi.post(
                "/coupons/detail",
                JSON.stringify({
                    photoId: parseInt(newCoupon.couponId), // couponId 與 photoId 相同
                    photo: newCoupon.photo,
                }),
                { headers: { "Content-Type": "application/json" } }
            );
            if (!detailResp.data.success) {
                throw new Error(detailResp.data.message || "圖片新增失敗");
            }
        }

        Swal.fire("成功!", "新增成功", "success");
        closeModal();
        callFind(); // 重新查詢
    } catch (error) {
        console.error("新增失敗:", error);
        Swal.fire("錯誤!", error.message || "新增失敗", "error");
    }
}

async function updateCoupon(updatedCoupon) {
    try {
        console.log("發送更新請求:", updatedCoupon);

        const response = await axiosapi.put(
            `/coupons/${updatedCoupon.couponId}`, // API 路徑符合後端格式
            JSON.stringify(updatedCoupon), // 轉成 JSON 字串
            { headers: { "Content-Type": "application/json" } } // 設定請求標頭
        );

        console.log("API 回應:", response.data);

        if (response.data.success) {
            Swal.fire("成功!", response.data.message || "修改優惠券成功", "success");
            closeModal();
            callFind(); // 重新載入優惠券
        } else {
            throw new Error(response.data.message || "修改失敗");
        }
    } catch (error) {
        console.error("修改失敗", error);
        Swal.fire("錯誤!", error.message || "修改失敗", "error");
    }
};


// **初始化讀取優惠券資料**
const fetchCoupons = async () => {
    try {
        const response = await axiosapi.post("/coupons/find", "{}"); // 發送空的 JSON 來獲取所有優惠券
        if (response.data && response.data.list) {
            coupons.value = response.data.list;
        }
    } catch (error) {
        console.error("讀取優惠券失敗:", error);
    }
};

// **刪除優惠券**
const onDeleteCoupon = async (couponId) => {
    const result = await Swal.fire({
        title: "確定要刪除嗎?",
        text: "此動作無法復原!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "確定刪除",
        cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
        try {
            const response = await axiosapi.delete(`/coupons/${couponId}`);

            if (response.data.success) {
                // 更新本地資料
                coupons.value = coupons.value.filter(coupon => coupon.couponId !== couponId);

                Swal.fire({
                    title: "刪除成功!",
                    text: response.data.message,
                    icon: "success",
                });
            } else {
                Swal.fire({
                    title: "刪除失敗!",
                    text: response.data.message || "請稍後再試。",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("刪除失敗:", error);
            Swal.fire({
                title: "刪除失敗!",
                text: "發生錯誤，請稍後再試。",
                icon: "error",
            });
        }
    }
};

// **修改優惠券**
const onUpdateCoupon = (couponId) => {
    console.log("修改優惠券 ID:", couponId);
};

// 首次載入
callFind();
</script>
