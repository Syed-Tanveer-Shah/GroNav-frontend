import axios from 'axios';

// Create a new instance of Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.url?.includes('/api/seller/') || config.url?.includes('/api/orders/seller')) {
      const sellerToken = localStorage.getItem('seller_token')
      if (sellerToken) {
        config.headers.Authorization = `Token ${sellerToken}`
      }
      // DO NOT clear localStorage or redirect here — let response interceptor handle
    } else {
      const buyerToken = localStorage.getItem('token')
      if (buyerToken) config.headers.Authorization = `Token ${buyerToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if it's a buyer API call:
      const isSeller = window.location.pathname.includes('/seller')
      if (!isSeller) {
        localStorage.removeItem('token')
        localStorage.removeItem('user_name')
        localStorage.removeItem('user_type')
        localStorage.removeItem('CartItem')
        window.location.href = '/login'
      } else {
        // Seller token expired — redirect to become-a-seller:
        localStorage.removeItem('seller_token')
        localStorage.removeItem('seller_name')
        localStorage.removeItem('is_seller')
        window.location.href = '/become-a-seller'
      }
    }
    // DO NOT redirect on 403 — let component handle it
    return Promise.reject(error)
  }
)

export default api;


