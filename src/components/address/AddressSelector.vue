<template>
    <div>
        <label>宅配地址：</label>
        <div class="dropdown">
            <select v-model="selectedCounty" @change="updateDistricts" required>
                <option value="">選擇縣市</option>
                <option v-for="(districts, county) in taiwanAddress"
                    :key="county" :value="county">
                    {{ county }}
                </option>
            </select>

            <select v-model="selectedDistrict" @change="updateZipcode"
                v-if="selectedCounty" required>
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
            <input type="text" v-model="address" class="street full-width"
                placeholder="請輸入詳細地址" required />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { taiwanAddress } from '@/assets/taiwanAddress.js';

const props = defineProps({
    modelValue: String
});
const emit = defineEmits(['update:modelValue']);

const selectedCounty = ref('');
const selectedDistrict = ref('');
const selectedZipcode = ref('');
const address = ref('');

// 當父元件傳入值時，自動解析
watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal) parseAddress(newVal);
    },
    { immediate: true }
);

// 組合地址 → 傳回父元件
watch([selectedCounty, selectedDistrict, address], () => {
    if (selectedCounty.value && selectedDistrict.value) {
        emit('update:modelValue', `${selectedCounty.value} ${selectedDistrict.value} ${address.value}`);
    }
});


function updateDistricts() {
    selectedDistrict.value = '';
    selectedZipcode.value = '';
}

function updateZipcode() {
    selectedZipcode.value = taiwanAddress[selectedCounty.value]?.[selectedDistrict.value] || '';
}

function parseAddress(fullAddress) {

    console.log("🚚 解析傳入的 address：", fullAddress); // ✅ 確認有沒有進來

    const parts = fullAddress.split(' ');
    if (parts.length >= 2) {
        selectedCounty.value = parts[0];
        selectedDistrict.value = parts[1];
        address.value = parts.slice(2).join(' ');
        updateZipcode();
        console.log("📍 縣市：", selectedCounty.value);
        console.log("🏘️ 區域：", selectedDistrict.value);
        console.log("📫 地址：", address.value);
    } else {
        console.warn("❗地址格式不符，無法解析");
    }
}
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
</style>