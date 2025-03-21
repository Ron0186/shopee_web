<template>
    <tr>
      <td>{{ app.applicationId }}</td>
      <td>{{ app.userId }}</td>
      <td>{{ app.userName }}</td>
      <td>{{ app.shopName }}</td>
      <td>{{ app.shopCategory }}</td>
      <td>{{ app.description }}</td>
      <td>{{ new Date(app.createdAt).toLocaleString() }}</td>
      <td>
        <button
          class="btn btn-success btn-sm me-2"
          @click="approve(app.applicationId)"
        >
          通過
        </button>
        <button class="btn btn-danger btn-sm" @click="reject(app.applicationId)">
          拒絕
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
    emits: ["approve", "reject"],
    methods: {
      approve(applicationId) {
        this.$emit("approve", applicationId);
      },
      reject(applicationId) {
        this.$emit("reject", applicationId);
      },
    },
  };
  </script>