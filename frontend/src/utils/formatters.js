import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return '—';
  try {
    return format(new Date(dateString), formatStr);
  } catch (err) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy • hh:mm a');
  } catch (err) {
    return dateString;
  }
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (err) {
    return dateString;
  }
};

export const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
