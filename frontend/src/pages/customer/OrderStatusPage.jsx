import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Clock, Coffee, Utensils, Package, XCircle, RefreshCw, Home } from 'lucide-react'
import api from '../../lib/api'

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const STATUS_STEPS = [
  { key: 'waiting_payment', label: 'Menunggu Pembayaran', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { key: 'paid', label: 'Pembayaran Dikonfirmasi', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  { key: 'in_progress', label: 'Sedang Diproses', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-100' },
  { key: 'ready', label: 'Siap Diambil', icon: Package, color: 'text-primary-600', bg: 'bg-primary-100' },
  { key: 'completed', label: 'Pesanan Selesai', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
]

export default function OrderStatusPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`)
      setOrder(data.data)
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 15000)
    return () => clearInterval(interval)
  }, [orderId])

  const currentStepIdx = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : -1
  const isCancelled = order?.status === 'cancelled'

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <div>
        <XCircle size={48} className="mx-auto text-red-300 mb-3" />
        <p className="text-gray-600">Pesanan tidak ditemukan</p>
        <Link to="/menu" className="btn-primary mt-4 inline-block">Kembali ke Menu</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="font-bold text-gray-800 text-lg">Status Pesanan</h1>
          <button onClick={fetchOrder} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Order info */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 font-medium">Nomor Pesanan</p>
              <p className="text-2xl font-bold text-primary-800">#{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Meja</p>
              <p className="text-2xl font-bold text-gray-800">{order.table_number}</p>
            </div>
          </div>
          {order.customer_name && <p className="text-sm text-gray-600 mb-3">Halo, <span className="font-semibold">{order.customer_name}</span>! 👋</p>}

          {/* Items */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            {(order.items || []).map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.menu_name} ×{item.quantity}</span>
                <span className="font-semibold">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-sm">
              <span>Total</span>
              <span className="text-primary-800">{formatRupiah(order.total_amount)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(order.created_at).toLocaleString('id-ID')} · {order.payment_method === 'online' ? '💳 Online' : '💵 Cash'}
          </p>
        </div>

        {/* Status tracker */}
        {isCancelled ? (
          <div className="card p-5 text-center">
            <XCircle size={48} className="mx-auto text-red-400 mb-3" />
            <p className="font-bold text-red-600 text-lg">Pesanan Dibatalkan</p>
            <p className="text-gray-500 text-sm mt-1">Hubungi pegawai jika ada pertanyaan</p>
          </div>
        ) : (
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4">Lacak Pesanan</h2>
            <div className="space-y-0">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon
                const isDone = idx < currentStepIdx
                const isCurrent = idx === currentStepIdx
                const isUpcoming = idx > currentStepIdx
                return (
                  <div key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-primary-100' : isCurrent ? step.bg : 'bg-gray-100'
                      }`}>
                        <Icon size={20} className={isDone ? 'text-primary-600' : isCurrent ? step.color : 'text-gray-300'} />
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`w-0.5 flex-1 my-1 min-h-6 ${isDone || isCurrent ? 'bg-primary-300' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-4 pt-2">
                      <p className={`text-sm font-semibold ${isCurrent ? 'text-gray-800' : isDone ? 'text-primary-700' : 'text-gray-400'}`}>
                        {step.label}
                        {isCurrent && <span className="ml-2 text-xs text-primary-600 font-bold animate-pulse">● Sekarang</span>}
                        {isDone && <span className="ml-2 text-xs text-green-600">✓</span>}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Waiting payment notice */}
        {order.status === 'waiting_payment' && order.payment_method === 'cash' && (
          <div className="card p-4 bg-yellow-50 border border-yellow-200">
            <p className="text-yellow-800 font-semibold text-sm">💵 Menunggu Konfirmasi Pembayaran</p>
            <p className="text-yellow-700 text-xs mt-1">Tunjukkan pesanan ini ke kasir untuk konfirmasi pembayaran cash kamu.</p>
          </div>
        )}

        {order.status === 'ready' && (
          <div className="card p-4 bg-green-50 border border-green-200 text-center">
            <p className="text-2xl mb-2">🔔</p>
            <p className="text-green-800 font-bold">Pesanan Siap Diambil!</p>
            <p className="text-green-700 text-sm mt-1">Silakan ambil pesanan kamu di kasir/counter.</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link to="/menu" className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm">
            <Home size={16} /> Menu
          </Link>
          <button onClick={fetchOrder} className="flex-1 btn-ghost border border-gray-200 flex items-center justify-center gap-2 text-sm">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        <p className="text-center text-xs text-gray-400">Status otomatis diperbarui setiap 15 detik</p>
      </main>
    </div>
  )
}
