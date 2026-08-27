import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { departmentService } from '../../services/departmentService';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Users, Plus, Edit2, Trash2, Mail, Building2, Search, CheckCircle, XCircle } from 'lucide-react';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentStaff, setCurrentStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'Staff Officer',
    active: true,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useNotification();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, deptRes] = await Promise.all([
        staffService.getStaff(),
        departmentService.getDepartments(),
      ]);
      if (staffRes.success) setStaffList(staffRes.data || []);
      if (deptRes.success) setDepartments(deptRes.data || []);
    } catch (err) {
      showError(err.message || 'Failed to fetch staff directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      department: departments[0]?._id || '',
      role: 'Staff Officer',
      active: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setCurrentStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      department: staff.department?._id || staff.department || '',
      role: staff.role || 'Staff Officer',
      active: staff.active !== undefined ? staff.active : true,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (staff) => {
    setCurrentStaff(staff);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.department) return;

    setActionLoading(true);
    try {
      const res = await staffService.createStaff(formData);
      if (res.success) {
        showSuccess('Staff member registered successfully');
        setIsCreateModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showError(err.message || 'Failed to register staff');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !currentStaff) return;

    setActionLoading(true);
    try {
      const res = await staffService.updateStaff(currentStaff._id, formData);
      if (res.success) {
        showSuccess('Staff information updated');
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showError(err.message || 'Failed to update staff');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentStaff) return;
    setActionLoading(true);
    try {
      const res = await staffService.deleteStaff(currentStaff._id);
      if (res.success) {
        showSuccess('Staff member deleted successfully');
        setIsDeleteModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete staff member');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      selectedDeptFilter === 'All' ||
      (s.department?._id || s.department) === selectedDeptFilter;

    return matchesSearch && matchesDept;
  });

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
            Staff & Personnel Directory
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            Manage departmental officers, technicians, and responsible persons for complaint resolution
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
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
            placeholder="Search staff by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-600)' }}>
            Department:
          </label>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table */}
      {loading ? (
        <LoadingSpinner message="Loading staff directory..." />
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff members found"
          description="Register personnel under college departments so they can be assigned to complaints."
          action={
            <button onClick={handleOpenCreate} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Staff Member</span>
            </button>
          }
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Department</th>
                  <th>Role / Designation</th>
                  <th>Email Contact</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          className="avatar-circle"
                          style={{ width: '36px', height: '36px', fontSize: '0.8125rem' }}
                        >
                          {staff.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                          {staff.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--slate-700)', fontWeight: 500 }}>
                        <Building2 size={15} color="var(--purple-main)" />
                        <span>{staff.department?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                        {staff.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--slate-600)', fontSize: '0.8125rem' }}>
                        <Mail size={14} />
                        <a href={`mailto:${staff.email}`}>{staff.email}</a>
                      </div>
                    </td>
                    <td>
                      {staff.active ? (
                        <span className="badge" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
                          <CheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-500)' }}>
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit Staff"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(staff)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: 'var(--danger-main)', borderColor: 'var(--danger-border)' }}
                          title="Delete Staff"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Staff Member"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateSubmit} disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Register Staff'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="staffName">
              Full Name *
            </label>
            <input
              id="staffName"
              type="text"
              className="form-input"
              placeholder="e.g. Dr. Arthur Vance"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="staffEmail">
              Official Email Address *
            </label>
            <input
              id="staffEmail"
              type="email"
              className="form-input"
              placeholder="staff@college.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="staffDept">
              Assigned Department *
            </label>
            <select
              id="staffDept"
              className="form-select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="staffRole">
              Role / Designation
            </label>
            <input
              id="staffRole"
              type="text"
              className="form-input"
              placeholder="e.g. Network Engineer, Electrician, Warden"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="staffActive"
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="staffActive" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>
              Active (Available for complaint assignment)
            </label>
          </div>
        </form>
      </Modal>

      {/* EDIT STAFF MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Staff Member"
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
            <label className="form-label" htmlFor="editStaffName">
              Full Name *
            </label>
            <input
              id="editStaffName"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editStaffEmail">
              Email Address *
            </label>
            <input
              id="editStaffEmail"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editStaffDept">
              Department *
            </label>
            <select
              id="editStaffDept"
              className="form-select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editStaffRole">
              Role / Designation
            </label>
            <input
              id="editStaffRole"
              type="text"
              className="form-input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="editStaffActive"
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="editStaffActive" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>
              Active (Available for complaint assignment)
            </label>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Staff: ${currentStaff?.name}?`}
        message="Are you sure you want to remove this staff officer? Note that staff assigned to unresolved complaints cannot be deleted directly."
        confirmText="Delete Staff"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
};

export default Staff;
