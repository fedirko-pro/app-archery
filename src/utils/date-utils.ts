import { format, parseISO, isValid, subDays } from 'date-fns';

export const formatDate = (
  dateString: string | Date,
  formatString: string = 'PPP',
): string => {
  try {
    const date =
      typeof dateString === 'string' ? parseISO(dateString) : dateString;

    if (!isValid(date)) {
      return 'Invalid date';
    }

    return format(date, formatString);
  } catch {
    return 'Invalid date';
  }
};

export const formatShortDate = (dateString: string | Date): string => {
  return formatDate(dateString, 'MM/dd/yyyy');
};

export const formatDateTime = (dateString: string | Date): string => {
  return formatDate(dateString, 'PPP p');
};

export const getApplicationDeadline = (startDate: string | Date): Date => {
  const date = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  return subDays(date, 5);
};
