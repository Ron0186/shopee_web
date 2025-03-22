<template>
    <tr>
      <td>{{ app.applicationId }}</td>
      <td>{{ app.userId }}</td>
      <td>{{ app.userName }}</td>
      <td>{{ app.shopName }}</td>
      <td>{{ app.shopCategory }}</td>
      <td>{{ app.description }}</td>
      <td>{{ new Date(app.createdAt).toLocaleString() }}</td>
      <td>{{ app.adminComment }}</td>
      <td>{{ app.reviewer }}</td>
      <td>{{ app.reviewedAt ? new Date(app.reviewedAt).toLocaleString() : "" }}</td>
      <td>
        <button class="btn btn-success btn-sm" @click="approve(app.applicationId)">
          通過
        </button>
      </td>
    </tr>
  </template>
  
  <script>
  export default {
    props: {
      app: {
        type: Object,
        required: true,
      },
    },
    emits: ["approve"],
    methods: {
      approve(applicationId) {
        this.$emit("approve", applicationId);
      },
    },
  };
  </script>