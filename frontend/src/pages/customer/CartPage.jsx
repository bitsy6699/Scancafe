import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Coffee } from 'lucide-react'
import useCartStore from '../../store/useCartStore'

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalAmount, tableNumber } = useCartStore()
  const total = getTotalAmount()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={tableNumber ? `/menu?table=${tableNumber}` : '/menu'} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={22} className="text-gray-700" />
          </Link>
          <h1 className="font-bold text-gray-800 text-lg">Keranjang Pesanan</h1>
          {tableNumber && <span className="ml-auto text-sm font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full">Meja {tableNumber}</span>}
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <ShoppingCart size={64} className="text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium text-lg">Keranjang masih kosong</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Tambahkan menu favoritmu!</p>
            <Link to={tableNumber ? `/menu?table=${tableNumber}` : '/menu'} className="btn-primary flex items-center gap-2">
              <Coffee size={18} /> Lihat Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="card flex gap-3 p-3">
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  {item.image_url ? (
                    <img src={`${API_BASE}${item.image_url}`} alt={item.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Coffee size={22} className="text-gray-300" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                  <p className="text-primary-700 font-bold text-sm">{formatRupiah(item.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-primary-800 text-white rounded-full flex items-center justify-center active:scale-90 transition-transform">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-primary-800 text-white rounded-full flex items-center justify-center active:scale-90 transition-transform">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800 text-sm">{formatRupiah(item.price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors active:scale-90">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Total card */}
            <div className="card p-4 bg-primary-50 border border-primary-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Subtotal ({items.reduce((s,i)=>s+i.quantity,0)} item)</span>
                <span className="font-bold text-primary-800 text-lg">{formatRupiah(total)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Belum termasuk pajak & biaya layanan</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom checkout bar */}
      {items.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-xl p-4 max-w-2xl mx-auto w-full">
          <Link to="/checkout">
            <button className="btn-primary w-full flex items-center justify-between">
              <span>Lanjut ke Checkout</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{formatRupiah(total)}</span>
              </div>
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
