import { format, formatDistanceToNow, isValid } from 'date-fns';

export function formatDate(dateString?: string | number | Date): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (!isValid(date)) return 'Invalid Date';
  return format(date, 'MMM d, yyyy HH:mm:ss');
}

export function formatTimeOnly(dateString?: string | number | Date): string {
  if (!dateString) return '--:--:--';
  const date = new Date(dateString);
  if (!isValid(date)) return '--:--:--';
  return format(date, 'HH:mm:ss');
}

export function formatRelativeTime(dateString?: string | number | Date): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  if (!isValid(date)) return 'Unknown';
  return formatDistanceToNow(date, { addSuffix: true });
}

