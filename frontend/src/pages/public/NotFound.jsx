import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const { user } = useAuth();
  const homePath = user?.role === 'admin' ? '/admin/dashboard' : user ? '/student/dashboard' : '/login';

  return (
    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: '480px', margin: '0 auto' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--primary-50)',
          color: 'var(--primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}
      >
        <FileQuestion size={40} />
      </div>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.75rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--slate-600)', fontSize: '0.9375rem', marginBottom: '2rem' }}>
        The page or resource you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>
      <Link to={homePath} className="btn btn-primary">
        <Home size={18} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
