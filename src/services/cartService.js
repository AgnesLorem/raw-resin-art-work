/**
 * cartService.js — localStorage-backed cart management.
 * All cart mutations go through here; components only call these functions.
 * Future: swap this with an API service without touching component code.
 */

const CART_KEY = 'raw_cart_v1'

function emitUpdate() {
  window.dispatchEvent(new Event('cart-updated'))
}

/** @returns {Array} cartItems */
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) ?? []
  } catch {
    return []
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  emitUpdate()
}

/**
 * Add a product to cart. If same product+options combo exists, increment quantity.
 * @param {Object} product
 * @param {string[]} selectedOptions
 * @param {number} quantity
 */
export function addToCart(product, selectedOptions = [], quantity = 1) {
  const cart = getCart()
  const key = `${product.id}__${selectedOptions.sort().join('|')}`
  const existing = cart.find((item) => item.key === key)
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ key, product, selectedOptions, quantity })
  }
  saveCart(cart)
}

/**
 * Remove an item by its key.
 * @param {string} key
 */
export function removeFromCart(key) {
  saveCart(getCart().filter((item) => item.key !== key))
}

/**
 * Update quantity of a cart item.
 * @param {string} key
 * @param {number} quantity
 */
export function updateQuantity(key, quantity) {
  const cart = getCart()
  const item = cart.find((i) => i.key === key)
  if (item) {
    if (quantity <= 0) {
      removeFromCart(key)
    } else {
      item.quantity = quantity
      saveCart(cart)
    }
  }
}

/** Clear the entire cart. */
export function clearCart() {
  saveCart([])
}
