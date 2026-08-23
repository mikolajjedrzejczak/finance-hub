import { Decimal } from 'decimal.js';

export const roundMoney = (amount: number | string): number => {
  return new Decimal(amount)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toNumber();
};

export const formatMoneyForCsv = (
  amount: number | string | Decimal,
): string => {
  return roundMoney(amount.toString()).toFixed(2).replace('.', ',');
};

export function formatCurrency(value: number): string {
  return (
    new Intl.NumberFormat('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' PLN'
  );
}
