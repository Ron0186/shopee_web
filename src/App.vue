<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <!-- 🛠️ 新增的導航列 -->
  <nav>
    <router-link to="/">🏠 首頁</router-link> |
    <router-link to="/cart">🛒 購物車</router-link>
  </nav>

  <!-- 顯示路由內容 -->
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 16px;
  text-align: center;
  margin: 20px 0;
}

nav a {
  padding: 8px 16px;
  text-decoration: none;
  color: #42b983;
}

nav a.router-link-exact-active {
  font-weight: bold;
  color: #35495e;
}

nav a:hover {
  text-decoration: underline;
}
</style>
