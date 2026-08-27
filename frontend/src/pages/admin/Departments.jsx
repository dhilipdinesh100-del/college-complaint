import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { Building2, Plus, Edit2, Trash2, Search } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentDept, setCurrentDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useNotification();

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getDepartments();
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setFormData({ name: '', description: '' });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setCurrentDept(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (dept) => {
    setCurrentDept(dept);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setActionLoading(true);
    try {
      const res = await departmentService.createDepartment(formData);
      if (res.success) {
        showSuccess('Department created successfully');
        setIsCreateModalOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      showError(err.message || 'Failed to create department');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !currentDept) return;

    setActionLoading(true);
    try {
      const res = await departmentService.updateDepartment(currentDept._id, formData);
      if (res.success) {
        showSuccess('Department updated successfully');
        setIsEditModalOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      showError(err.message || 'Failed to update department');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentDept) return;
    setActionLoading(true);
    try {
      const res = await departmentService.deleteDepartment(currentDept._id);
      if (res.success) {
        showSuccess('Department deleted successfully');
        setIsDeleteModalOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete department');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            College Departments
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            Manage campus operational divisions and assigned facilities teams
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--slate-400)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Department Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Loading departments..." />
      ) : filteredDepartments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Create your first department to start assigning tickets to specialized college teams."
          action={
            <button onClick={handleOpenCreate} className="btn btn-primary">
              <Plus size={16} />
              <span>Create Department</span>
            </button>
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredDepartments.map((dept) => (
            <div key={dept._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--purple-bg)',
                      color: 'var(--purple-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {dept.name}
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px' }}
                    title="Edit Department"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(dept)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', color: 'var(--danger-main)', borderColor: 'var(--danger-border)' }}
                    title="Delete Department"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', flex: 1, lineHeight: 1.5, marginBottom: '1rem' }}>
                {dept.description || 'No description provided for this department.'}
              </p>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--slate-400)',
                  borderTop: '1px solid var(--slate-100)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Created {formatDate(dept.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Department"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateSubmit} disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Create Department'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="deptName">
              Department Name *
            </label>
            <input
              id="deptName"
              type="text"
              className="form-input"
              placeholder="e.g. Electrical & Power Services"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="deptDesc">
              Description / Responsibilities
            </label>
            <textarea
              id="deptDesc"
              className="form-textarea"
              placeholder="Describe what facilities or services this department oversees..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Department"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleEditSubmit} disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="editDeptName">
              Department Name *
            </label>
            <input
              id="editDeptName"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDeptDesc">
              Description
            </label>
            <textarea
              id="editDeptDesc"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Department: ${currentDept?.name}?`}
        message="Are you sure you want to delete this department? This cannot be undone if staff or active complaints are linked to it."
        confirmText="Delete Department"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
};

export default Departments;
