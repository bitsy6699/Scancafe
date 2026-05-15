import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: '',

      setTableNumber: (table) => set({ tableNumber: table }),

      addItem: (menu) => {
        const items = get().items
        const existing = items.find(i => i.id === menu.id)
        if (existing) {
          set({ items: items.map(i => i.id === menu.id ? { ...i, quantity: i.quantity + 1 } : i) })
        } else {
          set({ items: [...items, { ...menu, quantity: 1 }] })
        }
      },

      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter(i => i.id !== id) })
        } else {
          set({ items: get().items.map(i => i.id === id ? { ...i, quantity } : i) })
        }
      },

      clearCart: () => set({ items: [] }),

      getTotalAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'scancafe-cart' }
  )
)

export default useCartStore
