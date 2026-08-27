import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import {
  ListOrdered,
  Clock,
  PlayCircle,
  CheckCircle,
  Archive,
  AlertOctagon,
  Building2,
  Users,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStatistics();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admin statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real-time campus statistics..." />;
  }

  if (error) {
    return (
      <div className="card" style={{ borderColor: 'var(--danger-border)', backgroundColor: 'var(--danger-bg)' }}>
        <div style={{ color: 'var(--danger-text)' }}>
          <strong>Error loading dashboard:</strong> {error}
        </div>
      </div>
    );
  }

  const { summary, counts, byCategory, byDepartment, recentComplaints } = stats || {};

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Administrative Command Center
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            Live aggregated metrics and operations across campus facilities and grievance queues
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchStats} className="btn btn-secondary btn-sm">
            <RefreshCw size={16} />
            <span>Refresh Analytics</span>
          </button>
          <Link to="/admin/complaints" className="btn btn-primary btn-sm">
            <ListOrdered size={16} />
            <span>Manage All Complaints</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Complaints"
          value={summary?.total}
          icon={ListOrdered}
          color="var(--primary-600)"
          bg="var(--primary-50)"
          subtext={`${summary?.active || 0} active tickets`}
        />
        <StatCard
          title="Pending Review"
          value={summary?.submitted}
          icon={Clock}
          color="var(--warning-main)"
          bg="var(--warning-bg)"
          subtext="Awaiting initial assignment"
        />
        <StatCard
          title="In Progress"
          value={(summary?.assigned || 0) + (summary?.inProgress || 0)}
          icon={PlayCircle}
          color="var(--info-main)"
          bg="var(--info-bg)"
          subtext={`${summary?.assigned || 0} assigned, ${summary?.inProgress || 0} active`}
        />
        <StatCard
          title="Critical Issues"
          value={summary?.critical}
          icon={AlertOctagon}
          color="var(--danger-main)"
          bg="var(--danger-bg)"
          subtext="Urgent resolution required"
        />
        <StatCard
          title="Resolved & Closed"
          value={(summary?.resolved || 0) + (summary?.closed || 0)}
          icon={CheckCircle}
          color="var(--success-main)"
          bg="var(--success-bg)"
          subtext={`${summary?.resolutionRate || 0}% overall resolution rate`}
        />
        <StatCard
          title="Students Registered"
          value={counts?.students}
          icon={GraduationCap}
          color="var(--purple-main)"
          bg="var(--purple-bg)"
          subtext={`${counts?.departments || 0} depts • ${counts?.staff || 0} staff`}
        />
      </div>

      {/* Breakdown Section: Categories & Departments */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Category Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-900)' }}>
            Complaints by Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {byCategory && byCategory.length > 0 ? (
              byCategory.map((item) => {
                const percentage = summary?.total
                  ? Math.round((item.count / summary.total) * 100)
                  : 0;
                return (
                  <div key={item.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
                        {item.category}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        backgroundColor: 'var(--slate-100)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: 'var(--primary-600)',
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Assigned by Department
            </h3>
            <Link to="/admin/departments" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Manage
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {byDepartment && byDepartment.length > 0 ? (
              byDepartment.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--slate-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-100)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Building2 size={18} color="var(--purple-main)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                      {item.name}
                    </span>
                  </div>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'var(--purple-bg)',
                      color: 'var(--purple-text)',
                      fontWeight: 700,
                    }}
                  >
                    {item.count} tickets
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                No department assignments yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Recent Submissions Requiring Attention
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              Latest tickets logged by students across all departments
            </p>
          </div>
          <Link
            to="/admin/complaints"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <span>View all ({summary?.total || 0})</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Student</th>
                <th>Title & Category</th>
                <th>Priority</th>
                <th>Assigned Dept</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'right' }}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints && recentComplaints.length > 0 ? (
                recentComplaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: 'var(--primary-600)',
                        }}
                      >
                        {c.complaintNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                        {c.student?.fullName || 'Student'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {c.student?.studentId || c.student?.department || 'General'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {c.category}
                      </div>
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--slate-700)' }}>
                        {c.assignedDepartment?.name || 'Unassigned'}
                      </span>
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
                        to={`/admin/complaints/${c._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                    No complaints registered in the system yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
