import api from './api';

export const staffService = {
  getStaff: (params = {}) => api.get('/staff', { params }),
  getStaffById: (id) => api.get(`/staff/${id}`),
  createStaff: (data) => api.post('/staff', data),
  updateStaff: (id, data) => api.put(`/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/staff/${id}`),
};
