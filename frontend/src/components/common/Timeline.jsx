import React from 'react';
import { formatDateTime } from '../../utils/formatters';
import StatusBadge from './StatusBadge';
import { User, ShieldCheck } from 'lucide-react';

const Timeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '1rem', color: 'var(--slate-500)', fontSize: '0.875rem' }}>
        No history records found.
      </div>
    );
  }

  return (
    <div className="timeline">
      {history.map((item, index) => {
        const isLatest = index === history.length - 1;
        const actorName = item.updatedBy?.fullName || 'System';
        const actorRole = item.updatedBy?.role === 'admin' ? 'Admin' : 'Student';

        return (
          <div key={item._id || index} className="timeline-item">
            <div
              className="timeline-dot"
              style={{
                backgroundColor: isLatest ? 'var(--primary-600)' : 'var(--slate-400)',
                boxShadow: isLatest
                  ? '0 0 0 3px var(--primary-100)'
                  : '0 0 0 2px var(--slate-200)',
              }}
            />
            <div className="timeline-content">
              <div className="timeline-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="timeline-title">{item.action || 'Status Update'}</span>
                  {item.status && <StatusBadge status={item.status} />}
                </div>
                <span className="timeline-date">{formatDateTime(item.createdAt)}</span>
              </div>

              {item.comment && <div className="timeline-body">{item.comment}</div>}

              <div className="timeline-actor" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {actorRole === 'Admin' ? (
                  <ShieldCheck size={14} color="var(--primary-600)" />
                ) : (
                  <User size={14} color="var(--slate-500)" />
                )}
                <span>
                  Updated by <strong>{actorName}</strong> ({actorRole})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
