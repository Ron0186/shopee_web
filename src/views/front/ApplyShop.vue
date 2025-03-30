<template>
  <div class="container mt-3">
    <h2 class="mb-3 h3">申請成為賣家</h2>
    <!-- 新增一鍵帶入按鈕 -->
    <div class="mb-2">
      <button type="button" class="btn btn-secondary w-100" @click="fillDefaultInfo">
        <i class="bi bi-lightning-fill me-1"></i>一鍵帶入資料
      </button>
    </div>
    <form @submit.prevent="submitApplication">
      <!-- 商店相關資訊 -->
      <div class="card mb-3">
        <div class="card-header bg-primary text-white py-2">
          <h5 class="mb-0 h6">商店資訊</h5>
        </div>
        <div class="card-body py-2">
          <div class="mb-2">
            <label class="form-label small mb-1">商店名稱</label>
            <input v-model="form.shopName" type="text" class="form-control form-control-sm" placeholder="請輸入商店名稱" required />
          </div>

          <div class="mb-2">
            <label class="form-label small mb-1">商店分類</label>
            <select v-model="form.shopCategory" class="form-select form-select-sm" required>
              <option value="" disabled>請選擇商店分類</option>
              <option v-for="category in shopCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="mb-2">
            <label class="form-label small mb-1">商店描述</label>
            <textarea v-model="form.description" class="form-control form-control-sm" rows="4" placeholder="請輸入商店描述(50字以內)"></textarea>
          </div>
        </div>
      </div>

      <!-- 退貨地址相關資訊 -->
      <div class="card mb-3">
        <div class="card-header bg-warning text-white py-2">
          <h5 class="mb-0 h6">退貨地址</h5>
        </div>
        <div class="card-body py-2">
          <div class="row">
            <div class="col-md-6 mb-2">
              <label class="form-label small mb-1">城市</label>
              <select v-model="selectedCity" class="form-select form-select-sm" @change="updateDistricts" required>
                <option value="" disabled>請選擇城市</option>
                <option v-for="city in Object.keys(taiwanCities)" :key="city" :value="city">{{ city }}</option>
              </select>
            </div>

            <div class="col-md-6 mb-2">
              <label class="form-label small mb-1">區域</label>
              <select v-model="form.returnDistrict" class="form-select form-select-sm" @change="updatePostalCode" required>
                <option value="" disabled>請選擇區域</option>
                <option v-for="district in Object.keys(availableDistricts)" :key="district" :value="district">
                  {{ district }}
                </option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-4 mb-2">
              <label class="form-label small mb-1">郵遞區號</label>
              <input v-model="form.returnZipCode" type="text" class="form-control form-control-sm" readonly />
            </div>

            <div class="col-md-8 mb-2">
              <label class="form-label small mb-1">詳細地址</label>
              <input v-model="form.returnStreetEtc" type="text" class="form-control form-control-sm" placeholder="請輸入詳細地址" required />
            </div>
          </div>
        </div>
      </div>

      <!-- 收件人相關資訊 -->
      <div class="card mb-3">
        <div class="card-header bg-success text-white py-2">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0 h6">收件人資訊</h5>
            <button type="button" class="btn btn-light btn-sm py-0 px-2" @click="fillSameAsUser">
              <i class="bi bi-person-check me-1"></i>同使用者資料
            </button>
          </div>
        </div>
        <div class="card-body py-2">
          <div class="row">
            <div class="col-md-6 mb-2">
              <label class="form-label small mb-1">收件人姓名</label>
              <input v-model="form.returnRecipientName" type="text" class="form-control form-control-sm" placeholder="請輸入收件人姓名" required />
            </div>

            <div class="col-md-6 mb-2">
              <label class="form-label small mb-1">收件人電話</label>
              <input v-model="form.returnRecipientPhone" type="text" class="form-control form-control-sm" placeholder="請輸入收件人電話" required />
            </div>
          </div>
        </div>
      </div>

      <!-- 提交按鈕 -->
      <div class="d-grid">
        <button type="submit" class="btn btn-primary">提交申請</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { taiwanCities } from "@/utils/taiwanAddressData"; // 引入台灣縣市資料

export default {
  data() {
    return {
      form: {
        shopName: "",
        shopCategory: "",
        returnCity: "", // 新增城市欄位
        returnDistrict: "",
        returnZipCode: "",
        returnStreetEtc: "",
        returnRecipientName: "",
        returnRecipientPhone: "",
        description: "",
      },
      selectedCity: "", // 已選擇的城市
      availableDistricts: {}, // 可選擇的區域
      taiwanCities, // 使用引入的台灣縣市資料
      shopCategories: ["服飾", "3C 產品", "食品", "運動用品", "家居用品", "美妝保養"],
      userId: localStorage.getItem("userId"),
      // 使用者個人資料
      userData: {
        userName: "",
        userPhone: ""
      },
      // 預設資料
      defaultInfo: {
        shopName: "選貨小舖",
        shopCategories:"服飾",
        description: "全館商品 #台灣現貨 #快速出貨！\n價格優惠實在 👍\n有任何問題歡迎【聊聊】詢問，客服看到會盡快回覆喔 😉\n祝您購物愉快！",
        city: "高雄市",
        district: "前金區",
        zipCode: "801",
        address: "中正四路211號8樓之1"
      }
    };
  },
  created() {
    // 在組件創建時獲取使用者資料
    this.fetchUserData();
  },
  methods: {
    // 獲取使用者資料
    async fetchUserData() {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        
        const response = await axios.get(`/api/user/${userId}`);
        if (response.data && response.data.success) {
          this.userData.userName = response.data.userDTO.userName || "";
          this.userData.userPhone = response.data.userDTO.phone || "";
        }
      } catch (error) {
        console.error("獲取使用者資料失敗:", error);
      }
    },
    
    // 填入與使用者相同的資料
    fillSameAsUser() {
      this.form.returnRecipientName = this.userData.userName;
      this.form.returnRecipientPhone = this.userData.userPhone;
    },
    
    // 一鍵帶入預設資料
    fillDefaultInfo() {
      // 填入商店資訊
      this.form.shopName = this.defaultInfo.shopName;
      this.form.description = this.defaultInfo.description;
      this.form.shopCategory = this.defaultInfo.shopCategories;
      
      // 填入地址資訊
      this.selectedCity = this.defaultInfo.city;
      this.updateDistricts(); // 更新區域選項
      
      // 設置區域 (需確保updateDistricts後才設置)
      this.$nextTick(() => {
        this.form.returnDistrict = this.defaultInfo.district;
        this.updatePostalCode(); // 更新郵遞區號
        
        // 手動設置郵遞區號，以防updatePostalCode沒有正確設置
        this.form.returnZipCode = this.defaultInfo.zipCode;
        this.form.returnStreetEtc = this.defaultInfo.address;
        
        // 填入收件人資訊
        this.fillSameAsUser();
      });
    },
    
    updateDistricts() {
      // 當選擇城市時，更新區域選項
      this.availableDistricts = this.taiwanCities[this.selectedCity] || {};
      this.form.returnDistrict = "";
      this.form.returnZipCode = "";
      // 同時更新表單中的城市資料
      this.form.returnCity = this.selectedCity;
    },
    
    updatePostalCode() {
      // 當選擇區域時，自動帶入郵遞區號
      this.form.returnZipCode = this.availableDistricts[this.form.returnDistrict] || "";
    },
    
    async submitApplication() {
      try {
        // 確保表單資料完整
        if (!this.selectedCity || !this.form.returnDistrict) {
          Swal.fire({
            icon: "error",
            title: "錯誤",
            text: "請完整填寫地址資訊",
            confirmButtonText: "確定",
          });
          return;
        }

        const response = await axios.post(`/api/shop/application/submit/${this.userId}`, this.form);
        if (response.data.success) {
          Swal.fire({ 
            icon: "success", 
            title: "申請成功", 
            text: response.data.message, 
            confirmButtonText: "確定" 
          }).then(() => {
            this.$router.push("/");
          });
        } else {
          Swal.fire({ icon: "error", title: "申請失敗", text: response.data.message, confirmButtonText: "確定" });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "錯誤",
          text: error.response?.data?.message || error.message,
          confirmButtonText: "確定",
        });
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}

.card-header {
  font-weight: 500;
}

.btn-light {
  background-color: #f8f9fa;
  border-color: #f8f9fa;
}

.btn-light:hover {
  background-color: #e2e6ea;
  border-color: #dae0e5;
}
</style>