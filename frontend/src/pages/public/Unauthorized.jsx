import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Home } from 'lucide-react';

const Unauthorized = () => {
  const { user } = useAuth();
  const homePath = user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: '480px', margin: '0 auto' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}
      >
        <ShieldAlert size={40} />
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
        Access Restricted
      </h1>
      <p style={{ color: 'var(--slate-600)', fontSize: '0.9375rem', marginBottom: '2rem' }}>
        You do not have administrative permission to view this section. Please return to your authorized portal.
      </p>
      <Link to={homePath} className="btn btn-primary">
        <Home size={18} />
        <span>Go to Your Portal</span>
      </Link>
    </div>
  );
};

export default Unauthorized;
