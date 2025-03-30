<template>
  <div class="mb-3">

    <button
      class="btn btn-success me-2"
      :class="{ active: showApproved }"
      @click="switchView('approved')" 
    >
      已核准
    </button>
    <button
      class="btn btn-primary me-2"
      :class="{ active: showPending }"
      @click="switchView('pending')"  
    >
      待審核
    </button>

    <button
      class="btn btn-secondary"
      :class="{ active: showRejected }"
      @click="switchView('rejected')" 
    >
      已拒絕
    </button>
  </div>
</template>

<script>
export default {
  props: {
    showPending: {
      type: Boolean,
      required: true,
    },
    showApproved: {
      type: Boolean,
      required: true,
    },
    showRejected: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["updateView"], // 聲明 emitted 事件
  methods:{
    switchView(view){
      this.$emit("updateView", view)
    }
  }
};
</script>

<style scoped>
.active {
  font-weight: bold;
}
</style>