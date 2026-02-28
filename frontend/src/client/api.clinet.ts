
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const ledgerId = localStorage.getItem('activeLedgerId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Automatically inject ledger_id for non-auth requests
    if (ledgerId && ledgerId !== 'undefined' && !config.url?.includes('/auth/')) {
      if (config.method === 'get' || config.method === 'delete') {
        config.params = { ...config.params, ledger_id: ledgerId };
      } else if (config.method === 'post' || config.method === 'put') {
        config.data = { ...config.data, ledger_id: Number.parseInt(ledgerId) };
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
