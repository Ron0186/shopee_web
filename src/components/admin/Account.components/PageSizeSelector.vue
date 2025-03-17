<template>
    <select :value="modelValue" @change="handleChange">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="30">30</option>
    </select>
  </template>
  
  <script setup>
  const props = defineProps({
    modelValue: {
      type: [String, Number],
      required: true,
    },
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const handleChange = (event) => {
    emit('update:modelValue', event.target.value);
  };
  </script>