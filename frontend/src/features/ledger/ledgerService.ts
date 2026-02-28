import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Ledger {
  ledger_id: number;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

const ledgerService = {
  fetchLedgers: async () => {
    const response = await axios.get(`${API_URL}/ledger/lists`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  createLedger: async (name: string) => {
    const response = await axios.post(`${API_URL}/ledger/add`, { name }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  updateLedger: async (id: number, data: Partial<Ledger>) => {
    const response = await axios.put(`${API_URL}/ledger/update/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  deleteLedger: async (id: number) => {
    const response = await axios.delete(`${API_URL}/ledger/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};

export default ledgerService;
