<template>
    <div class="container-fruid ">
        <Search />
    </div>
    <div class="container ">
        <div class="row ">
            <div class="col-4 ">
                <Sidebars />
            </div>
            <div class="col-6 ">
                <Content />
            </div>
        </div>
    </div>
</template>

<script setup>

import Search from '@/components/Search.vue';
import Sidebars from '@/components/Sidebars.vue';
import Content from '@/components/Content.vue';



</script>
<style scoped>
.row {
    margin-left: 5%;

}

.col-4 {


    margin-top: 30px;
    position: relative;
}

.col-6 {
    margin-top: 30px;

}
</style>