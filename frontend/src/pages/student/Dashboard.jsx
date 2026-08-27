import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import {
  FilePlus,
  ListOrdered,
  Clock,
  PlayCircle,
  CheckCircle,
  Archive,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentComplaints();
  }, []);

  const fetchStudentComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaints({ limit: 100 });
      if (res.success) {
        setComplaints(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="card" style={{ borderColor: 'var(--danger-border)', backgroundColor: 'var(--danger-bg)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger-text)' }}>
          <AlertCircle size={24} />
          <div>
            <strong>Unable to load dashboard data</strong>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate student statistics
  const total = complaints.length;
  const submitted = complaints.filter((c) => c.status === 'Submitted').length;
  const underReview = complaints.filter((c) => c.status === 'Under Review').length;
  const inProgress = complaints.filter((c) => ['Assigned', 'In Progress'].includes(c.status)).length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const closed = complaints.filter((c) => c.status === 'Closed').length;

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          marginBottom: '2rem',
          border: 'none',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {user?.department || 'Student Portal'}
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.75rem' }}>
              Welcome back, {user?.fullName}!
            </h1>
            <p style={{ color: 'var(--primary-100)', fontSize: '0.9375rem', marginTop: '0.375rem', maxWidth: '600px' }}>
              Submit campus issues, track maintenance progress in real-time, and view official resolution updates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/student/complaints/new"
              className="btn"
              style={{ backgroundColor: '#ffffff', color: 'var(--primary-700)', fontWeight: 700 }}
            >
              <FilePlus size={18} />
              <span>Submit Complaint</span>
            </Link>
            <Link
              to="/student/complaints"
              className="btn btn-secondary"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}
            >
              <ListOrdered size={18} />
              <span>View All ({total})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Statistics Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Complaints"
          value={total}
          icon={ListOrdered}
          color="var(--primary-600)"
          bg="var(--primary-50)"
        />
        <StatCard
          title="Pending / Submitted"
          value={submitted}
          icon={Clock}
          color="var(--slate-600)"
          bg="var(--slate-100)"
        />
        <StatCard
          title="Under Review"
          value={underReview}
          icon={ShieldAlert}
          color="var(--warning-main)"
          bg="var(--warning-bg)"
        />
        <StatCard
          title="In Progress / Assigned"
          value={inProgress}
          icon={PlayCircle}
          color="var(--info-main)"
          bg="var(--info-bg)"
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle}
          color="var(--success-main)"
          bg="var(--success-bg)"
        />
        <StatCard
          title="Closed"
          value={closed}
          icon={Archive}
          color="var(--slate-500)"
          bg="var(--slate-100)"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Recent Complaints
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              Your latest submitted requests and current resolution states
            </p>
          </div>
          {complaints.length > 0 && (
            <Link
              to="/student/complaints"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <span>View all</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {recentComplaints.length === 0 ? (
          <EmptyState
            title="No complaints filed yet"
            description="You have not submitted any complaints. If you have an issue regarding campus facilities, Wi-Fi, or academics, submit a complaint."
            action={
              <Link to="/student/complaints/new" className="btn btn-primary">
                <FilePlus size={18} />
                <span>Submit Your First Complaint</span>
              </Link>
            }
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title & Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-600)' }}>
                        {c.complaintNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{c.category}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                        {c.location}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                        {formatDate(c.createdAt)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/student/complaints/${c._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
