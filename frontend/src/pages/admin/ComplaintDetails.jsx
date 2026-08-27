import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import { staffService } from '../../services/staffService';
import { useNotification } from '../../context/NotificationContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from '../../utils/constants';
import {
  ArrowLeft,
  User,
  Building,
  Mail,
  Hash,
  MapPin,
  Calendar,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  Edit,
  UserCheck,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

const AdminComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action Modals State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);

  // Form states inside modals
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');

  const [selectedPriority, setSelectedPriority] = useState('');
  const [priorityComment, setPriorityComment] = useState('');

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignComment, setAssignComment] = useState('');

  const [resolutionDetails, setResolutionDetails] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('Resolved');
  const [resolveComment, setResolveComment] = useState('');

  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useNotification();

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaintById(id);
      if (res.success && res.data) {
        setComplaint(res.data);
        setSelectedStatus(res.data.status);
        setSelectedPriority(res.data.priority);
        setSelectedDept(res.data.assignedDepartment?._id || '');
        setSelectedStaff(res.data.assignedStaff?._id || '');
        setResolutionDetails(res.data.resolutionDetails || '');
      }
    } catch (err) {
      showError(err.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsAndStaff = async () => {
    try {
      const [deptRes, staffRes] = await Promise.all([
        departmentService.getDepartments(),
        staffService.getStaff({ active: true }),
      ]);
      if (deptRes.success) setDepartments(deptRes.data || []);
      if (staffRes.success) setStaffList(staffRes.data || []);
    } catch (err) {
      console.error('Failed to load aux data', err);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
    fetchDepartmentsAndStaff();
  }, [id]);

  // Handle department change in assign modal: filter staff
  const availableStaff = staffList.filter((s) => {
    if (!selectedDept) return true;
    return (s.department?._id || s.department) === selectedDept;
  });

  // Action: Update Status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await complaintService.updateStatus(id, selectedStatus, statusComment);
      if (res.success) {
        showSuccess(`Status changed to ${selectedStatus}`);
        setIsStatusModalOpen(false);
        setStatusComment('');
        fetchComplaintDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Update Priority
  const handleUpdatePriority = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await complaintService.updatePriority(id, selectedPriority, priorityComment);
      if (res.success) {
        showSuccess(`Priority updated to ${selectedPriority}`);
        setIsPriorityModalOpen(false);
        setPriorityComment('');
        fetchComplaintDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to update priority');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Update Assignment
  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await complaintService.updateAssignment(id, {
        departmentId: selectedDept || null,
        staffId: selectedStaff || null,
        comment: assignComment,
      });
      if (res.success) {
        showSuccess('Assignment updated successfully');
        setIsAssignModalOpen(false);
        setAssignComment('');
        fetchComplaintDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to update assignment');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Update Resolution
  const handleUpdateResolution = async (e) => {
    e.preventDefault();
    if (!resolutionDetails.trim()) {
      showError('Please enter resolution details');
      return;
    }
    setActionLoading(true);
    try {
      const res = await complaintService.updateResolution(id, {
        resolutionDetails: resolutionDetails.trim(),
        status: resolutionStatus,
        comment: resolveComment || 'Resolved by administration',
      });
      if (res.success) {
        showSuccess('Resolution recorded and status updated!');
        setIsResolveModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to record resolution');
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Add Admin Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!adminComment.trim()) return;

    setActionLoading(true);
    try {
      const res = await complaintService.addComment(id, adminComment.trim());
      if (res.success) {
        showSuccess('Administrative note added to timeline');
        setAdminComment('');
        fetchComplaintDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to post note');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading administrative complaint details..." />;
  }

  if (!complaint) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertTriangle size={48} color="var(--warning-main)" style={{ margin: '0 auto 1rem' }} />
        <h3>Ticket Not Found</h3>
        <Link to="/admin/complaints" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Return to Complaints Management
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/admin/complaints"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.875rem',
            color: 'var(--slate-500)',
            marginBottom: '0.5rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Complaint Management</span>
        </Link>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  color: 'var(--primary-600)',
                }}
              >
                {complaint.complaintNumber}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h1
              style={{
                fontSize: '1.625rem',
                fontWeight: 800,
                color: 'var(--slate-900)',
                marginTop: '0.375rem',
              }}
            >
              {complaint.title}
            </h1>
          </div>

          {/* Quick Action Buttons Toolbar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <UserCheck size={16} />
              <span>Assign Dept / Staff</span>
            </button>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <Clock size={16} />
              <span>Change Status</span>
            </button>
            <button
              onClick={() => setIsPriorityModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <Edit size={16} />
              <span>Change Priority</span>
            </button>
            <button
              onClick={() => setIsResolveModalOpen(true)}
              className="btn btn-success btn-sm"
            >
              <CheckCircle2 size={16} />
              <span>Resolve Ticket</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Issue Details Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-900)' }}>
              Complaint Description & Location
            </h3>

            <div
              style={{
                fontSize: '0.9375rem',
                color: 'var(--slate-800)',
                lineHeight: 1.6,
                backgroundColor: 'var(--slate-50)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-200)',
                whiteSpace: 'pre-wrap',
                marginBottom: '1rem',
              }}
            >
              {complaint.description}
            </div>

            {/* Attached file preview */}
            {complaint.attachment && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>
                  Student Attachment Evidence
                </h4>
                {complaint.attachment.mimeType?.startsWith('image/') ? (
                  <div>
                    <img
                      src={complaint.attachment.url}
                      alt={complaint.attachment.originalName || 'Attachment'}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '340px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--slate-200)',
                        objectFit: 'contain',
                      }}
                    />
                    <div style={{ marginTop: '0.375rem' }}>
                      <a
                        href={complaint.attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <Download size={14} />
                        <span>Download Full Image ({complaint.attachment.originalName})</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--slate-50)',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <FileText size={24} color="var(--primary-600)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {complaint.attachment.originalName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {complaint.attachment.mimeType}
                      </div>
                    </div>
                    <a
                      href={complaint.attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resolution Details Display (if any) */}
          {complaint.resolutionDetails && (
            <div
              className="card"
              style={{
                backgroundColor: 'var(--success-bg)',
                borderColor: 'var(--success-border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} color="var(--success-main)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success-text)', margin: 0 }}>
                    Recorded Resolution
                  </h3>
                </div>
                <button
                  onClick={() => setIsResolveModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Edit Resolution
                </button>
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--success-text)', lineHeight: 1.5 }}>
                {complaint.resolutionDetails}
              </p>
              {complaint.resolvedAt && (
                <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', marginTop: '0.5rem', fontWeight: 600 }}>
                  Resolved timestamp: {formatDateTime(complaint.resolvedAt)}
                </div>
              )}
            </div>
          )}

          {/* Timeline & Audit Logs */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.375rem' }}>
              Full Audit Trail & Logs
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
              Verified lifecycle events, timestamped staff assignments, status transitions, and comments
            </p>

            <Timeline history={complaint.history} />

            {/* Add Admin Note Form */}
            <form
              onSubmit={handleAddComment}
              style={{
                marginTop: '1.5rem',
                borderTop: '1px solid var(--slate-100)',
                paddingTop: '1.25rem',
              }}
            >
              <label className="form-label" htmlFor="adminNote">
                Add Administrative Note / Update to Thread
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.375rem' }}>
                <input
                  id="adminNote"
                  type="text"
                  className="form-input"
                  placeholder="Type an internal remark, update for the student, or technician note..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading || !adminComment.trim()}
                >
                  <Send size={16} />
                  <span>Post Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Student & Assignment Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Student Profile Card */}
          <div className="card">
            <h4
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--slate-900)',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--slate-100)',
                paddingBottom: '0.5rem',
              }}
            >
              Student Information
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="avatar-circle" style={{ width: '42px', height: '42px' }}>
                {complaint.student?.fullName?.charAt(0) || 'S'}
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {complaint.student?.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  {complaint.student?.department || 'Student'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
                <Mail size={15} color="var(--slate-400)" />
                <a href={`mailto:${complaint.student?.email}`}>{complaint.student?.email}</a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
                <Hash size={15} color="var(--slate-400)" />
                <span>Roll No: {complaint.student?.studentId || 'N/A'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
                <MapPin size={15} color="var(--danger-main)" />
                <span>Issue Location: {complaint.location}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-700)' }}>
                <Calendar size={15} color="var(--slate-400)" />
                <span>Created: {formatDate(complaint.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Current Assignment Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                Operational Assignment
              </h4>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                Edit
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Assigned Department
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px', fontWeight: 600, color: 'var(--slate-800)' }}>
                  <Building size={16} color="var(--purple-main)" />
                  <span>{complaint.assignedDepartment?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Assigned Staff Member
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px', fontWeight: 600, color: 'var(--slate-800)' }}>
                  <User size={16} color="var(--info-main)" />
                  <span>{complaint.assignedStaff?.name || 'Unassigned'}</span>
                </div>
                {complaint.assignedStaff?.email && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginLeft: '1.375rem' }}>
                    {complaint.assignedStaff.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Change Status */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Complaint Status"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={actionLoading}>
              {actionLoading ? 'Updating...' : 'Save Status'}
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdateStatus}>
          <div className="form-group">
            <label className="form-label">Select New Status</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              required
            >
              {COMPLAINT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Audit Log Comment / Reason</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Technician dispatched to site for inspection..."
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              rows={3}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Change Priority */}
      <Modal
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        title="Update Complaint Priority"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsPriorityModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdatePriority} disabled={actionLoading}>
              {actionLoading ? 'Updating...' : 'Save Priority'}
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdatePriority}>
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select
              className="form-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              required
            >
              {COMPLAINT_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Audit Reason</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Escalated due to exam schedule..."
              value={priorityComment}
              onChange={(e) => setPriorityComment(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Assign Department & Staff */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Department & Staff Officer"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdateAssignment} disabled={actionLoading}>
              {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdateAssignment}>
          <div className="form-group">
            <label className="form-label">Responsible Department</label>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedStaff('');
              }}
            >
              <option value="">-- Select Department --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Responsible Staff Member</label>
            <select
              className="form-select"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
            >
              <option value="">-- Select Staff Officer --</option>
              {availableStaff.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.role || 'Staff'})
                </option>
              ))}
            </select>
            <span className="form-hint">Staff options automatically filter based on selected department.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Assignment Note</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Assigned to on-duty team for immediate resolution..."
              value={assignComment}
              onChange={(e) => setAssignComment(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Record Resolution */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Record Resolution & Close Ticket"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleUpdateResolution} disabled={actionLoading}>
              {actionLoading ? 'Recording...' : 'Submit Resolution'}
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdateResolution}>
          <div className="form-group">
            <label className="form-label">Resolution Details *</label>
            <textarea
              className="form-textarea"
              placeholder="Explain how the issue was resolved (e.g. Replaced switch port, cleaned drainage line, swapped projector bulb)..."
              value={resolutionDetails}
              onChange={(e) => setResolutionDetails(e.target.value)}
              rows={4}
              required
            />
            <span className="form-hint">This text will be clearly shown to the student.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Target Status</label>
            <select
              className="form-select"
              value={resolutionStatus}
              onChange={(e) => setResolutionStatus(e.target.value)}
            >
              <option value="Resolved">Resolved (Allows student to verify and close)</option>
              <option value="Closed">Closed Directly</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Audit Log Comment</label>
            <input
              type="text"
              className="form-input"
              placeholder="Optional remark for internal records..."
              value={resolveComment}
              onChange={(e) => setResolveComment(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminComplaintDetails;
