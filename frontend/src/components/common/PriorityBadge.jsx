import React from 'react';
import { PRIORITY_COLORS } from '../../utils/constants';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'Critical':
      return <AlertCircle size={13} color="#b91c1c" />;
    case 'High':
      return <ArrowUp size={13} color="#c2410c" />;
    case 'Medium':
      return <AlertTriangle size={13} color="#92400e" />;
    case 'Low':
      return <ArrowDown size={13} color="#475569" />;
    default:
      return null;
  }
};

const PriorityBadge = ({ priority }) => {
  const colorClass = PRIORITY_COLORS[priority] || 'priority-medium';

  return (
    <span className={`badge ${colorClass}`}>
      {getPriorityIcon(priority)}
      <span>{priority || 'Medium'}</span>
    </span>
  );
};

export default PriorityBadge;
