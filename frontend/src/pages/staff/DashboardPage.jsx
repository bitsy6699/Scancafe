import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingBag, Users, Utensils, AlertCircle, ChevronRight, ArrowUpRight } from 'lucide-react'
import api from '../../lib/api'

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    activeOrders: 0,
    totalMenus: 0,
    lowStockIngredients: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, menusRes, ingredientsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/menus'),
          api.get('/ingredients')
        ])

        const today = new Date().toISOString().split('T')[0]
        const todayOrders = ordersRes.data.data.filter(o => o.created_at.startsWith(today))
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.status === 'completed' || o.status === 'paid' ? o.total_amount : 0), 0)
        const activeOrders = ordersRes.data.data.filter(o => !['completed', 'cancelled'].includes(o.status)).length
        const lowStock = ingredientsRes.data.data.filter(i => i.stock <= i.min_stock)

        setStats({
          todayRevenue,
          activeOrders,
          totalMenus: menusRes.data.data.length,
          lowStockIngredients: lowStock
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="animate-fade-in space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#111] tracking-tight">Ringkasan Operasional</h1>
        <p className="text-sm text-[#999] mt-1 italic font-serif">Selamat datang di pusat kendali ScanCafe.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-8 bg-white flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Pendapatan Hari Ini</p>
            <h2 className="text-3xl font-bold text-[#111]">{formatRupiah(stats.todayRevenue)}</h2>
          </div>
          <p className="text-[10px] text-green-600 font-bold mt-4 flex items-center gap-1">
            <ArrowUpRight size={12} /> BERJALAN BAIK
          </p>
        </div>

        <div className="card p-8 bg-white flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBag size={20} />
            </div>
            <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Pesanan Aktif</p>
            <h2 className="text-3xl font-bold text-[#111]">{stats.activeOrders} <span className="text-sm font-medium text-[#999]">Antrean</span></h2>
          </div>
          <button className="text-[10px] text-[#111] font-bold mt-4 flex items-center gap-1 hover:underline">
            LIHAT SEMUA <ChevronRight size={12} />
          </button>
        </div>

        <div className="card p-8 bg-white flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4">
              <Utensils size={20} />
            </div>
            <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Total Menu</p>
            <h2 className="text-3xl font-bold text-[#111]">{stats.totalMenus} <span className="text-sm font-medium text-[#999]">Item</span></h2>
          </div>
          <p className="text-[10px] text-[#999] font-bold mt-4 italic font-serif">Katalog Aktif</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Section */}
        <div className="card bg-white">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-[#111] flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              Peringatan Stok Rendah
            </h3>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-md uppercase tracking-wider">
              {stats.lowStockIngredients.length} Item
            </span>
          </div>
          <div className="p-6">
            {stats.lowStockIngredients.length === 0 ? (
              <p className="text-sm text-[#999] italic py-4 text-center">Seluruh stok bahan masih aman.</p>
            ) : (
              <div className="space-y-3">
                {stats.lowStockIngredients.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-bold text-[#111]">{item.name}</p>
                      <p className="text-[10px] text-[#999] uppercase tracking-wider">Sisa: {item.stock} {item.unit}</p>
                    </div>
                    <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full" 
                        style={{ width: `${Math.max(10, (item.stock / item.min_stock) * 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips/Info */}
        <div className="card bg-[#111] p-8 text-white relative overflow-hidden">
           <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl italic mb-4 text-gray-300">"Kualitas rasa dimulai dari ketelitian manajemen."</h3>
                <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                  Pastikan stok bahan selalu terupdate dan pantau pesanan aktif untuk memberikan pelayanan terbaik bagi pelanggan ScanCafe.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Waktu Server</p>
                <p className="text-lg font-bold text-white">{new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })} WIB</p>
              </div>
           </div>
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
        </div>
      </div>
    </div>
  )
}
