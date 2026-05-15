import { useState, useEffect } from 'react'
import { Search, RefreshCw, ChevronDown, ChevronUp, User, MapPin, Clock, CreditCard, Banknote, CheckCircle, Package, Truck, XCircle, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const STATUS_TABS = [
  { value: 'all', label: 'Semua' },
  { value: 'waiting_payment', label: 'Menunggu Bayar' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'in_progress', label: 'Diproses' },
  { value: 'ready', label: 'Siap Ambil' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders')
      setOrders(data.data)
    } catch { toast.error('Gagal memuat pesanan') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status })
      toast.success('Status diperbarui')
      fetchOrders()
    } catch { toast.error('Gagal memperbarui status') }
  }

  const filtered = orders
    .filter(o => filterStatus === 'all' || o.status === filterStatus)
    .filter(o =>
      o.table_number.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search) ||
      (o.customer_name || '').toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="animate-fade-in space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif font-medium text-gray-900 tracking-tight">Pesanan</h1>
          <p className="italic-accent text-gray-400 mt-2">Kelola alur kerja pesanan pelanggan secara real-time.</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterStatus === tab.value
                ? 'bg-primary-800 text-white shadow-lg shadow-primary-800/10'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-primary-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative group max-w-xl">
        <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-800 transition-colors" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari meja, nama, atau ID pesanan..."
          className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border border-gray-100 bg-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 focus:outline-none transition-all font-semibold"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card p-20 text-center text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-bold text-lg">Tidak ada pesanan ditemukan</p>
          </div>
        ) : (
          filtered.map(order => (
            <motion.div
              layout
              key={order.id}
              className={`card overflow-hidden group border-gray-100/50 hover:border-primary-800/20 hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-500 ${expandedId === order.id ? 'ring-2 ring-primary-800/10' : ''}`}
            >
              <div
                className="p-6 cursor-pointer flex items-center gap-6"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-gray-900/10 transition-transform group-hover:scale-105">
                  {order.table_number}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <p className="font-bold text-gray-900 text-lg tracking-tight">Meja {order.table_number} <span className="text-gray-300 font-normal ml-2">#{order.id}</span></p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge badge-${order.status.replace('_', '-')}`}>{STATUS_TABS.find(t=>t.value===order.status)?.label}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="font-serif text-xl font-medium text-primary-800">{formatRupiah(order.total_amount)}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <span className={`badge ${order.payment_method === 'online' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-500'}`}>
                      {order.payment_method === 'online' ? '💳 Online' : '💵 Cash'}
                    </span>
                    {order.customer_name && <span className="text-xs font-bold text-gray-600 truncate">👤 {order.customer_name}</span>}
                  </div>
                </div>
                {expandedId === order.id ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
              </div>

              <AnimatePresence>
                {expandedId === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-50 bg-gray-50/30 overflow-hidden"
                  >
                    <div className="p-8 grid md:grid-cols-2 gap-10">
                      {/* Left: Items */}
                      <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Daftar Pesanan</h3>
                        <div className="space-y-3">
                          {order.items?.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100/50 shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-400 text-xs">x{item.quantity}</div>
                                <span className="font-bold text-gray-800">{item.menu_name}</span>
                              </div>
                              <span className="font-serif text-lg font-medium text-gray-900">{formatRupiah(item.subtotal)}</span>
                            </div>
                          ))}
                          <div className="pt-4 flex justify-between items-center border-t border-dashed border-gray-200">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Bayar</span>
                            <span className="font-serif text-2xl font-medium text-primary-800">{formatRupiah(order.total_amount)}</span>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="mt-6 p-4 bg-white border-l-4 border-primary-800 rounded-r-2xl shadow-sm">
                            <p className="text-[10px] font-black text-primary-800 uppercase tracking-widest mb-1">Catatan</p>
                            <p className="text-sm italic-accent text-gray-600">"{order.notes}"</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-6">
                        <div>
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Update Status</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {STATUS_TABS.slice(1).map(s => (
                              <button
                                key={s.value}
                                onClick={() => updateStatus(order.id, s.value)}
                                disabled={order.status === s.value}
                                className={`px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                  order.status === s.value
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-white border border-gray-100 hover:border-primary-800 hover:text-primary-800 shadow-sm active:scale-95'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Workflow Cepat</p>
                          <div className="flex flex-wrap gap-2">
                            {order.status === 'waiting_payment' && (
                              <button onClick={() => updateStatus(order.id, 'paid')} className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2">
                                <CheckCircle size={14} /> Konfirmasi Bayar
                              </button>
                            )}
                            {order.status === 'paid' && (
                              <button onClick={() => updateStatus(order.id, 'in_progress')} className="btn-primary bg-indigo-600 py-2.5 px-6 text-xs flex items-center gap-2">
                                <Clock size={14} /> Mulai Proses
                              </button>
                            )}
                            {order.status === 'in_progress' && (
                              <button onClick={() => updateStatus(order.id, 'ready')} className="btn-primary bg-orange-600 py-2.5 px-6 text-xs flex items-center gap-2">
                                <Package size={14} /> Pesanan Siap
                              </button>
                            )}
                            {order.status === 'ready' && (
                              <button onClick={() => updateStatus(order.id, 'completed')} className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2">
                                <Truck size={14} /> Selesaikan
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
