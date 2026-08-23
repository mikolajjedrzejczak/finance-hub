import { describe, expect, it } from 'vitest';
import { roundMoney } from '../money.utils';

describe('roundMoney', () => {
  describe('Eliminacja błędu IEE754', () => {
    it('Poprawne zaokrąglenie 1.005 w górę do 1.01', () => {
      expect(roundMoney(1.005)).toBe(1.01);
      expect(roundMoney('1.005')).toBe(1.01);
    });
  });

  it('Poprawne zaokrąglenie 35.855 w górę do 35.86', () => {
    expect(roundMoney(35.855)).toBe(35.86);
    expect(roundMoney('35.855')).toBe(35.86);
  });

  it('radzi sobie z dodawaniem 0.1 + 0.2', () => {
    const sum = 0.1 + 0.2;
    expect(roundMoney(sum)).toBe(0.3);
  });
});
