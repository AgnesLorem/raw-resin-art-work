/**
 * priceService.js — All price logic lives here.
 * Components import these helpers; no raw arithmetic in JSX.
 */

export const VOUCHERS = {
  RAWWELCOME: { code: 'RAWWELCOME', type: 'percent', value: 10, label: 'Giảm 10% đơn hàng chào bạn mới' },
  FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 100, label: 'Miễn phí vận chuyển toàn quốc' },
  RESINLOVE: { code: 'RESINLOVE', type: 'fixed', value: 20000, label: 'Giảm 20.000đ cho tín đồ resin' },
};

/**
 * Format a number to Vietnamese currency string.
 * @param {number} amount
 * @returns {string} e.g. "55.000đ"
 */
export function formatVnd(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '0đ';
  return amount.toLocaleString('vi-VN') + 'đ';
}

/**
 * Calculate total price for a single product with selected options.
 * @param {Object} product
 * @param {string[]} selectedOptionNames - array of option name strings
 * @param {number} quantity
 * @returns {number}
 */
export function calculateProductTotal(product, selectedOptionNames = [], quantity = 1) {
  if (!product) return 0;
  const optionsDelta = (product.options ?? [])
    .filter((opt) => selectedOptionNames.includes(opt.name))
    .reduce((sum, opt) => sum + opt.priceDeltaVnd, 0);
  return (product.priceVnd + optionsDelta) * quantity;
}

/**
 * Calculate grand total from cart items array.
 * Each cart item: { product, selectedOptions: string[], quantity }
 * @param {Array} cartItems
 * @returns {number}
 */
export function calculateCartTotal(cartItems = []) {
  return cartItems.reduce(
    (sum, item) => sum + calculateProductTotal(item.product, item.selectedOptions, item.quantity),
    0
  );
}

/**
 * Calculate standard shipping fee based on subtotal and delivery region.
 * Orders >= 250,000 VND qualify for free shipping.
 * @param {number} subtotal
 * @param {string} region ('can_tho' | 'nationwide')
 * @returns {number}
 */
export function calculateShippingFee(subtotal, region = 'can_tho') {
  if (subtotal >= 250000) return 0;
  return region === 'can_tho' ? 15000 : 30000;
}

/**
 * Calculate discount amount from an applied voucher.
 * @param {number} subtotal
 * @param {string} voucherCode
 * @param {number} shippingFee
 * @returns {number}
 */
export function calculateDiscount(subtotal, voucherCode, shippingFee = 0) {
  if (!voucherCode || typeof voucherCode !== 'string') return 0;
  const v = VOUCHERS[voucherCode.trim().toUpperCase()];
  if (!v) return 0;
  if (v.type === 'percent') return Math.round((subtotal * v.value) / 100);
  if (v.type === 'fixed') return Math.min(v.value, subtotal);
  if (v.type === 'shipping') return shippingFee;
  return 0;
}
