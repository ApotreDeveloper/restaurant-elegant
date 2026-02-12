
export const formatPrice = (amount: number): string => {
  const currency = localStorage.getItem('site-currency') || 'FCFA';
  const language = localStorage.getItem('site-language') || 'fr';
  const locale = language === 'en' ? 'en-US' : language === 'ar' ? 'ar' : 'fr-FR';

  return new Intl.NumberFormat(locale).format(amount) + ` ${currency}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  return timeStr;
};

export const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
