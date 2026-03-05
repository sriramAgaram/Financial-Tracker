
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

    // Automatically attach ledger_id to every request if it exists
    if (ledgerId) {
      if (config.method?.toLowerCase() === 'get') {
        config.params = { ...config.params, ledger_id: ledgerId };
      } else if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
        // If it's a FormData object (e.g., file upload), handle differently, 
        // otherwise just spread into the data object
        if (config.data instanceof FormData) {
          config.data.append('ledger_id', ledgerId);
        } else {
          config.data = { ...config.data, ledger_id: ledgerId };
        }
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
