<template>
    <div>處理中...</div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  onMounted(() => {
    const params = new URLSearchParams(window.location.search)
    const CVSStoreName = params.get('CVSStoreName')
    const CVSAddress = params.get('CVSAddress')
  
    if (CVSStoreName && CVSAddress) {
      // 存進 localStorage
      localStorage.setItem('ecpay-cvs-selected', JSON.stringify({
        CVSStoreName, CVSAddress
      }))
    }
  
    // 回首頁（或原本地址頁）
    router.replace('/address')
  })
  </script>
  