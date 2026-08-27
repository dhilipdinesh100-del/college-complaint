import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useNotification } from '../../context/NotificationContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Building,
  User,
  CheckCircle2,
  Send,
  Download,
  FileText,
  Archive,
  AlertTriangle,
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closingComplaint, setClosingComplaint] = useState(false);

  const { showSuccess, showError } = useNotification();

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaintById(id);
      if (res.success && res.data) {
        setComplaint(res.data);
      }
    } catch (err) {
      showError(err.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await complaintService.addComment(id, newComment.trim());
      if (res.success) {
        showSuccess('Comment added to complaint history');
        setNewComment('');
        fetchComplaintDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCloseComplaint = async () => {
    setClosingComplaint(true);
    try {
      const res = await complaintService.closeComplaint(id, 'Verified and closed by student');
      if (res.success) {
        showSuccess('Complaint closed successfully');
        setIsCloseModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      showError(err.message || 'Failed to close complaint');
    } finally {
      setClosingComplaint(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading complaint record..." />;
  }

  if (!complaint) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <AlertTriangle size={48} color="var(--warning-main)" style={{ margin: '0 auto 1rem' }} />
        <h3>Complaint Not Found</h3>
        <p style={{ color: 'var(--slate-500)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          This complaint does not exist or you do not have permission to view it.
        </p>
        <Link to="/student/complaints" className="btn btn-primary">
          Return to My Complaints
        </Link>
      </div>
    );
  }

  const isResolved = complaint.status === 'Resolved';
  const isClosed = complaint.status === 'Closed';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Status Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/student/complaints"
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
          <span>Back to My Complaints</span>
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
                  fontSize: '1.25rem',
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

          {/* Close Complaint Action if Resolved */}
          {isResolved && (
            <button
              onClick={() => setIsCloseModalOpen(true)}
              className="btn btn-success"
            >
              <CheckCircle2 size={18} />
              <span>Accept & Close Ticket</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Complaint Details & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Details Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-900)' }}>
              Issue Details
            </h3>

            <div
              style={{
                fontSize: '0.9375rem',
                color: 'var(--slate-700)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                backgroundColor: 'var(--slate-50)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-200)',
                marginBottom: '1.5rem',
              }}
            >
              {complaint.description}
            </div>

            {/* Attachment preview if exists */}
            {complaint.attachment && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>
                  Attached File / Evidence
                </h4>
                {complaint.attachment.mimeType?.startsWith('image/') ? (
                  <div>
                    <img
                      src={complaint.attachment.url}
                      alt={complaint.attachment.originalName || 'Attachment'}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '360px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--slate-200)',
                        objectFit: 'contain',
                        backgroundColor: '#ffffff',
                      }}
                    />
                    <div style={{ marginTop: '0.375rem' }}>
                      <a
                        href={complaint.attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex' }}
                      >
                        <Download size={14} />
                        <span>View Full Size ({complaint.attachment.originalName})</span>
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
                        {complaint.attachment.originalName || 'Attachment File'}
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

          {/* Resolution Details Card if Resolved or Closed */}
          {(complaint.resolutionDetails || isResolved || isClosed) && (
            <div
              className="card"
              style={{
                backgroundColor: 'var(--success-bg)',
                borderColor: 'var(--success-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={22} color="var(--success-main)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--success-text)', margin: 0 }}>
                  Official Resolution Notice
                </h3>
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--success-text)', lineHeight: 1.5 }}>
                {complaint.resolutionDetails || 'This issue has been addressed and marked as resolved by the administration.'}
              </p>
              {complaint.resolvedAt && (
                <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', marginTop: '0.75rem', fontWeight: 600 }}>
                  Resolved on: {formatDateTime(complaint.resolvedAt)}
                </div>
              )}
            </div>
          )}

          {/* Chronological Audit Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
              Activity & Status History
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
              Full chronological audit trail of all staff assignments, status transitions, and notes
            </p>

            <Timeline history={complaint.history} />

            {/* Add Comment Form */}
            {!isClosed && (
              <form onSubmit={handleAddComment} style={{ marginTop: '1.5rem', borderTop: '1px solid var(--slate-100)', paddingTop: '1.25rem' }}>
                <label className="form-label" htmlFor="comment">
                  Add Comment or Information
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.375rem' }}>
                  <input
                    id="comment"
                    type="text"
                    className="form-input"
                    placeholder="Provide additional details or response to administration..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingComment || !newComment.trim()}
                  >
                    <Send size={16} />
                    <span>{submittingComment ? 'Posting...' : 'Post'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Metadata Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
              Ticket Information
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Category
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px', fontWeight: 600, color: 'var(--slate-800)' }}>
                  <Tag size={15} color="var(--primary-600)" />
                  <span>{complaint.category}</span>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Location
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px', fontWeight: 600, color: 'var(--slate-800)' }}>
                  <MapPin size={15} color="var(--danger-main)" />
                  <span>{complaint.location}</span>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Assigned Department
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px', fontWeight: 600, color: 'var(--slate-800)' }}>
                  <Building size={15} color="var(--purple-main)" />
                  <span>{complaint.assignedDepartment?.name || 'Pending Review'}</span>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Assigned Staff Officer
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px', fontWeight: 600, color: 'var(--slate-800)' }}>
                  <User size={15} color="var(--info-main)" />
                  <span>{complaint.assignedStaff?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem' }}>
                <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Submitted On
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px', color: 'var(--slate-600)' }}>
                  <Calendar size={15} />
                  <span>{formatDateTime(complaint.createdAt)}</span>
                </div>
              </div>

              {complaint.closedAt && (
                <div>
                  <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Closed On
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px', color: 'var(--slate-600)' }}>
                    <Archive size={15} />
                    <span>{formatDateTime(complaint.closedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close Confirmation Modal */}
      <ConfirmationModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseComplaint}
        title="Confirm Ticket Closure"
        message="Are you satisfied with the resolution provided? Closing this ticket indicates the problem has been solved to your satisfaction."
        confirmText="Confirm & Close"
        loading={closingComplaint}
      />
    </div>
  );
};

export default ComplaintDetails;
