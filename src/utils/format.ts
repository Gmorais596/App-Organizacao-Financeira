export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(value).replace('$', 'AUD $');
};
