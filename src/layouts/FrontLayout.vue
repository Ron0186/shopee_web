<script setup>
import { ref } from "vue";
</script>

<template>
  <div class="">
    <header>
      <img
        alt="Vue logo"
        class="logo"
        src="@/assets/logo.svg"
        width="125"
        height="125"
      />

      <div class="wrapper">
        <!-- <HelloWorld msg="You did it!" />  -->

        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>

          <RouterLink to="/admin">Admin</RouterLink>
        </nav>
      </div>
    </header>
    <RouterView />
  </div>
</template>
