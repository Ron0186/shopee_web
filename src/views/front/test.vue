const fetchProductImages = async (productId) => { try {
console.log("正在获取商品图片, 商品ID:", productId); const response = await
axios.get(`/api/products/${productId}/images`, { headers: { Authorization:
`Bearer ${token}` }, }); if (response.data && Array.isArray(response.data)) {
console.log("API返回的图片数据:", response.data); existingImages.value =
response.data.map((img) => ({ ...img, imagePath: img.imagePath, isPrimary:
!!img.isPrimary, id: img.id || img.imageId, }));
console.log("处理后的图片数据:", existingImages.value); } } catch (error) {
console.error("获取商品图片错误:", error); // 从 props 获取图片信息 if
(props.productData) { console.log("尝试从props获取图片数据:",
props.productData); // 尝试多种可能的数据结构 if
(props.productData.productImages && props.productData.productImages.length > 0)
{ console.log("从productImages获取图片"); existingImages.value =
props.productData.productImages.map((img) => ({ ...img, isPrimary:
!!img.isPrimary, id: img.id || img.imageId, imagePath: img.imagePath ||
img.imageUrl || "", })); } else if (props.productData.primaryImageUrl) {
console.log("从primaryImageUrl获取图片"); existingImages.value = [ { id: null,
imagePath: props.productData.primaryImageUrl, isPrimary: true, }, ]; } else if
(props.productData.image) { console.log("从image获取图片"); existingImages.value
= [ { id: null, imagePath: props.productData.image, isPrimary: true, }, ]; }
console.log("最终设置的图片数据:", existingImages.value); } } };
