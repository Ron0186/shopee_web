<template>
    <div>
      <!-- ECPay 門市選擇按鈕 -->
      <form
        id="ecpayForm"
        method="post"
        action="https://logistics-stage.ecpay.com.tw/Express/map"
      >
        <!-- 基本參數 -->
        <input type="hidden" name="MerchantID" value="2000933" />
        <input type="hidden" name="LogisticsType" value="CVS" />
        <input type="hidden" name="LogisticsSubType" value="UNIMART" />
        <input type="hidden" name="IsCollection" value="N" />
        <input
          type="hidden"
          name="ServerReplyURL"
          value="https://seven-schools-visit.loca.lt/api/ecpay/storeInfo"
        />
        <input type="hidden" name="ExtraData" value="123456" />
        <input type="hidden" name="Device" value="0" />
      </form>
  
      <!-- 門市選擇按鈕 -->
      <button @click="selectStore">選擇門市</button>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from "vue";
  
  // 門市選擇功能
  const selectStore = () => {
    document.getElementById("ecpayForm").submit(); // 提交表單
  };
  
  onMounted(() => {
    console.log("✅ 門市選擇 API 已準備完成！");
  });
  </script>
  
  <style scoped>
  button {
    background-color: #04aa6d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #028a5c;
  }
  </style>
  