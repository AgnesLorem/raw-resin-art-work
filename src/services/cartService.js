/**
 * cartService.js — localStorage-backed cart & voucher management.
 * All cart mutations go through here; components only call these functions.
 */
import { VOUCHERS } from './priceService.js';

const CART_KEY = 'raw_cart_v1';
const VOUCHER_KEY = 'raw_voucher_v1';

function emitUpdate() {
  window.dispatchEvent(new Event('cart-updated'));
}

/** @returns {Array} cartItems */
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  emitUpdate();
}

/**
 * Add a product to cart. If same product+options combo exists, increment quantity.
 * @param {Object} product
 * @param {string[]} selectedOptions
 * @param {number} quantity
 * @param {string} customizationNote
 */
export function addToCart(product, selectedOptions = [], quantity = 1, customizationNote = '') {
  const cart = getCart();
  const sortedOpts = [...selectedOptions].sort();
  const key = `${product.id}__${sortedOpts.join('|')}`;
  const existing = cart.find((item) => item.key === key);
  if (existing) {
    existing.quantity += quantity;
    if (customizationNote && !existing.customizationNote) {
      existing.customizationNote = customizationNote;
    }
  } else {
    cart.push({
      key,
      product,
      selectedOptions: sortedOpts,
      quantity,
      customizationNote: customizationNote || '',
    });
  }
  saveCart(cart);
}

/**
 * Update personal resin customization note for a specific cart item.
 * @param {string} key
 * @param {string} note
 */
export function updateItemCustomization(key, note) {
  const cart = getCart();
  const item = cart.find((i) => i.key === key);
  if (item) {
    item.customizationNote = note;
    saveCart(cart);
  }
}

/**
 * Remove an item by its key.
 * @param {string} key
 */
export function removeFromCart(key) {
  saveCart(getCart().filter((item) => item.key !== key));
}

/**
 * Update quantity of a cart item.
 * @param {string} key
 * @param {number} quantity
 */
export function updateQuantity(key, quantity) {
  const cart = getCart();
  const item = cart.find((i) => i.key === key);
  if (item) {
    if (quantity <= 0) {
      removeFromCart(key);
    } else {
      item.quantity = quantity;
      saveCart(cart);
    }
  }
}

/** Clear the entire cart and applied vouchers. */
export function clearCart() {
  saveCart([]);
  removeVoucher();
}

/** Get currently applied voucher code from localStorage */
export function getAppliedVoucher() {
  try {
    return localStorage.getItem(VOUCHER_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Apply a voucher code.
 * @param {string} code
 * @returns {{ success: boolean, message: string, voucher?: Object }}
 */
export function applyVoucher(code) {
  if (!code || typeof code !== 'string') {
    return { success: false, message: 'Vui lòng nhập mã ưu đãi.' };
  }
  const cleanCode = code.trim().toUpperCase();
  const voucher = VOUCHERS[cleanCode];
  if (!voucher) {
    return { success: false, message: 'Mã ưu đãi không hợp lệ hoặc đã hết hạn.' };
  }
  try {
    localStorage.setItem(VOUCHER_KEY, cleanCode);
    emitUpdate();
    return { success: true, message: `Áp dụng thành công: ${voucher.label}`, voucher };
  } catch {
    return { success: false, message: 'Không thể lưu mã ưu đãi.' };
  }
}

/** Remove the applied voucher */
export function removeVoucher() {
  try {
    localStorage.removeItem(VOUCHER_KEY);
    emitUpdate();
  } catch {}
}
