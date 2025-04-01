<template>
    <div class="mb-4">
        <div
            class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h4 class="mb-0">營收統計</h4>
            <div class="d-flex align-items-center gap-2 flex-wrap">
                <label>年份：</label>
                <select v-model="selectedYear">
                    <option disabled v-if="availableYears.length === 0">尚無年份資料
                    </option>
                    <option v-for="year in availableYears" :key="year"
                        :value="year">{{ year }}</option>
                </select>

                <label>月份：</label>
                <select v-model="selectedMonth">
                    <option value="">全年</option>
                    <option v-for="m in 12" :key="m" :value="m">{{ m }}月
                    </option>
                </select>

                <button class="btn btn-outline-primary" @click="toggleMode">
                    切換：{{ viewMode === 'monthly' ? '月統計' : '日統計' }}
                </button>

                <button class="btn btn-outline-success" @click="exportCSV">
                    匯出 CSV
                </button>
            </div>
        </div>

        <div v-if="summaryData.length === 0" class="text-muted">
            無符合條件的營收資料
        </div>
        <Bar v-else :data="chartData" :options="chartOptions" class="mt-3"
            height="300" />



        <table class="table table-bordered mt-3">
            <thead>
                <tr>
                    <th>{{ viewMode === 'monthly' ? '月份' : '日期' }}</th>
                    <th>總訂單數</th>
                    <th>總營收</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in summaryData" :key="row.key">
                    <td>{{ row.label }}</td>
                    <td>{{ row.count }}</td>
                    <td>${{ row.revenue.toLocaleString() }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
    orders: {
        type: Array,
        default: () => [],
    },
})

const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(null) // 不選月份 = 全年
const viewMode = ref('monthly')

const toggleMode = () => {
    viewMode.value = viewMode.value === 'monthly' ? 'daily' : 'monthly'
}

const availableYears = computed(() => {
    const years = props.orders
        .filter(o => o.createdAt)
        .map(o => new Date(o.createdAt).getFullYear())
    return [...new Set(years)].sort((a, b) => b - a)
})

const filteredOrders = computed(() =>
    props.orders.filter(o => {
        const date = new Date(o.createdAt)
        return (
            date.getFullYear() === Number(selectedYear.value) &&
            (selectedMonth.value == null || date.getMonth() + 1 === Number(selectedMonth.value))
        )
    })
)

const summaryData = computed(() => {
    const map = new Map()
    filteredOrders.value.forEach(order => {
        const date = new Date(order.createdAt)
        const key =
            viewMode.value === 'monthly'
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
                    date.getDate()
                ).padStart(2, '0')}`
        if (!map.has(key)) {
            map.set(key, { count: 0, revenue: 0 })
        }
        const entry = map.get(key)
        entry.count++
        entry.revenue += Number(order.totalPrice)
    })

    return Array.from(map.entries())
        .sort()
        .map(([key, val]) => ({
            key,
            label: key,
            count: val.count,
            revenue: val.revenue,
        }))
})

const chartData = computed(() => ({
    labels: summaryData.value.map(row => row.label),
    datasets: [
        {
            label: viewMode.value === 'monthly' ? '月營收 (NT$)' : '日營收 (NT$)',
            backgroundColor: '#42A5F5',
            data: summaryData.value.map(row => row.revenue),
        },
    ],
}))

const chartOptions = {
    responsive: true,
    plugins: {
        legend: { display: true },
        tooltip: {
            callbacks: {
                label: context => `NT$ ${context.parsed.y.toLocaleString()}`,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: value => `NT$ ${value.toLocaleString()}`,
            },
        },
    },
}

const exportCSV = () => {
    const header = `${viewMode.value === 'monthly' ? '月份' : '日期'},訂單數,營收(NT$)`
    const rows = summaryData.value.map(r => `${r.label},${r.count},${r.revenue}`)
    const blob = new Blob([header + '\n' + rows.join('\n')], {
        type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${viewMode.value}_revenue_report.csv`)
    link.click()
}
</script>

<style scoped>
.bar-container {
    height: 300px;
}
</style>