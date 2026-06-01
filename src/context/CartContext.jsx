import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [lastOrder, setLastOrder] = useState(null)

  const addItem = (item) => {
    const cartItem = { ...item, cartId: `${item.id}-${Date.now()}` }
    setItems((current) => [...current, cartItem])
  }

  const removeItem = (cartId) => {
    setItems((current) => current.filter((item) => item.cartId !== cartId))
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items])
  const tax = 0
  const total = subtotal + tax

  const createOrder = (customer, paymentMethod) => {
    const order = {
      id: `KG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      customer,
      paymentMethod,
      items,
      subtotal,
      tax,
      total,
      createdAt: new Date().toISOString(),
    }
    setLastOrder(order)
    clearCart()
    return order
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, subtotal, tax, total, createOrder, lastOrder }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
