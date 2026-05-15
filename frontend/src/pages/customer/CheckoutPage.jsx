import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, User, CreditCard, Banknote, Loader2, AlertCircle } from 'lucide-react'
import useCartStore from '../../store/useCartStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function CheckoutPage() {
  const { items, tableNumber, getTotalAmount, clearCart, setTableNumber } = useCartStore()
  const [form, setForm] = useState({
    table_number: tableNumber || '',
    customer_name: '',
    payment_method: 'cash',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const total = getTotalAmount()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 font-medium mb-4">Keranjang kosong</p>
          <Link to="/menu" className="btn-primary">Kembali ke Menu</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.table_number) { toast.error('Nomor meja wajib diisi'); return }
    setError('')
    setLoading(true)

    const orderPayload = {
      table_number: form.table_number,
      customer_name: form.customer_name,
      payment_method: form.payment_method,
      notes: form.notes,
      items: items.map(i => ({ menu_id: i.id, quantity: i.quantity })),
    }

    try {
      const { data } = await api.post('/orders', orderPayload)
      if (data.success) {
        const orderId = data.data.id
        clearCart()

        if (form.payment_method === 'online') {
          navigate(`/payment/${orderId}`)
        } else {
          toast.success('Pesanan berhasil dibuat! 🎉')
          navigate(`/order/${orderId}`)
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal membuat pesanan'
      const shortages = err.response?.data?.shortages
      if (shortages?.length > 0) {
        setError(`Stok tidak mencukupi: ${shortages.map(s => `${s.ingredient} (tersedia: ${s.available})`).join(', ')}`)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={22} className="text-gray-700" />
          </Link>
          <h1 className="font-bold text-gray-800 text-lg">Checkout</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-32">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Order summary */}
        <div className="card p-4">
          <h2 className="font-bold text-gray-800 mb-3">Ringkasan Pesanan</h2>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} <span className="text-gray-400 font-medium">×{item.quantity}</span></span>
                <span className="font-semibold">{formatRupiah(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary-800">{formatRupiah(total)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Table number */}
          <div className="card p-4">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-primary-700" /> Informasi Meja
            </h2>
            <div>
              <label className="label-text">Nomor Meja *</label>
              <input
                type="text"
                value={form.table_number}
                onChange={e => { setForm({...form, table_number: e.target.value}); setTableNumber(e.target.value) }}
                placeholder="Contoh: 5"
                className="input-field"
                required
              />
              {!tableNumber && <p className="text-xs text-amber-600 mt-1">💡 Scan QR di meja untuk mengisi otomatis</p>}
            </div>
          </div>

          {/* Customer info */}
          <div className="card p-4">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <User size={18} className="text-primary-700" /> Informasi Pelanggan
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label-text">Nama (opsional)</label>
                <input type="text" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} placeholder="Nama kamu" className="input-field" />
              </div>
              <div>
                <label className="label-text">Catatan (opsional)</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Contoh: tanpa gula, ekstra es..." className="input-field resize-none" rows={2} />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="card p-4">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-primary-700" /> Metode Pembayaran
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({...form, payment_method: 'cash'})}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${form.payment_method === 'cash' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <Banknote size={28} className={form.payment_method === 'cash' ? 'text-primary-700' : 'text-gray-400'} />
                <div className="text-center">
                  <p className={`font-bold text-sm ${form.payment_method === 'cash' ? 'text-primary-800' : 'text-gray-600'}`}>Bayar Cash</p>
                  <p className="text-xs text-gray-500 mt-0.5">Bayar ke kasir</p>
                </div>
                {form.payment_method === 'cash' && <div className="w-5 h-5 bg-primary-700 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
              </button>

              <button
                type="button"
                onClick={() => setForm({...form, payment_method: 'online'})}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${form.payment_method === 'online' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <CreditCard size={28} className={form.payment_method === 'online' ? 'text-primary-700' : 'text-gray-400'} />
                <div className="text-center">
                  <p className={`font-bold text-sm ${form.payment_method === 'online' ? 'text-primary-800' : 'text-gray-600'}`}>Bayar Online</p>
                  <p className="text-xs text-gray-500 mt-0.5">Transfer / QRIS</p>
                </div>
                {form.payment_method === 'online' && <div className="w-5 h-5 bg-primary-700 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-xl p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Total Pembayaran</span>
            <span className="font-bold text-primary-800 text-lg">{formatRupiah(total)}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Memproses...' : form.payment_method === 'online' ? '💳 Bayar Online' : '📋 Buat Pesanan'}
          </button>
        </div>
      </div>
    </div>
  )
}
