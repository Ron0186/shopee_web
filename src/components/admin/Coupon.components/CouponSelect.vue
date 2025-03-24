<template>
    <span>
        <span v-if="total === 0">查無資料</span>
        <span v-else>查到 {{ total }} 筆資料</span>
        ，每頁顯示
        <select :value="modelValue" @change="dochange($event)">
            <option v-for="item in options" :key="item" :value="item">{{ item }}</option>
        </select>
        筆
    </span>
</template>

<script setup>
const props = defineProps(["total", "options", "modelValue"]);
const emits = defineEmits(["update:modelValue", "change"]);

function dochange(event) {
    const value = Number(event.target.value);
    emits("update:modelValue", value);
    emits("change");
}
</script>
