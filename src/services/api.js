import api from '../Utils/Axios';

// ── Overview ──────────────────────────────────────────────────────────────────
export const fetchSellerOverview = () => api.get('/api/seller/overview/');

// ── Analytics ─────────────────────────────────────────────────────────────────
export const fetchVisitors        = () => api.get('/api/seller/analytics/visitors/');
export const fetchPeakHours       = () => api.get('/api/seller/analytics/peak-hours/');
export const fetchHeatmap         = () => api.get('/api/seller/analytics/heatmap/');
export const fetchJourney         = () => api.get('/api/seller/analytics/journey/');
export const fetchBestTimes       = () => api.get('/api/seller/analytics/best-times/');
export const fetchCompetitorPrices= () => api.get('/api/seller/analytics/competitor-prices/');
export const fetchRatingsBreakdown= () => api.get('/api/seller/analytics/ratings-breakdown/');
export const fetchTopProducts     = () => api.get('/api/seller/analytics/top-products/');

// ── Store ─────────────────────────────────────────────────────────────────────
export const fetchSellerStore     = () => api.get('/api/seller/store/');
export const updateSellerStore = (formData) =>
  api.put('/api/seller/store/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
    // Authorization already added by interceptor
  })
export const toggleStore          = () => api.post('/api/seller/store/toggle/');
export const fetchDeliveryRadius  = () => api.get('/api/seller/store/delivery-radius/');
export const saveDeliveryRadius   = (data) => api.post('/api/seller/store/delivery-radius/', data);

// ── Products ─────────────────────────────────────────────────────────────────────────
export const fetchSellerProducts  = () => api.get('/api/seller/products/');
// Fix createProduct — remove manual header (interceptor handles it):
export const createProduct = (data) =>
  api.post('/api/seller/products/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
// Fix updateProduct — remove manual header:
export const updateProduct = (id, data) =>
  api.put(`/api/seller/products/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
// Fix deleteProduct — no special headers needed:
export const deleteProduct = (id) =>
  api.delete(`/api/seller/products/${id}/`)
// Fix bulkConfirmImport — backend expects 'rows' not 'products':
export const bulkConfirmImport = (rows) =>
  api.post('/api/seller/products/bulk-confirm/', { rows })

// ── Orders ────────────────────────────────────────────────────────────────────
export const fetchSellerOrders    = () => api.get('/api/seller/orders/');
export const fetchOrderDetail     = (id) => api.get(`/api/seller/orders/${id}/`);
export const updateOrderStatus    = (id, status) => api.post(`/api/seller/orders/${id}/status/`, { status });
export const fetchReturns         = () => api.get('/api/seller/orders/returns/');
export const actionReturn         = (id, action) => api.post(`/api/seller/orders/returns/${id}/action/`, { action });

// ── Verification ──────────────────────────────────────────────────────────────
export const fetchVerification    = () => api.get('/api/seller/verification/');
// Fix submitVerification:
export const submitVerification = (formData) =>
  api.post('/api/seller/verification/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

// ── Ratings ───────────────────────────────────────────────────────────────────
export const fetchStoreRatings    = () => api.get('/api/seller/ratings/store/');
export const fetchProductRatings  = () => api.get('/api/seller/ratings/products/');
export const rateStore            = (storeId, data) => api.post(`/api/ratings/store/${storeId}/`, data);
export const rateProduct          = (productId, data) => api.post(`/api/ratings/product/${productId}/`, data);

// ── Settings ─────────────────────────────────────────────────────────────────────────
export const changePassword       = (data) => api.post('/api/seller/settings/password/', data);
export const deleteAccount        = () => api.delete('/api/seller/settings/account/');

// ── Categories ──────────────────────────────────────────────────────────────────────
export const fetchSellerCategories  = () => api.get('/api/seller/categories/');
// Fix createSellerCategory:
export const createSellerCategory = (data) =>
  api.post('/api/seller/categories/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
// Fix updateSellerCategory:
export const updateSellerCategory = (id, data) =>
  api.put(`/api/seller/categories/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const deleteSellerCategory = (id) =>
  api.delete(`/api/seller/categories/${id}/`)
