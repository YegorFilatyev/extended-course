import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если получили 401, можно перенаправить на страницу логина
    if (error.response?.status === 401) {
      // Не делаем автоматический редирект, чтобы избежать циклов
      console.log('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getAllProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductsByCategory = async (categoryId) => {
  const response = await api.get(`/products/${categoryId}`);
  return response.data;
};

export const getProductById = async (productId) => {
  const response = await api.get(`/product/${productId}`);
  return response.data;
};

export const getProductImages = async (productId) => {
  const response = await api.get(`/products/${productId}/images`);
  return response.data;
};

export const register = async (email, password, name) => {
  const response = await api.post('/register', { email, password, name });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/logout');
  return response.data;
};

export const verifyToken = async () => {
  try {
    const response = await api.get('/verify');
    return response.data;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

export const updateUser = async (userId, email, name) => {
  const response = await api.put(`/user/${userId}`, { email, name });
  return response.data;
};

export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId, productPrice) => {
  const response = await api.post('/cart/add', { product_id: productId, product_price: productPrice });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.post('/cart/remove_product', { product_id: productId });
  return response.data;
};

export const removePosition = async (productId) => {
  const response = await api.delete('/cart/remove_position', { data: { product_id: productId } });
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart/clear');
  return response.data;
};

export const createOrder = async () => {
  const response = await api.post('/new_order');
  return response.data;
};

export const getOrdersByUser = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getProductsFromOrder = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/products`);
  return response.data;
};

export const deleteOrder = async (orderId) => {
  const response = await api.delete(`/order/${orderId}`);
  return response.data;
};

export default api;