/**
 * priceService.js — All price logic lives here.
 * Components import these helpers; no raw arithmetic in JSX.
 */

/**
 * Format a number to Vietnamese currency string.
 * @param {number} amount
 * @returns {string} e.g. "55.000đ"
 */
export function formatVnd(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '—'
  return amount.toLocaleString('vi-VN') + 'đ'
}

/**
 * Calculate total price for a single product with selected options.
 * @param {Object} product
 * @param {string[]} selectedOptionNames - array of option name strings
 * @param {number} quantity
 * @returns {number}
 */
export function calculateProductTotal(product, selectedOptionNames = [], quantity = 1) {
  const optionsDelta = (product.options ?? [])
    .filter((opt) => selectedOptionNames.includes(opt.name))
    .reduce((sum, opt) => sum + opt.priceDeltaVnd, 0)
  return (product.priceVnd + optionsDelta) * quantity
}

/**
 * Calculate grand total from cart items array.
 * Each cart item: { product, selectedOptions: string[], quantity }
 * @param {Array} cartItems
 * @returns {number}
 */
export function calculateCartTotal(cartItems) {
  return cartItems.reduce(
    (sum, item) => sum + calculateProductTotal(item.product, item.selectedOptions, item.quantity),
    0
  )
}
