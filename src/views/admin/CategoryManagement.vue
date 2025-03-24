<template>
  <div>
    <h2>分類管理</h2>
    <div class="container">
      <!-- 一級分類 -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">一級分類</h5>
          <button class="btn btn-primary" @click="openDialog('category1')">
            新增一級分類
          </button>
          <table class="table mt-3">
            <thead>
              <tr>
                <th>ID</th>
                <th>分類名稱</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in category1List" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td>
                  <button
                    class="btn btn-primary"
                    @click="openDialog('category1', item)"
                  >
                    編輯
                  </button>
                  <button
                    class="btn btn-danger"
                    @click="deleteCategory('category1', item.id)"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 二級分類 -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">二級分類</h5>
          <select
            class="form-select"
            v-model="selectedCategory1"
            @change="fetchCategory2"
          >
            <option value="" disabled>選擇一級分類</option>
            <option
              v-for="item in category1List"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </select>
          <button class="btn btn-primary mt-3" @click="openDialog('category2')">
            新增二級分類
          </button>
          <table class="table mt-3">
            <thead>
              <tr>
                <th>ID</th>
                <th>分類名稱</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in category2List" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td>
                  <button
                    class="btn btn-primary"
                    @click="openDialog('category2', item)"
                  >
                    編輯
                  </button>
                  <button
                    class="btn btn-danger"
                    @click="deleteCategory('category2', item.id)"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 新增/編輯分類 Dialog -->
      <div
        class="modal"
        tabindex="-1"
        v-show="dialogVisible"
        @click="closeDialog"
      >
        <div class="modal-dialog" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ dialogTitle }}</h5>
              <button
                type="button"
                class="btn-close"
                @click="closeDialog"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="categoryName" class="form-label">分類名稱</label>
                <input
                  type="text"
                  class="form-control"
                  id="categoryName"
                  v-model="form.name"
                />
              </div>
              <div v-if="dialogType === 'category2'" class="mb-3">
                <label for="category1Id" class="form-label">對應一級分類</label>
                <select
                  class="form-select"
                  id="category1Id"
                  v-model="form.category1Id"
                >
                  <option value="" disabled>選擇一級分類</option>
                  <option
                    v-for="item in category1List"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeDialog"
              >
                關閉
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveCategory"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const category1List = ref([]);
const category2List = ref([]);
const selectedCategory1 = ref(null);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const dialogType = ref("");
const form = ref({ id: null, name: "", category1Id: null });

const fetchCategory1 = async () => {
  const res = await axios.get("/api/category1/all");
  category1List.value = res.data;
};

const fetchCategory2 = async () => {
  if (!selectedCategory1.value) return;
  const res = await axios.get(
    `/api/category2/byC1?category1Id=${selectedCategory1.value}`
  );
  category2List.value = res.data;
};

const openDialog = (type, data = null) => {
  dialogType.value = type;
  dialogTitle.value = data ? "編輯分類" : "新增分類";
  dialogVisible.value = true;
  form.value = data ? { ...data } : { id: null, name: "", category1Id: null };
};

const saveCategory = async () => {
  const url = form.value.id
    ? `/api/${dialogType.value}/${form.value.id}`
    : `/api/${dialogType.value}`;
  const method = form.value.id ? "put" : "post";
  await axios[method](url, form.value);
  ElMessage.success("操作成功");
  dialogVisible.value = false;
  fetchCategory1();
  fetchCategory2();
};

const deleteCategory = async (type, id) => {
  await ElMessageBox.confirm("確定刪除？", "警告", { type: "warning" });
  await axios.delete(`/api/${type}/${id}`);
  ElMessage.success("刪除成功");
  fetchCategory1();
  fetchCategory2();
};

const closeDialog = () => {
  dialogVisible.value = false;
};

onMounted(fetchCategory1);
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.modal {
  display: block;
}
</style>
