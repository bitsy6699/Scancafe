import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ShoppingBag, Clock, CheckCircle, AlertTriangle, Coffee, ArrowRight, RefreshCw, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const statusConfig = {
  waiting_payment: { label: 'Menunggu Bayar', class: 'badge-waiting' },
  paid: { label: 'Dibayar', class: 'badge-paid' },
  in_progress: { label: 'Diproses', class: 'badge-in-progress' },
  ready: { label: 'Siap', class: 'badge-ready' },
  completed: { label: 'Selesai', class: 'badge-completed' },
  cancelled: { label: 'Dibatalkan', class: 'badge-cancelled' },
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [activeOrders, setActiveOrders] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [summaryRes, ordersRes, stockRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/orders/active'),
        api.get('/ingredients/low-stock'),
      ])
      setSummary(summaryRes.data.data)
      setActiveOrders(ordersRes.data.data.slice(0, 8))
      setLowStock(stockRes.data.data)
    } catch {
      toast.error('Gagal menyelaraskan semesta data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-6">
      <div className="spinner" />
      <p className="italic-accent text-gray-400 animate-pulse uppercase tracking-[0.3em] text-[10px]">Menyusun simfoni operasional...</p>
    </div>
  )

  const stats = [
    { label: 'Mahakarya Terjual', value: formatRupiah(summary?.today_revenue || 0), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-500/5', iconBg: 'bg-green-500/10', sub: 'Pendapatan hari ini' },
    { label: 'Total Interaksi', value: summary?.today_orders || 0, icon: Coffee, color: 'text-blue-600', bg: 'bg-blue-500/5', iconBg: 'bg-blue-500/10', sub: 'Pesanan masuk hari ini' },
    { label: 'Denyut Operasional', value: summary?.active_orders || 0, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-500/5', iconBg: 'bg-orange-500/10', sub: 'Sedang dalam antrean' },
    { label: 'Menanti Konfirmasi', value: summary?.pending_orders || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-500/5', iconBg: 'bg-yellow-500/10', sub: 'Proses pembayaran tertunda' },
  ]

  return (
    <div className="space-y-12 relative">
      {/* Decorative background elements inside main content */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
             <Sparkles size={18} className="text-primary-800" />
             <span className="text-[10px] font-black text-primary-800 uppercase tracking-[0.3em]">Operational Masterpiece</span>
          </div>
          <h1 className="font-serif text-5xl font-medium text-gray-900 tracking-tight leading-tight">Pantau Keajaiban Hari Ini</h1>
          <p className="italic-accent text-gray-400 mt-2 text-lg">Setiap detik adalah peluang untuk menyajikan kebahagiaan.</p>
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData} 
          className="btn-secondary flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] bg-white shadow-xl shadow-black/5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sinkronisasi Semesta
        </motion.button>
      </div>

      {/* Low stock warning */}
      {lowStock.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/[0.03] border border-red-500/10 rounded-[3rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-red-500/5"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center shrink-0">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="font-serif text-2xl font-medium text-red-900 tracking-tight">Beberapa Bahan Mulai Menipis</p>
            <p className="italic-accent text-red-700/60 text-sm mt-1">
              Ada {lowStock.length} elemen penting dalam resep kita yang perlu perhatian segera agar simfoni rasa tidak terhenti.
            </p>
          </div>
          <Link to="/dashboard/ingredients" className="btn-primary bg-red-600 hover:bg-red-700 shadow-red-600/20 py-4 px-10 text-[10px] uppercase tracking-widest whitespace-nowrap">
            Amankan Persediaan
          </Link>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map(({ label, value, icon: Icon, color, bg, iconBg, sub }, idx) => (
          <motion.div 
            key={label} 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl shadow-black/5 hover:shadow-primary-900/10 hover:border-primary-100 transition-all group relative overflow-hidden`}
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[4rem] -z-10 opacity-40 group-hover:bg-primary-50 transition-colors" />
            <div className={`w-16 h-16 ${iconBg} ${color} rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
              <Icon size={32} />
            </div>
            <p className="font-serif text-4xl font-medium text-gray-900 tracking-tighter leading-none mb-3">{value}</p>
            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">{label}</p>
            <p className="italic-accent text-[10px] text-gray-400">{sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Active orders */}
        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
          <div className="flex items-center justify-between p-10 border-b border-gray-50 bg-gray-50/20">
            <div>
              <h2 className="font-serif text-3xl font-medium text-gray-900 tracking-tight">Simfoni Antrean</h2>
              <p className="italic-accent text-xs text-gray-400 mt-1">Sajian yang menanti sentuhan magis tim kita.</p>
            </div>
            <Link to="/dashboard/orders" className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary-800 hover:border-primary-800/20 hover:shadow-lg transition-all active:scale-90">
              <ArrowRight size={24} />
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {activeOrders.length === 0 ? (
              <div className="p-20 text-center">
                <CheckCircle size={64} className="mx-auto mb-6 text-gray-100" />
                <p className="font-serif text-xl font-medium text-gray-400">Semua pesanan telah tersaji dengan indah.</p>
              </div>
            ) : activeOrders.map((order, idx) => (
              <motion.div 
                key={order.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-6 p-6 hover:bg-primary-50/30 transition-all rounded-[2.5rem] group"
              >
                <div className="w-14 h-14 bg-gray-900 text-white rounded-[1.2rem] flex items-center justify-center font-black text-lg shrink-0 shadow-2xl shadow-gray-900/20 group-hover:scale-110 transition-transform">
                  {order.table_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-lg tracking-tight">Meja {order.table_number} <span className="text-gray-300 font-normal ml-2">#{order.id}</span></p>
                  <p className="italic-accent text-xs text-gray-400 mt-0.5">{order.items?.length || 0} karya seni • {formatRupiah(order.total_amount)}</p>
                </div>
                <span className={`${statusConfig[order.status]?.class || 'badge'} px-5 py-2`}>
                  {statusConfig[order.status]?.label || order.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Status Bahan */}
        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
          <div className="flex items-center justify-between p-10 border-b border-gray-50 bg-gray-50/20">
            <div>
              <h2 className="font-serif text-3xl font-medium text-gray-900 tracking-tight">Inventory Hati</h2>
              <p className="italic-accent text-xs text-gray-400 mt-1">Memastikan bahan terbaik selalu siap tersedia.</p>
            </div>
            <Link to="/dashboard/ingredients" className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary-800 hover:border-primary-800/20 hover:shadow-lg transition-all active:scale-90">
              <ArrowRight size={24} />
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {lowStock.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-green-500/5 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} />
                </div>
                <p className="font-serif text-xl font-medium text-gray-900">Gudang Penuh Kebahagiaan</p>
                <p className="italic-accent text-sm text-gray-400 mt-2">Semua bahan baku tersedia untuk menciptakan momen istimewa.</p>
              </div>
            ) : lowStock.map((item, idx) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-6 p-6 hover:bg-red-500/[0.02] transition-all rounded-[2.5rem] group"
              >
                <div className="w-14 h-14 bg-red-500/5 rounded-[1.2rem] flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-lg tracking-tight">{item.name}</p>
                  <p className="italic-accent text-xs text-gray-400 mt-0.5">Tersisa: {item.stock} {item.unit} • Batas: {item.min_stock}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-2">{Math.round((item.stock / item.min_stock) * 100)}%</div>
                  <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (item.stock / item.min_stock) * 100)}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="py-12 text-center opacity-20">
         <p className="text-[10px] font-black uppercase tracking-[0.4em]">ScanCafe • Management Symphony</p>
      </div>
    </div>
  )
}
