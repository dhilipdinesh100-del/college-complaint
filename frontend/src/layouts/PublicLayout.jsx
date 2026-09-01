import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--slate-100)' }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--slate-200)',
          padding: 'clamp(0.75rem, 2vw, 1.5rem) clamp(1rem, 4vw, 2rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
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
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.1 }}>
              Campus<span style={{ color: 'var(--primary-600)' }}>Resolve</span>
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              College Complaint Management
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Student Register
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1rem, 4vw, 2rem)' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: 'clamp(1rem, 2vw, 1.5rem)',
          fontSize: '0.8125rem',
          color: 'var(--slate-500)',
          borderTop: '1px solid var(--slate-200)',
          backgroundColor: '#ffffff',
        }}
      >
        © {new Date().getFullYear()} CampusResolve. Centralized Campus Complaint & Grievance Resolution Portal.
      </footer>
    </div>
  );
};

export default PublicLayout;
