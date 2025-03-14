<template>
    <div class="cart-container">
      <h1>🛒 購物車</h1>
      <div v-if="cart.length === 0">你的購物車是空的</div>
      <div v-else>
        <table>
          <thead>
            <tr>
              <th>商品名稱</th>
              <th>數量</th>
              <th>單價</th>
              <th>小計</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cart" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.price.toLocaleString() }} 元</td>
              <td>{{ (item.quantity * item.price).toLocaleString() }} 元</td>
            </tr>
          </tbody>
        </table>
        <h3>總計：{{ totalPrice.toLocaleString() }} 元</h3>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        cart: [],
      };
    },
    computed: {
      totalPrice() {
        return this.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
      },
    },
    mounted() {
      this.fetchCart();
    },
    methods: {
      async fetchCart() {
        try {
          const userId = 1; // 這邊先假設 userId = 1
          const response = await axios.get(`http://localhost:8081/api/cart/${userId}`);
          this.cart = response.data;
        } catch (error) {
          console.error("獲取購物車資料失敗", error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .cart-container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
  }
  </style>
  