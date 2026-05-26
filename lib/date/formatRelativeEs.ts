import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatRelativeEs = (iso: string): string =>
  formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
