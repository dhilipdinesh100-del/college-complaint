import React from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'var(--primary-600)',
  bg = 'var(--primary-50)',
  subtext,
  onClick,
}) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-icon-wrapper" style={{ backgroundColor: bg, color: color }}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <span className="stat-value">{value !== undefined ? value : '—'}</span>
        <span className="stat-label">{title}</span>
        {subtext && (
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
