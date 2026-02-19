import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
  return Promise.reject(err);
});

export const roleAPI = {
  getAll:  (p) => api.get('/roles', { params: p }),
  getById: (id) => api.get(`/roles/${id}`),
  create:  (d) => api.post('/roles', d),
  update:  (id, d) => api.put(`/roles/${id}`, d),
  delete:  (id) => api.delete(`/roles/${id}`)
};

export const employeeAPI = {
  getAll:  (p) => api.get('/employees', { params: p }),
  getById: (id) => api.get(`/employees/${id}`),
  create:  (d) => api.post('/employees', d),
  update:  (id, d) => api.put(`/employees/${id}`, d),
  delete:  (id) => api.delete(`/employees/${id}`),
  getStats: () => api.get('/employees/stats')
};

export const taskAPI = {
  getAll:   (p) => api.get('/tasks', { params: p }),
  getById:  (id) => api.get(`/tasks/${id}`),
  create:   (d) => api.post('/tasks', d),
  update:   (id, d) => api.put(`/tasks/${id}`, d),
  delete:   (id) => api.delete(`/tasks/${id}`),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  requestTransfer: (id, d) => api.post(`/tasks/${id}/transfer`, d),
  respondTransfer: (id, d) => api.patch(`/tasks/${id}/transfer/respond`, d),
  addNote:  (id, d) => api.post(`/tasks/${id}/notes`, d),
  getStats: () => api.get('/tasks/stats'),
  getPendingTransfers: (empId) => api.get(`/tasks/pending-transfers/${empId}`)
};

export default api;
