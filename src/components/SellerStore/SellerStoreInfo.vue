<template>
    <div class="container mt-4">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">{{ shop.name }}</h2>
          <p class="card-text">{{ shop.description }}</p>
          <small class="text-muted">創建日期：{{ formatDate(shop.created_at) }}</small>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      shop: Object,
    },
    methods: {
      formatDate(date) {
        return new Date(date).toLocaleDateString();
      },
    },
  };
  </script>
  