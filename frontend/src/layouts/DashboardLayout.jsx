import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  ListOrdered,
  Building2,
  Users,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
   navigate("/college-complaint/login")
  };

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/complaints/new', label: 'Submit Complaint', icon: FilePlus },
    { to: '/student/complaints', label: 'My Complaints', icon: ListOrdered },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'All Complaints', icon: ListOrdered },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/staff', label: 'Staff Management', icon: Users },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('complaints/new')) return 'Submit New Complaint';
    if (path.includes('complaints') && path.split('/').length > 3) return 'Complaint Details';
    if (path.includes('complaints')) return isAdmin ? 'Complaint Management' : 'My Complaints';
    if (path.includes('departments')) return 'Department Directory';
    if (path.includes('staff')) return 'Staff Directory & Roster';
    if (path.includes('profile')) return 'Student Profile';
    return 'Campus Portal';
  };

  return (
    <div className="app-layout">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 35,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isAdmin ? <ShieldCheck size={20} /> : <GraduationCap size={20} />}
          </div>
          <div>
            <div className="sidebar-brand">
              Campus<span>Resolve</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)', fontWeight: 600, textTransform: 'uppercase' }}>
              {isAdmin ? 'Admin Administration' : 'Student Portal'}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge" style={{ marginBottom: '1rem' }}>
            <div className="avatar-circle">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.fullName || 'User'}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--slate-400)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.email}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'var(--slate-800)', borderColor: 'var(--slate-700)', color: 'var(--slate-300)' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', padding: '6px' }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {getPageTitle()}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              className="badge"
              style={{
                backgroundColor: isAdmin ? 'var(--purple-bg)' : 'var(--primary-50)',
                color: isAdmin ? 'var(--purple-text)' : 'var(--primary-700)',
                border: `1px solid ${isAdmin ? 'var(--purple-border)' : 'var(--primary-200)'}`,
                textTransform: 'uppercase',
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              {isAdmin ? 'Admin' : 'Student'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                {user?.fullName?.split(' ')[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
