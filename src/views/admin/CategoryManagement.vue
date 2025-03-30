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
                    class="btn btn-primary me-2"
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
                    class="btn btn-primary me-2"
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
        :class="{ 'd-block': dialogVisible, 'd-none': !dialogVisible }"
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

              <!-- 修改這裡：只在新增二級分類時顯示一級分類選擇，編輯時不顯示 -->
              <div v-if="dialogType === 'category2' && !form.id" class="mb-3">
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
              <!-- 顯示關聯的一級分類（編輯時的只讀顯示） -->
              <div v-if="dialogType === 'category2' && form.id" class="mb-3">
                <label class="form-label">關聯的一級分類</label>
                <div class="form-control bg-light">
                  {{ getCategoryName(getCategory1Id()) }}
                </div>
                <small class="text-muted"
                  >* 一旦建立關聯，不能更改。如需更改請刪除後重新創建。</small
                >
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
import axios from "@/plugins/axios";
import Swal from "sweetalert2";

// 定義類型接口
const Category1 = {
  id: Number,
  name: String,
  category2List: Array,
};

const Category2 = {
  id: Number,
  name: String,
  category1List: Array,
};

// 狀態變數
const category1List = ref([]);
const category2List = ref([]);
const selectedCategory1 = ref("");
const dialogVisible = ref(false);
const dialogTitle = ref("");
const dialogType = ref("");
const form = ref({ id: null, name: "", category1Id: null });

// 獲取一級分類名稱的方法
const getCategoryName = (id) => {
  if (!id) return "無關聯";
  const category = category1List.value.find((cat) => cat.id === parseInt(id));
  return category ? category.name : "未知分類";
};

// 從表單中獲取一級分類ID的方法
const getCategory1Id = () => {
  // 先檢查是否有 category1Id
  if (form.value.category1Id) {
    return form.value.category1Id;
  }

  // 如果沒有直接的 category1Id，檢查 category1Ids 陣列
  if (
    Array.isArray(form.value.category1Ids) &&
    form.value.category1Ids.length > 0
  ) {
    return form.value.category1Ids[0];
  }

  // 如果還是沒有，檢查 category1List 屬性 (某些 API 可能使用此格式)
  if (
    Array.isArray(form.value.category1List) &&
    form.value.category1List.length > 0
  ) {
    return form.value.category1List[0].id;
  }

  // 都沒有找到，返回 null
  return null;
};

// 獲取一級分類
const fetchCategory1 = async () => {
  try {
    const response = await axios.get("/api/category1/all");
    category1List.value = response.data;
  } catch (error) {
    console.error("獲取一級分類失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: "獲取一級分類失敗",
      icon: "error",
    });
  }
};

// 根據一級分類ID獲取二級分類
const fetchCategory2 = async () => {
  if (!selectedCategory1.value) return;

  try {
    const response = await axios.get(
      `/api/category2/byC1?category1Id=${selectedCategory1.value}`
    );
    category2List.value = response.data;
  } catch (error) {
    console.error("獲取二級分類失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: "獲取二級分類失敗",
      icon: "error",
    });
  }
};

// 打開對話框
const openDialog = (type, data = null) => {
  dialogType.value = type;
  dialogTitle.value = data ? "編輯分類" : "新增分類";
  dialogVisible.value = true;

  console.log("openDialog 被調用", type, data); // 新增日誌

  if (data) {
    // 編輯現有分類
    console.log("編輯資料:", data); // 新增日誌
    form.value = { ...data };

    // 對於二級分類，確保保留category1Id或從category1Ids中獲取它
    if (type === "category2") {
      if (
        !form.value.category1Id &&
        Array.isArray(form.value.category1Ids) &&
        form.value.category1Ids.length > 0
      ) {
        form.value.category1Id = form.value.category1Ids[0];
      }
      // 如果兩者都沒有，嘗試從後端重新獲取該分類的詳細資訊
      if (!form.value.category1Id && !Array.isArray(form.value.category1Ids)) {
        // 可以選擇在這裡添加額外的API調用來獲取詳細資訊
        console.log("警告: 無法確定二級分類的關聯一級分類");
      }
    }
  } else {
    // 新增分類
    if (type === "category2") {
      form.value = {
        id: null,
        name: "",
        category1Id: selectedCategory1.value || null,
        category1Ids: selectedCategory1.value
          ? [parseInt(selectedCategory1.value)]
          : [], // 使用陣列
      };
    } else {
      // 一級分類
      form.value = { id: null, name: "" };
    }
  }

  console.log("表單數據準備完成:", form.value); // 新增日誌
};

// 保存分類
const saveCategory = async () => {
  try {
    if (!form.value.name) {
      Swal.fire({
        title: "錯誤",
        text: "請輸入分類名稱",
        icon: "warning",
      });
      return;
    }

    if (dialogType.value === "category2" && !form.value.id) {
      // 只在新增二級分類時檢查
      if (!form.value.category1Id) {
        Swal.fire({
          title: "錯誤",
          text: "請選擇一級分類",
          icon: "warning",
        });
        return;
      }

      // 確保 category1Ids 是包含選擇的 category1Id 的陣列
      form.value.category1Ids = [parseInt(form.value.category1Id)];
    } else if (dialogType.value === "category2" && form.value.id) {
      // 編輯二級分類時，保留原有關聯
      const category1Id = getCategory1Id();
      if (category1Id) {
        form.value.category1Id = category1Id;
        form.value.category1Ids = [parseInt(category1Id)];
      }
    }

    const url = form.value.id
      ? `/api/${dialogType.value}/${form.value.id}`
      : `/api/${dialogType.value}`;
    const method = form.value.id ? "put" : "post";

    console.log(`準備發送 ${method.toUpperCase()} 請求到 ${url}`, form.value);
    await axios[method](url, form.value);

    Swal.fire({
      title: "成功",
      text: "操作成功",
      icon: "success",
    });

    dialogVisible.value = false;
    await fetchCategory1();

    if (dialogType.value === "category2" || selectedCategory1.value) {
      await fetchCategory2();
    }
  } catch (error) {
    console.error("保存分類失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "保存分類失敗",
      icon: "error",
    });
  }
};

// 刪除分類
const deleteCategory = async (type, id) => {
  try {
    const result = await Swal.fire({
      title: "確定刪除？",
      text: "刪除後將無法恢復，且相關商品也會被刪除！",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      await axios.delete(`/api/${type}/${id}`);

      Swal.fire({
        title: "成功",
        text: "刪除成功",
        icon: "success",
      });

      await fetchCategory1();

      if (type === "category2" || selectedCategory1.value) {
        await fetchCategory2();
      }
    }
  } catch (error) {
    console.error("刪除分類失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: error.response?.data?.message || "刪除分類失敗",
      icon: "error",
    });
  }
};

// 關閉對話框
const closeDialog = () => {
  dialogVisible.value = false;
};

// 初始化
onMounted(() => {
  fetchCategory1();
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.table {
  margin-top: 20px;
}

button {
  margin-right: 5px;
}
</style>
