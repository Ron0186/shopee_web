<template>
    <div>
        <label>宅配地址：</label>
        <div class="dropdown">
            <select v-model="selectedCounty" @change="updateDistricts">
                <option value="">選擇縣市</option>
                <option v-for="(districts, county) in taiwanAddress"
                    :key="county" :value="county">
                    {{ county }}
                </option>
            </select>

            <select v-model="selectedDistrict" @change="updateZipcode">
                <option value="">選擇鄉鎮市區</option>
                <option
                    v-for="(zipcode, district) in taiwanAddress[selectedCounty]"
                    :key="district" :value="district">
                    {{ district }}
                </option>
            </select>

            <input type="text" v-model="selectedZipcode" class="zipcode_box"
                placeholder="郵遞區號" readonly />
        </div>

        <div>
            <input type="text" required v-model="address"
                class="street full-width" placeholder="請輸入地址" />
        </div>

        <div>7-11超取</div>
        <div>
            <label>選擇超商門市：</label>
            <button @click="openStorePicker" class="store-btn">選擇 7-11
                門市</button>

            <div v-if="selectedStore">
                <p><strong>門市名稱：</strong>{{ selectedStore.StoreName }}</p>
                <p><strong>門市地址：</strong>{{ selectedStore.StoreAddress }}</p>
                <p><strong>門市編號：</strong>{{ selectedStore.StoreID }}</p>
            </div>
        </div>


        <button @click="openStorePicker">選擇超商門市</button>
    </div>
</template>

<script>
import { ref } from "vue";
import { taiwanAddress } from "@/assets/taiwanAddress.js";

export default {
    props: {
        modelValue: String, // Vue 3 v-model 需要的 prop
    },
    emits: ["update:modelValue"], // 定義 v-model 的事件
    data() {
        return {
            selectedCounty: "",
            selectedDistrict: "",
            selectedZipcode: "",
            address: this.modelValue || "",
            taiwanAddress,
        };
    },
    watch: {
        address(newValue) {
            this.$emit("update:modelValue", `${this.selectedCounty} ${this.selectedDistrict} ${newValue}`);
        },
    },
    mounted() {
        window.addEventListener("storage", this.getStoreSelection);
    },
    beforeUnmount() {
        window.removeEventListener("storage", this.getStoreSelection);
    },
    methods: {
        updateDistricts() {
            this.selectedDistrict = "";
            this.selectedZipcode = "";
        },
        updateZipcode() {
            this.selectedZipcode = this.taiwanAddress[this.selectedCounty]?.[this.selectedDistrict] || "";
        },
    },
    props: ["onStoreSelected"],  // 用於傳遞選擇的門市資訊
    setup(props) {
        const selectedStore = ref(null);

        const openStorePicker = () => {
            const merchantId = "2000132"; // 測試用
            const url = `https://logistics-stage.ecpay.com.tw/Express/map?MerchantID=${merchantId}&LogisticsType=CVS&LogisticsSubType=UNIMART&IsCollection=N`;

            // 打開新視窗選擇門市
            const popup = window.open(url, "storePicker", "width=800,height=600");

            // 監聽 localStorage 變化（當綠界回傳選擇的門市時）
            window.addEventListener("storage", () => {
                const storeInfo = localStorage.getItem("selectedStore");
                if (storeInfo) {
                    selectedStore.value = JSON.parse(storeInfo);
                    localStorage.removeItem("selectedStore");

                    // 傳遞門市資訊給父元件
                    if (props.onStoreSelected) {
                        props.onStoreSelected(selectedStore.value);
                    }
                }
            });
        };

        return { selectedStore, openStorePicker };
    },
};
</script>

<style scoped>
.dropdown {
    display: flex;
    gap: 5px;
}

.street {
    flex-grow: 1;
}

.zipcode_box {
    width: 75%;
}

.full-width {
    display: block;
    width: 100%;
    margin-top: 5px;
}

.store-btn {
    background-color: #007aff;
    color: white;
    padding: 8px 16px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}
</style>