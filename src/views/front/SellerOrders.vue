<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h2 class="mb-0 text-center">賣家訂單管理</h2>
          </div>
          <div class="card-body">
            <!-- 訂單篩選 -->
            <div class="row mb-3">
              <div class="col-md-6"></div>
            </div>
            <!-- 新增付款狀態與運送狀態 -->
            <div class="row mb-3">
              <div class="col-md-4">
                <div class="input-group">
                  <span class="input-group-text">付款狀態</span>
                  <select
                    class="form-select"
                    v-model="filterCriteria.paymentStatus"
                  >
                    <option value="all">所有狀態</option>
                    <option value="未付款">未付款</option>
                    <option value="處理中">處理中</option>
                    <option value="已付款">已付款</option>
                    <option value="已退款">已退款</option>
                  </select>
                </div>
              </div>
              <div class="col-md-4">
                <div class="input-group">
                  <span class="input-group-text">運送狀態</span>
                  <select
                    class="form-select"
                    v-model="filterCriteria.shipmentStatus"
                  >
                    <option value="all">所有狀態</option>
                    <option value="未出貨">未出貨</option>
                    <option value="已出貨">已出貨</option>
                    <option value="運送中">運送中</option>
                    <option value="已送達">已送達</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 錯誤信息顯示 -->
            <div v-if="error" class="alert alert-danger" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
            </div>

            <!-- 加載中提示 -->
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加載中...</span>
              </div>
              <p class="mt-2">加載中...</p>
            </div>

            <!-- 訂單表格 -->
            <div v-if="!loading && !error" class="table-responsive">
              <table class="table table-striped table-hover">
                <thead class="table-light">
                  <tr>
                    <th @click="sortById" style="cursor: pointer">
                      訂單編號
                      <i
                        class="bi"
                        :class="sortAscending ? 'bi-sort-up' : 'bi-sort-down'"
                      ></i>
                    </th>
                    <th>用戶</th>
                    <th>金額 (NT$)</th>
                    <th>日期</th>
                    <th>狀態</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in sortedOrders" :key="order.orderId">
                    <td>
                      <span class="badge bg-secondary"
                        >#{{ order.orderId }}</span
                      >
                    </td>
                    <td>
                      <div>{{ order.userName }}</div>
                      <small class="text-muted">{{ order.userEmail }}</small>
                    </td>
                    <td>${{ order.totalPrice?.toLocaleString() }}</td>
                    <td>
                      <small>{{ formatDate(order.createdAt) }}</small>
                    </td>
                    <td>
                      <span
                        class="badge px-3 py-2 fw-semibold"
                        :class="{
                          'bg-secondary text-white': order.status === '未付款',
                          'bg-warning text-dark': order.status === '處理中',
                          'bg-success text-white':
                            order.status === '已完成' ||
                            order.status === '已付款' ||
                            order.status === '已出貨',
                          'bg-danger text-white': order.status === '已取消',
                        }"
                      >
                        {{ order.status || "未提供" }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <button
                          class="btn btn-primary d-flex align-items-center"
                          @click="viewOrder(order)"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="me-1"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"
                            />
                            <path
                              d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"
                            />
                          </svg>
                          <span>查看</span>
                        </button>
                        <button
                          class="btn btn-warning d-flex align-items-center"
                          @click="openEditModal(order)"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="me-1"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"
                            />
                          </svg>
                          <span>編輯</span>
                        </button>
                        <button
                          class="btn btn-danger d-flex align-items-center"
                          @click="deleteOrder(order.orderId)"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="me-1"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
                            />
                            <path
                              fill-rule="evenodd"
                              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                            />
                          </svg>
                          <span>刪除</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 無訂單時的提示 -->
            <div
              v-if="!loading && !error && sortedOrders.length === 0"
              class="text-center py-4"
            >
              <i class="bi bi-inbox display-1 text-secondary"></i>
              <p class="mt-3">目前沒有符合條件的訂單</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 訂單詳情 (Bootstrap Modal) - 使用 Teleport 確保正確渲染 -->
    <Teleport to="body">
      <div
        v-if="showDetailModal"
        class="modal fade show"
        tabindex="-1"
        style="display: block"
        @click="closeDetailModal"
      >
        <div class="modal-dialog modal-lg" @click.stop>
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                訂單 #{{ selectedOrder.orderId }} 詳情
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="closeDetailModal"
              ></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <h6 class="fw-bold">基本資訊</h6>
                  <table class="table table-bordered">
                    <tr>
                      <th class="bg-light">訂單編號</th>
                      <td>#{{ selectedOrder.orderId }}</td>
                    </tr>
                    <tr>
                      <th class="bg-light">訂單日期</th>
                      <td>{{ formatDate(selectedOrder.createdAt) }}</td>
                    </tr>
                    <tr>
                      <th class="bg-light">更新日期</th>
                      <td>{{ formatDate(selectedOrder.updatedAt) }}</td>
                    </tr>
                    <tr>
                      <th class="bg-light">訂單狀態</th>
                      <td>
                        <span
                          class="badge"
                          :class="{
                            'bg-warning text-dark':
                              selectedOrder.status === '處理中',
                            'bg-success': selectedOrder.status === '已完成',
                            'bg-danger': selectedOrder.status === '已取消',
                          }"
                        >
                          {{ selectedOrder.status }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th class="bg-light">總金額</th>
                      <td>${{ selectedOrder.totalPrice?.toLocaleString() }}</td>
                    </tr>
                  </table>
                </div>

                <div class="col-md-6">
                  <h6 class="fw-bold">買家資訊</h6>
                  <table class="table table-bordered">
                    <tr>
                      <th class="bg-light">買家ID</th>
                      <td>{{ selectedOrder.userId }}</td>
                    </tr>
                    <tr>
                      <th class="bg-light">買家名稱</th>
                      <td>{{ selectedOrder.userName }}</td>
                    </tr>
                    <tr>
                      <th class="bg-light">電子郵件</th>
                      <td>{{ selectedOrder.userEmail }}</td>
                    </tr>
                    <tr>
                      <th class="bg-light">電話</th>
                      <td>{{ selectedOrder.userPhone }}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-6">
                  <h6 class="fw-bold">帳單地址</h6>
                  <p class="border p-2 rounded">
                    {{ selectedOrder.billingAddress || "未提供" }}
                  </p>
                </div>
                <div class="col-md-6">
                  <h6 class="fw-bold">收貨地址</h6>
                  <p class="border p-2 rounded">
                    {{ selectedOrder.shippingAddress || "未提供" }}
                  </p>
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-6">
                  <h6 class="fw-bold">付款資訊</h6>
                  <table class="table table-bordered">
                    <tr>
                      <th class="bg-light">付款方式</th>
                      <td>
                        {{ formatPaymentMethod(selectedOrder.paymentMethod) }}
                      </td>
                    </tr>
                    <tr>
                      <th class="bg-light">付款狀態</th>
                      <td>
                        {{ formatPaymentStatus(selectedOrder.paymentStatus) }}
                      </td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-6">
                  <h6 class="fw-bold">運送資訊</h6>
                  <table class="table table-bordered">
                    <tr>
                      <th class="bg-light">運送方式</th>
                      <td>{{ selectedOrder.shipmentMethod || "未提供" }}</td>
                    </tr>
                    <tr>
                      <th class="bg-light">運送狀態</th>
                      <td>{{ selectedOrder.shipmentStatus || "未提供" }}</td>
                    </tr>
                    <tr>
                      <th class="bg-light">追蹤編號</th>
                      <td>{{ selectedOrder.trackingNumber || "未提供" }}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <h6 class="fw-bold mt-3">訂單商品</h6>
              <div class="table-responsive">
                <table class="table table-striped table-bordered">
                  <thead class="bg-light">
                    <tr>
                      <th>商品圖片</th>
                      <th>商品名稱</th>
                      <th>單價</th>
                      <th>數量</th>
                      <th>小計</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-if="
                        selectedOrder.items && selectedOrder.items.length > 0
                      "
                      v-for="item in selectedOrder.items"
                      :key="item.productName"
                    >
                      <td style="width: 80px">
                        <img
                          :src="getProductImageUrl(item)"
                          :alt="item.productName"
                          style="
                            width: 60px;
                            height: 60px;
                            object-fit: cover;
                            border-radius: 4px;
                          "
                        />
                      </td>
                      <td>{{ item.productName }}</td>
                      <td>${{ item.unitPrice?.toLocaleString() }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>
                        ${{
                          (item.unitPrice * item.quantity)?.toLocaleString()
                        }}
                      </td>
                    </tr>
                    <tr
                      v-if="
                        !selectedOrder.items || selectedOrder.items.length === 0
                      "
                    >
                      <td colspan="5" class="text-center">沒有商品資訊</td>
                    </tr>
                  </tbody>
                  <tfoot class="table-light">
                    <tr>
                      <th colspan="4" class="text-end">總計:</th>
                      <th>${{ selectedOrder.totalPrice?.toLocaleString() }}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeDetailModal"
              >
                關閉
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="openEditModal(selectedOrder)"
              >
                編輯訂單
              </button>
            </div>
          </div>
        </div>
        <div class="modal-backdrop fade show"></div>
      </div>
    </Teleport>

    <!-- 編輯訂單模態框 -->
    <Teleport to="body">
      <div
        v-if="showEditModal"
        class="modal fade show"
        tabindex="-1"
        style="display: block"
        @click="closeEditModal"
      >
        <div class="modal-dialog modal-lg" @click.stop>
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">編輯訂單 #{{ editingOrder.orderId }}</h5>
              <button
                type="button"
                class="btn-close"
                @click="closeEditModal"
              ></button>
            </div>
            <div class="modal-body">
              <!-- 錯誤信息顯示 -->
              <div v-if="editError" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i
                >{{ editError }}
              </div>

              <!-- 成功信息顯示 -->
              <div
                v-if="successMessage"
                class="alert alert-success"
                role="alert"
              >
                <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
              </div>

              <!-- 編輯表單 -->
              <form @submit.prevent="saveOrder">
                <div class="row">
                  <!-- 運送資訊 -->
                  <div class="col-md-6 mb-4">
                    <div class="card h-100">
                      <div class="card-header bg-light">
                        <h5 class="mb-0">運送資訊</h5>
                      </div>
                      <div class="card-body">
                        <div class="mb-3">
                          <label for="shipmentMethod" class="form-label"
                            >運送方式</label
                          >
                          <select
                            id="shipmentMethod"
                            class="form-select"
                            v-model="editingOrder.shipmentMethod"
                          >
                            <option value="宅配">宅配</option>
                            <option value="超商取貨">超商取貨</option>
                            <option value="國際快遞">國際快遞</option>
                          </select>
                        </div>

                        <div class="mb-3">
                          <label for="shipmentStatus" class="form-label"
                            >運送狀態</label
                          >
                          <select
                            id="shipmentStatus"
                            class="form-select"
                            v-model="editingOrder.shipmentStatus"
                          >
                            <option value="未出貨">未出貨</option>
                            <option value="已出貨">已出貨</option>
                            <option value="運送中">運送中</option>
                            <option value="已送達">已送達</option>
                          </select>
                        </div>

                        <div class="mb-3">
                          <label for="trackingNumber" class="form-label"
                            >追蹤編號</label
                          >
                          <input
                            type="text"
                            class="form-control"
                            id="trackingNumber"
                            v-model="editingOrder.trackingNumber"
                            placeholder="請輸入追蹤編號"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 付款資訊 -->
                  <div class="col-md-6 mb-4">
                    <div class="card h-100">
                      <div class="card-header bg-light">
                        <h5 class="mb-0">付款資訊</h5>
                      </div>
                      <div class="card-body">
                        <div class="mb-3">
                          <label for="paymentMethod" class="form-label"
                            >付款方式</label
                          >
                          <select
                            id="paymentMethod"
                            class="form-select"
                            v-model="editingOrder.paymentMethod"
                          >
                            <option value="信用卡">信用卡</option>
                            <option value="銀行轉帳">銀行轉帳</option>
                            <option value="超商付款">超商付款</option>
                            <option value="貨到付款">貨到付款</option>
                          </select>
                        </div>

                        <div class="mb-3">
                          <label for="paymentStatus" class="form-label"
                            >付款狀態</label
                          >
                          <select
                            id="paymentStatus"
                            class="form-select"
                            v-model="editingOrder.paymentStatus"
                          >
                            <option value="未付款">未付款</option>
                            <option value="處理中">處理中</option>
                            <option value="已付款">已付款</option>
                            <option value="已退款">已退款</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 帳單地址 -->
                  <div class="col-md-6 mb-4">
                    <div class="card h-100">
                      <div class="card-header bg-light">
                        <h5 class="mb-0">帳單地址</h5>
                      </div>
                      <div class="card-body">
                        <div class="mb-3">
                          <label for="billingAddress" class="form-label"
                            >地址</label
                          >
                          <input
                            type="text"
                            class="form-control"
                            id="billingAddress"
                            v-model="editingOrder.billingAddress"
                          />
                        </div>

                        <div class="mb-3">
                          <label for="billingRecipient" class="form-label"
                            >收件人</label
                          >
                          <input
                            type="text"
                            class="form-control"
                            id="billingRecipient"
                            v-model="editingOrder.billingRecipient"
                          />
                        </div>

                        <div class="mb-3">
                          <label for="billingPhone" class="form-label"
                            >電話</label
                          >
                          <input
                            type="text"
                            class="form-control"
                            id="billingPhone"
                            v-model="editingOrder.billingPhone"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 收貨地址 -->
                  <div class="col-md-6 mb-4">
                    <div class="card h-100">
                      <div class="card-header bg-light">
                        <h5 class="mb-0">收貨地址</h5>
                      </div>
                      <div class="card-body">
                        <div class="mb-3">
                          <label for="shippingAddress" class="form-label"
                            >地址</label
                          >
                          <input
                            type="text"
                            class="form-control"
                            id="shippingAddress"
                            v-model="editingOrder.shippingAddress"
                          />
                        </div>

                        <div class="mb-3">
                          <label for="shippingRecipient" class="form-label"
                            >收件人</label
                          >
                          <input
                            type="text"
                            class="form-control"
                            id="shippingRecipient"
                            v-model="editingOrder.shippingRecipient"
                          />
                        </div>

                        <div class="mb-3">
                          <label for="shippingPhone" class="form-label"
                            >電話</label
                          >
                          <input
                            type="text"
                            class="form-control"
                            id="shippingPhone"
                            v-model="editingOrder.shippingPhone"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="closeEditModal"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="isSaving"
                  >
                    <span
                      v-if="isSaving"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {{ isSaving ? "保存中..." : "保存更新" }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="modal-backdrop fade show"></div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import axios from "@/plugins/axios";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
// 檢查大寫 SELLER 角色
const isSeller = computed(() => {
  console.log("當前角色:", userStore.roles);
  return userStore.roles?.includes("SELLER");
});
const formatPaymentMethod = (method) => {
  switch (method) {
    case "CASH_ON_DELIVERY":
    case "貨到付款":
      return "貨到付款";
    case "CREDIT_CARD":
    case "CREDIT":
    case "信用卡":
      return "信用卡";
    case "BANK_TRANSFER":
    case "銀行轉帳":
      return "銀行轉帳";
    case "CVS":
    case "超商付款":
      return "超商付款";
    case "":
    case null:
    case undefined:
      return "未提供";
    default:
      return method;
  }
};
const paymentMethodMap = {
  CASH_ON_DELIVERY: "貨到付款",
  CREDIT_CARD: "信用卡",
  CREDIT: "信用卡",
  BANK_TRANSFER: "銀行轉帳",
  CVS: "超商付款",
};

const formatPaymentStatus = (status) => {
  return paymentStatusMap[status] || status || "未提供";
};
const paymentStatusMap = {
  PAID: "已付款",
  UNPAID: "未付款",
  REFUNDED: "已退款",
  PROCESSING: "處理中",
  "": "未提供",
};

const orders = ref([]);
const selectedOrder = ref({});
const showDetailModal = ref(false);
const showEditModal = ref(false);
const filterCriteria = ref({
  status: "all",
  paymentStatus: "all", // ✅ 新增
  shipmentStatus: "all", // ✅ 新增
});
const sortAscending = ref(true);
const loading = ref(true);
const error = ref(null);
const editError = ref(null);
const successMessage = ref(null);
const isSaving = ref(false);

// 編輯訂單數據
const editingOrder = reactive({
  orderId: null,
  // 運送資訊
  shipmentMethod: "宅配",
  shipmentStatus: "未出貨",
  trackingNumber: "未提供",

  // 付款資訊
  paymentMethod: "信用卡",
  paymentStatus: "未付款",

  // 帳單地址相關
  billingAddress: "",
  billingRecipient: "",
  billingPhone: "",

  // 收貨地址相關
  shippingAddress: "",
  shippingRecipient: "",
  shippingPhone: "",
});

// 根據產品獲取圖片URL的函數
const getProductImageUrl = (item) => {
  // 如果產品有 imageUrl 屬性，優先使用
  if (item.imageUrl && item.imageUrl.trim() !== "") {
    // 檢查是否為完整URL
    if (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/")) {
      return item.imageUrl;
    } else {
      // 如果不是完整URL，加上assets路徑前綴
      return `../../assets/${item.imageUrl}`;
    }
  }

  // 如果沒有imageUrl但有image屬性
  if (item.image && item.image.trim() !== "") {
    // 檢查是否為完整URL
    if (item.image.startsWith("http") || item.image.startsWith("/")) {
      return item.image;
    } else {
      // 如果不是完整URL，加上assets路徑前綴
      return `../../assets/${item.image}`;
    }
  }

  // 如果沒有image屬性或imageUrl屬性，使用預設圖片
  return "/images/product-placeholder.png";
};

// 監聽 selectedOrder 變化，控制詳情模態框顯示
watch(showDetailModal, (newVal) => {
  if (newVal) {
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "15px";
  } else {
    // 只有當編輯模態框也沒有顯示時才恢復滾動
    if (!showEditModal.value) {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }
});

// 監聽編輯模態框顯示狀態
watch(showEditModal, (newVal) => {
  if (newVal) {
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "15px";
  } else {
    // 只有當詳情模態框也沒有顯示時才恢復滾動
    if (!showDetailModal.value) {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }
});

// 訂單獲取函數
const fetchOrders = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (!userStore.token) {
      error.value = "Token不存在，請重新登入！";
      loading.value = false;
      return;
    }

    if (!isSeller.value) {
      error.value = "您沒有賣家權限，無法存取賣家訂單！";
      loading.value = false;
      return;
    }

    console.log("📝 當前Token:", userStore.token.substring(0, 15) + "...");
    console.log("📝 當前用戶角色:", userStore.roles);
    console.log("📤 發送請求: /api/orders/seller/orders");

    // 確保請求包含正確的 Authorization header
    const response = await axios.get("/api/orders/seller/orders", {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    });

    console.log("📥 收到回應:", response);

    // 處理 API 回應格式
    if (response.data && response.data.hasOwnProperty("statusCode")) {
      // API 回應格式 { statusCode, status, message, data }
      if (response.data.status === "success") {
        orders.value = response.data.data || [];
        console.log("✅ 成功獲取賣家訂單:", response.data.message);
      } else {
        error.value = response.data.message || "獲取訂單失敗";
      }
    } else {
      // 直接數據格式
      orders.value = response.data || [];
    }

    // 確保每個訂單項目都有圖片屬性
    orders.value = orders.value.map((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items = order.items.map((item) => {
          return {
            ...item,
            // 確保每個項目都有圖片相關屬性（即使是空值）
            imageUrl: item.imageUrl || "",
            image: item.image || "",
          };
        });
      }
      return order;
    });

    loading.value = false;
  } catch (err) {
    console.error("❌ 訂單 API 錯誤:", err);

    // 詳細顯示錯誤信息
    if (err.response) {
      const statusCode = err.response.status;
      const responseData = err.response.data;

      console.error(`服務器錯誤(${statusCode}):`, responseData);

      if (statusCode === 403) {
        error.value = `權限不足，您沒有賣家權限 (角色: ${
          userStore.roles?.join(", ") || "無"
        })`;
      } else if (statusCode === 401) {
        error.value = "登入已過期，請重新登入";
      } else {
        error.value = responseData.message || "獲取訂單時出現問題";
      }
    } else if (err.request) {
      error.value = "無法連接到伺服器，請檢查網絡連接";
    } else {
      error.value = "訂單請求錯誤: " + err.message;
    }

    loading.value = false;
  }
};

// 只在組件掛載時獲取一次訂單
onMounted(() => {
  console.log("當前用戶角色:", userStore.roles);
  fetchOrders();
});

// 訂單篩選功能
const filteredOrders = computed(() => {
  if (!orders.value || !Array.isArray(orders.value)) return [];

  return orders.value.filter((order) => {
    const status = (order.status || "").trim();
    const paymentStatus = (order.paymentStatus || "").trim();
    const shipmentStatus = (order.shipmentStatus || "").trim();

    const statusFilter = filterCriteria.value.status;
    const paymentFilter = filterCriteria.value.paymentStatus;
    const shipmentFilter = filterCriteria.value.shipmentStatus;

    if (statusFilter !== "all" && status !== statusFilter) return false;
    if (paymentFilter !== "all" && paymentStatus !== paymentFilter)
      return false;
    if (shipmentFilter !== "all" && shipmentStatus !== shipmentFilter)
      return false;

    return true;
  });
});

// 訂單排序功能
const sortedOrders = computed(() => {
  return [...filteredOrders.value].sort((a, b) => {
    return sortAscending.value ? a.orderId - b.orderId : b.orderId - a.orderId;
  });
});

// 切換排序方式
const sortById = () => {
  sortAscending.value = !sortAscending.value;
};

// 關閉詳情模態框
const closeDetailModal = () => {
  showDetailModal.value = false;
  // 只有當編輯模態框也沒有顯示時才恢復滾動
  if (!showEditModal.value) {
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }
};

// 關閉編輯模態框
const closeEditModal = () => {
  // 詢問是否確定關閉（如果有未保存的更改）
  if (isSaving.value) {
    return; // 如果正在保存，則不允許關閉
  }

  Swal.fire({
    title: "確定要取消嗎？",
    text: "您的更改將不會被保存",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "是，取消編輯",
    cancelButtonText: "否，繼續編輯",
  }).then((result) => {
    if (result.isConfirmed) {
      showEditModal.value = false;
      editError.value = null;
      successMessage.value = null;

      // 只有當詳情模態框也沒有顯示時才恢復滾動
      if (!showDetailModal.value) {
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    }
  });
};

// 查看訂單詳情
const viewOrder = (order) => {
  selectedOrder.value = order;
  showDetailModal.value = true;
};

// 打開訂單編輯模態框
const openEditModal = (order) => {
  // 如果詳情模態框打開，先關閉它
  if (showDetailModal.value) {
    closeDetailModal();
  }

  // 解析地址信息
  const parseBillingAddress = (address) => {
    if (!address) return { address: "", recipient: "", phone: "" };

    const match = address.match(/(.*) \(收件人: (.*), 電話: (.*)\)/);
    if (match) {
      return {
        address: match[1].trim(),
        recipient: match[2].trim(),
        phone: match[3].trim(),
      };
    }

    return {
      address: address,
      recipient: order.userName || "",
      phone: order.userPhone || "",
    };
  };

  // 解析帳單地址
  const billingAddressInfo = parseBillingAddress(order.billingAddress);

  // 解析收貨地址
  const shippingAddressInfo = parseBillingAddress(order.shippingAddress);

  // 重置編輯訂單的數據
  Object.assign(editingOrder, {
    orderId: order.orderId,
    shipmentMethod: order.shipmentMethod || "宅配",
    shipmentStatus: order.shipmentStatus || "未出貨",
    trackingNumber: order.trackingNumber || "未提供",
    paymentMethod: order.paymentMethod || "信用卡",
    paymentStatus: order.paymentStatus || "未付款",
    billingAddress: billingAddressInfo.address,
    billingRecipient: billingAddressInfo.recipient,
    billingPhone: billingAddressInfo.phone,
    shippingAddress: shippingAddressInfo.address,
    shippingRecipient: shippingAddressInfo.recipient,
    shippingPhone: shippingAddressInfo.phone,
  });

  // 顯示編輯模態框
  showEditModal.value = true;
  editError.value = null;
  successMessage.value = null;
};

// 保存編輯後的訂單 - 連接到後端 API
const saveOrder = async () => {
  isSaving.value = true;
  editError.value = null;
  successMessage.value = null;

  try {
    // 格式化地址以符合API期望的格式
    const formattedBillingAddress = `${editingOrder.billingAddress} (收件人: ${editingOrder.billingRecipient}, 電話: ${editingOrder.billingPhone})`;
    const formattedShippingAddress = `${editingOrder.shippingAddress} (收件人: ${editingOrder.shippingRecipient}, 電話: ${editingOrder.shippingPhone})`;

    // 準備API請求數據 - 根據後端 API 的期望格式調整
    const requestData = {
      // 運送相關
      shipmentMethod: editingOrder.shipmentMethod,
      shipmentStatus: editingOrder.shipmentStatus,
      trackingNumber: editingOrder.trackingNumber,

      // 付款相關
      paymentMethod: editingOrder.paymentMethod,
      paymentStatus: editingOrder.paymentStatus,

      // 地址相關
      billingAddress: formattedBillingAddress,
      shippingAddress: formattedShippingAddress,
    };

    console.log("📤 正在更新訂單:", editingOrder.orderId);
    console.log("📤 請求數據:", requestData);

    // 發送API請求
    const response = await axios.put(
      `/api/orders/${editingOrder.orderId}`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      }
    );

    console.log("📥 訂單更新回應:", response);

    // 處理回應
    if (response.data && response.data.hasOwnProperty("statusCode")) {
      // 新 API 格式
      if (response.data.status === "success") {
        successMessage.value = response.data.message || "訂單已成功更新！";
      } else {
        throw new Error(response.data.message || "更新失敗");
      }
    } else {
      // 舊 API 格式或直接返回數據
      successMessage.value = "訂單已成功更新！";
    }

    // 重新獲取最新訂單數據
    await fetchOrders();

    isSaving.value = false;

    // 2秒後自動關閉編輯模態框並清除成功消息
    setTimeout(() => {
      if (successMessage.value) {
        closeEditModal();
        successMessage.value = null;
      }
    }, 2000);
  } catch (err) {
    console.error("❌ 保存訂單錯誤:", err);

    if (err.response) {
      const statusCode = err.response.status;
      const responseData = err.response.data;

      console.error(`服務器錯誤(${statusCode}):`, responseData);

      if (statusCode === 403) {
        editError.value = "權限不足，您沒有權限更新此訂單";
      } else if (statusCode === 401) {
        editError.value = "登入已過期，請重新登入";
      } else {
        editError.value = responseData.message || "更新訂單時出現問題";
      }
    } else if (err.request) {
      editError.value = "無法連接到伺服器，請檢查網絡連接";
    } else {
      editError.value = "保存請求錯誤: " + err.message;
    }

    isSaving.value = false;
  }
};

// 刪除訂單 - 連接到後端 API
const deleteOrder = async (orderId) => {
  const confirm = await Swal.fire({
    title: "確定要刪除嗎？",
    text: "刪除後無法恢復！",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "確定刪除",
    cancelButtonText: "取消",
  });

  if (confirm.isConfirmed) {
    try {
      console.log("📤 正在刪除訂單:", orderId);

      // 發送刪除請求
      const response = await axios.delete(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${userStore.token}` },
      });

      console.log("📥 訂單刪除回應:", response);

      // 處理回應
      if (response.data && response.data.hasOwnProperty("statusCode")) {
        // 新 API 格式
        if (response.data.status === "success") {
          // 從本地列表中移除已刪除的訂單
          orders.value = orders.value.filter(
            (order) => order.orderId !== orderId
          );
          Swal.fire(
            "刪除成功",
            response.data.message || "該訂單已被移除",
            "success"
          );
        } else {
          throw new Error(response.data.message || "刪除失敗");
        }
      } else {
        // 舊 API 格式或直接返回數據
        orders.value = orders.value.filter(
          (order) => order.orderId !== orderId
        );
        Swal.fire("刪除成功", "該訂單已被移除", "success");
      }
    } catch (error) {
      console.error("❌ 刪除訂單錯誤:", error);

      let errorMessage = "請稍後再試";

      if (error.response) {
        const statusCode = error.response.status;
        const responseData = error.response.data;

        console.error(`服務器錯誤(${statusCode}):`, responseData);

        if (statusCode === 403) {
          errorMessage = "權限不足，您沒有權限刪除此訂單";
        } else if (statusCode === 401) {
          errorMessage = "登入已過期，請重新登入";
        } else {
          errorMessage = responseData.message || "刪除訂單時出現問題";
        }
      }

      Swal.fire("刪除失敗", errorMessage, "error");
    }
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
</script>

<style scoped>
/* Modal 樣式調整 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  overflow-x: hidden;
  overflow-y: auto;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal-dialog {
  position: relative;
  z-index: 1055;
  margin: 1.75rem auto;
  max-width: 800px;
}

/* 若您的頁面布局有需要，可以調整表格容器的最大高度並添加垂直滾動 */
.table-responsive {
  max-height: 70vh;
}

/* 確保排序圖標與文字對齊 */
th i.bi {
  vertical-align: middle;
  margin-left: 5px;
}

/* 編輯表單樣式調整 */
.card {
  border-radius: 0.5rem;
}

.card-header {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

/* 表單字段間距 */
.form-label {
  font-weight: 500;
}

/* 模態框最大高度設置 */
.modal-dialog .modal-content {
  max-height: 90vh;
  overflow-y: auto;
}
.badge {
  font-size: 0.85rem;
  border-radius: 1rem;
}
</style>
