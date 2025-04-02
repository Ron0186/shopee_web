const reconstructSkuData = (skus) => { if (!skus?.length) return;
console.log("重构 SKU 数据，收到的 SKU:", skus); // 清除现有规格选项
specOptions.value = []; // 从所有 SKU 中收集规格值 const specMap = {};
skus.forEach((sku) => { if (!sku.specPairs) return;
Object.entries(sku.specPairs).forEach(([key, value]) => { if (!specMap[key])
specMap[key] = new Set(); specMap[key].add(value); }); });
console.log("提取的规格映射:", specMap); // 根据收集的数据创建规格选项
specOptions.value = Object.entries(specMap).map(([name, valuesSet]) => ({ name,
values: Array.from(valuesSet), nameError: "", valueErrors:
Array(valuesSet.size).fill(""), })); console.log("重构后的规格选项:",
specOptions.value); // 使用现有数据重建 SKU 列表 generatedSkus.value =
skus.map((sku) => ({ id: sku.id || sku.skuId, specPairs: { ...sku.specPairs },
price: sku.price, stock: sku.stock, priceError: "", stockError: "", }));
console.log("重构后的 SKU 列表:", generatedSkus.value); };
