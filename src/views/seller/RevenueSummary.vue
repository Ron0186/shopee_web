<!-- src/views/seller/RevenueSummary.vue -->
<template>
    <div class="revenue-page">
      <RevenueSummary />
      <button @click="goBack" class="back-btn">返回</button>
    </div>
  </template>
  
  <script setup>
  import RevenueSummary from '@/components/revenue/RevenueSummary.vue'
    import { useRouter } from 'vue-router'

    const router = useRouter()
    const goBack = () => router.go(-1)
  </script>
  
  <style scoped>
  .revenue-page {
    padding: 30px;
    max-width: 900px;
    margin: auto;
  }

  .back-btn {
    margin-top: 20px;
    padding: 8px 15px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: block;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
  }
  </style>
  