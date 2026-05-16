import { useState, useEffect } from 'react'
import { Search, RefreshCw, ChevronDown, ChevronUp, ShoppingBag, Clock, CheckCircle, Package, Truck, Trash2 } from 'lucide-react'
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
      setOrders(Array.isArray(data?.data) ? data.data : [])
    } catch (err) { 
      toast.error('Gagal memuat pesanan') 
      setOrders([])
    } finally { 
      setLoading(false) 
    }
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

  const filtered = (orders || []).filter(o => {
    if (!o) return false
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const s = search.toLowerCase()
    return matchStatus && (
      (o.table_number || '').toString().toLowerCase().includes(s) ||
      (o.id || '').toString().includes(s) ||
      (o.customer_name || '').toLowerCase().includes(s)
    )
  })

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#111]">Daftar Pesanan</h1>
          <p className="text-sm text-[#999] mt-1 italic font-serif">Monitoring alur kerja pesanan secara real-time.</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2 py-2.5 px-5">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="text-xs uppercase tracking-wider font-bold">Refresh</span>
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-white">
          <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Total Aktif</p>
          <p className="text-2xl font-bold text-[#111]">{orders.filter(o => o.status !== 'completed').length}</p>
        </div>
        <div className="card p-4 bg-white">
          <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Menunggu Bayar</p>
          <p className="text-2xl font-bold text-amber-600">{orders.filter(o => o.status === 'waiting_payment').length}</p>
        </div>
        <div className="card p-4 bg-white">
          <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Sedang Proses</p>
          <p className="text-2xl font-bold text-indigo-600">{orders.filter(o => o.status === 'in_progress').length}</p>
        </div>
        <div className="card p-4 bg-white">
          <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Siap Ambil</p>
          <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'ready').length}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari meja atau nama..."
            className="input-field pl-11 py-3.5"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filterStatus === tab.value ? 'bg-[#111] text-white' : 'bg-white text-[#666] border border-[#eee] hover:border-[#ddd]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card p-20 text-center text-[#999] bg-gray-50/50">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-serif text-lg italic">Tidak ada pesanan ditemukan</p>
          </div>
        ) : (
          filtered.map(order => (
            <div
              key={order.id}
              className={`card bg-white transition-all duration-300 ${expandedId === order.id ? 'border-[#111] shadow-md' : 'border-[#eee]'}`}
            >
              <div
                className="p-5 cursor-pointer flex items-center gap-5"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="w-12 h-12 bg-[#111] text-white rounded-lg flex items-center justify-center font-bold text-lg">
                  {order.table_number || '?'}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-bold text-[#111] flex items-center gap-2">
                      Meja {order.table_number} 
                      <span className="text-[#999] font-medium text-xs">#{order.id}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge badge-${(order.status || 'waiting_payment').replace('_', '-')}`}>
                        {STATUS_TABS.find(t=>t.value===order.status)?.label || 'Status'}
                      </span>
                      <span className="text-[10px] font-bold text-[#bbb] uppercase">{order.created_at ? new Date(order.created_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) : ''}</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[9px] font-bold text-[#bbb] uppercase tracking-widest mb-0.5">Total Tagihan</p>
                    <p className="font-bold text-[#111]">{formatRupiah(order.total_amount || 0)}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                     <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-[#666] uppercase">{order.payment_method}</span>
                     {order.customer_name && <span className="text-xs font-medium text-[#666]">👤 {order.customer_name}</span>}
                  </div>
                </div>
                {expandedId === order.id ? <ChevronUp size={18} className="text-[#999]" /> : <ChevronDown size={18} className="text-[#999]" />}
              </div>

              <AnimatePresence>
                {expandedId === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#f5f5f5] bg-[#fafafa]/50 overflow-hidden"
                  >
                    <div className="p-6 grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-4">Detail Pesanan</h4>
                        <div className="space-y-2">
                          {(order.items || []).map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#eee]">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-[#111] bg-gray-50 w-6 h-6 flex items-center justify-center rounded">x{item.quantity}</span>
                                <span className="text-sm font-medium text-[#111]">{item.menu_name}</span>
                              </div>
                              <span className="text-sm font-bold text-[#111]">{formatRupiah(item.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-4">Aksi Workflow</h4>
                          <div className="flex flex-wrap gap-2">
                            {order.status === 'waiting_payment' && (
                              <button onClick={() => updateStatus(order.id, 'paid')} className="btn-primary py-2 px-4 text-xs">Konfirmasi Pembayaran</button>
                            )}
                            {order.status === 'paid' && (
                              <button onClick={() => updateStatus(order.id, 'in_progress')} className="btn-primary py-2 px-4 text-xs bg-indigo-600 hover:bg-indigo-700">Mulai Proses</button>
                            )}
                            {order.status === 'in_progress' && (
                              <button onClick={() => updateStatus(order.id, 'ready')} className="btn-primary py-2 px-4 text-xs bg-orange-600 hover:bg-orange-700">Pesanan Siap</button>
                            )}
                            {order.status === 'ready' && (
                              <button onClick={() => updateStatus(order.id, 'completed')} className="btn-primary py-2 px-4 text-xs">Selesaikan</button>
                            )}
                          </div>
                        </div>
                        {order.notes && (
                          <div className="p-4 bg-white border border-[#eee] rounded-lg">
                            <p className="text-[9px] font-bold text-[#999] uppercase tracking-widest mb-1">Catatan</p>
                            <p className="text-sm text-[#444] italic">"{order.notes}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
