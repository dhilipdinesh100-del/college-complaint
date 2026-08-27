import api from './api';

export const complaintService = {
  createComplaint: (formData) => {
    return api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getComplaints: (params = {}) => {
    return api.get('/complaints', { params });
  },

  getComplaintById: (id) => {
    return api.get(`/complaints/${id}`);
  },

  updateComplaint: (id, data) => {
    return api.put(`/complaints/${id}`, data);
  },

  updateStatus: (id, status, comment) => {
    return api.put(`/complaints/${id}/status`, { status, comment });
  },

  updatePriority: (id, priority, comment) => {
    return api.put(`/complaints/${id}/priority`, { priority, comment });
  },

  updateAssignment: (id, { departmentId, staffId, comment }) => {
    return api.put(`/complaints/${id}/assignment`, {
      departmentId,
      staffId,
      comment,
    });
  },

  updateResolution: (id, { resolutionDetails, status, comment }) => {
    return api.put(`/complaints/${id}/resolution`, {
      resolutionDetails,
      status,
      comment,
    });
  },

  addComment: (id, comment) => {
    return api.post(`/complaints/${id}/comments`, { comment });
  },

  closeComplaint: (id, comment) => {
    return api.put(`/complaints/${id}/close`, { comment });
  },

  deleteComplaint: (id) => {
    return api.delete(`/complaints/${id}`);
  },
};
