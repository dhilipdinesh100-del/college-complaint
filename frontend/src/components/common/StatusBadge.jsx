import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';
import { Clock, Eye, UserCheck, PlayCircle, CheckCircle, Archive } from 'lucide-react';

const getStatusIcon = (status) => {
  switch (status) {
    case 'Submitted':
      return <Clock size={13} />;
    case 'Under Review':
      return <Eye size={13} />;
    case 'Assigned':
      return <UserCheck size={13} />;
    case 'In Progress':
      return <PlayCircle size={13} />;
    case 'Resolved':
      return <CheckCircle size={13} />;
    case 'Closed':
      return <Archive size={13} />;
    default:
      return <Clock size={13} />;
  }
};

const StatusBadge = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'badge-submitted';

  return (
    <span className={`badge ${colorClass}`}>
      {getStatusIcon(status)}
      <span>{status || 'Unknown'}</span>
    </span>
  );
};

export default StatusBadge;
