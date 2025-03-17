// 測試用 API，到時候刪除
export async function fetchSellerOrders() {
    return [
        {
            id: "ORD001", customer: "小明", total: 500, status: "待付款", date: "2025-03-01",
            items: [
                { name: "無線耳機", quantity: 1, price: 500 }
            ]
        },
        {
            id: "ORD005", customer: "小明", total: 800, status: "已出貨", date: "2025-03-10",
            items: [
                { name: "滑鼠", quantity: 2, price: 400 }
            ]
        },
        {
            id: "ORD009", customer: "小明", total: 300, status: "已完成", date: "2025-03-15",
            items: [
                { name: "鍵盤", quantity: 1, price: 300 }
            ]
        },

        {
            id: "ORD002", customer: "小華", total: 1200, status: "待出貨", date: "2025-03-03",
            items: [
                { name: "手機保護殼", quantity: 2, price: 600 }
            ]
        },
        {
            id: "ORD006", customer: "小華", total: 1500, status: "已取消", date: "2025-03-12",
            items: [
                { name: "藍牙喇叭", quantity: 1, price: 1500 }
            ]
        },
        {
            id: "ORD010", customer: "小華", total: 950, status: "已付款", date: "2025-03-18",
            items: [
                { name: "平板電腦保護膜", quantity: 5, price: 190 }
            ]
        },

        {
            id: "ORD003", customer: "大雄", total: 800, status: "已完成", date: "2025-03-05",
            items: [
                { name: "USB 充電線", quantity: 4, price: 200 }
            ]
        },
        {
            id: "ORD007", customer: "大雄", total: 2200, status: "待付款", date: "2025-03-14",
            items: [
                { name: "電競滑鼠", quantity: 1, price: 2200 }
            ]
        },
        {
            id: "ORD011", customer: "大雄", total: 1300, status: "已出貨", date: "2025-03-20",
            items: [
                { name: "機械鍵盤", quantity: 1, price: 1300 }
            ]
        }
    ];
}

export async function fetchAllOrders() {
    return [
        {
            id: "ORD001", customer: "小明", total: 500, status: "待付款", date: "2025-03-01",
            items: [
                { name: "無線耳機", quantity: 1, price: 500 }
            ]
        },
        {
            id: "ORD005", customer: "小明", total: 800, status: "已出貨", date: "2025-03-10",
            items: [
                { name: "滑鼠", quantity: 2, price: 400 }
            ]
        },
        {
            id: "ORD009", customer: "小明", total: 300, status: "已完成", date: "2025-03-15",
            items: [
                { name: "鍵盤", quantity: 1, price: 300 }
            ]
        },

        {
            id: "ORD002", customer: "小華", total: 1200, status: "待出貨", date: "2025-03-03",
            items: [
                { name: "手機保護殼", quantity: 2, price: 600 }
            ]
        },
        {
            id: "ORD006", customer: "小華", total: 1500, status: "已取消", date: "2025-03-12",
            items: [
                { name: "藍牙喇叭", quantity: 1, price: 1500 }
            ]
        },
        {
            id: "ORD010", customer: "小華", total: 950, status: "已付款", date: "2025-03-18",
            items: [
                { name: "平板電腦保護膜", quantity: 5, price: 190 }
            ]
        },

        {
            id: "ORD003", customer: "大雄", total: 800, status: "已完成", date: "2025-03-05",
            items: [
                { name: "USB 充電線", quantity: 4, price: 200 }
            ]
        },
        {
            id: "ORD007", customer: "大雄", total: 2200, status: "待付款", date: "2025-03-14",
            items: [
                { name: "電競滑鼠", quantity: 1, price: 2200 }
            ]
        },
        {
            id: "ORD011", customer: "大雄", total: 1300, status: "已出貨", date: "2025-03-20",
            items: [
                { name: "機械鍵盤", quantity: 1, price: 1300 }
            ]
        },

        {
            id: "ORD004", customer: "胖虎", total: 2000, status: "已取消", date: "2025-03-06",
            items: [
                { name: "智能手錶", quantity: 1, price: 2000 }
            ]
        },
        {
            id: "ORD008", customer: "胖虎", total: 1750, status: "待出貨", date: "2025-03-11",
            items: [
                { name: "遊戲控制器", quantity: 1, price: 1750 }
            ]
        },
        {
            id: "ORD012", customer: "胖虎", total: 600, status: "已完成", date: "2025-03-22",
            items: [
                { name: "藍光護目鏡", quantity: 2, price: 300 }
            ]
        }
    ];
}
