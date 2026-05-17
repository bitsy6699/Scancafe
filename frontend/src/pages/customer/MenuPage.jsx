import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ShoppingCart, Search, Coffee, ChevronRight, X, Plus, Minus, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../lib/api'
import useCartStore from '../../store/useCartStore'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005'
const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const CATEGORIES = [
  { value: 'all', label: 'Semua', subtitle: 'Lihat semua menu makanan dan minuman kami.' },
  { value: 'drinks', label: 'Minuman', subtitle: 'Kopi segar, teh, dan minuman dingin pilihan.' },
  { value: 'food', label: 'Makanan', subtitle: 'Hidangan utama yang lezat dan mengenyangkan.' },
  { value: 'snack', label: 'Snack', subtitle: 'Camilan ringan untuk menemani waktu santaimu.' },
]

export default function MenuPage() {
  const [searchParams] = useSearchParams()
  const tableNumber = searchParams.get('table') || ''
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedMenu, setSelectedMenu] = useState(null)
  const { items, addItem, updateQuantity, getTotalItems, setTableNumber } = useCartStore()

  useEffect(() => {
    if (tableNumber) setTableNumber(tableNumber)
  }, [tableNumber])

  const fetchMenus = async () => {
    try {
      const { data } = await api.get('/menus')
      setMenus(data.data)
    } catch { toast.error('Gagal memuat menu') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMenus() }, [])

  const getCartQty = (menuId) => items.find(i => i.id === menuId)?.quantity || 0

  const handleAdd = (menu) => {
    if (!menu.is_available) { toast.error('Menu ini sedang habis'); return }
    addItem(menu)
    toast.success(`${menu.name} siap menemani harimu!`, { duration: 1500, style: { background: '#2e7d32', color: '#fff', borderRadius: '20px' } })
  }

  const filtered = menus
    .filter(m => category === 'all' || m.category === category)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

  const totalItems = getTotalItems()

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans selection:bg-primary-100 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="blob w-72 h-72 bg-primary-200 top-[-5%] left-[-10%] animation-delay-2000" />
        <div className="blob w-96 h-96 bg-amber-100 bottom-[10%] right-[-10%] animation-delay-4000" />
        <div className="blob w-64 h-64 bg-green-100 top-[40%] left-[60%] shadow-2xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-2xl border-b border-white/50">
        <div className="max-w-2xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-primary-800 rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-primary-800/30">
                <Coffee size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-medium text-gray-900 tracking-tight leading-none">ScanCafe</h1>
                {tableNumber && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary-700 font-black">Meja {tableNumber}</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            <Link to="/cart" className="relative group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-black/5 border border-white group-hover:border-primary-100 transition-all"
              >
                <ShoppingCart size={22} className="text-gray-800" />
              </motion.div>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-primary-800 text-white text-[10px] font-black rounded-full flex items-center justify-center border-[3px] border-white shadow-lg"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Creative Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-amber-500 fill-amber-500" />
              <span className="italic-accent">Pilihan Kopi & Menu Terbaik</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-gray-950 leading-tight tracking-tight">
              Ingin minum apa kamu hari ini?
            </h2>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-md">
              Pilih dari beragam racikan kopi khas kami serta hidangan lezat lainnya, langsung diantar ke mejamu.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-800 transition-colors" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari kopi, camilan, atau inspirasi..."
              className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border-none bg-gray-100/50 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-500 text-sm font-semibold placeholder:text-gray-400 placeholder:italic"
            />
          </motion.div>
        </div>

        {/* Category tabs */}
        <div className="max-w-2xl mx-auto px-8 pb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {CATEGORIES.map((cat, idx) => (
              <motion.button
                key={cat.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                onClick={() => setCategory(cat.value)}
                className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  category === cat.value
                    ? 'bg-primary-800 text-white shadow-2xl shadow-primary-800/20'
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-primary-200 hover:text-primary-800'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu list */}
      <main className="max-w-2xl mx-auto px-8 py-8 pb-40 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="spinner" />
            <p className="italic-accent text-gray-400 animate-pulse">Menyiapkan simfoni rasa...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-50">
              <Search size={36} className="text-gray-100" />
            </div>
            <p className="font-serif text-2xl font-medium text-gray-900 tracking-tight">Rasa yang dicari belum muncul</p>
            <p className="italic-accent text-gray-400 mt-2">Mungkin di lain waktu, atau coba kata kunci lain.</p>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {CATEGORIES.filter(c => c.value !== 'all').map((cat) => {
              const catItems = filtered.filter(m => m.category === cat.value)
              if (catItems.length === 0 || (category !== 'all' && category !== cat.value)) return null
              return (
                <div key={cat.value}>
                  <div className="mb-8">
                    <motion.h2 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="font-serif text-3xl font-medium text-gray-900 tracking-tight"
                    >
                      {cat.label}
                    </motion.h2>
                    <p className="italic-accent text-sm text-gray-400 mt-1">{cat.subtitle}</p>
                  </div>
                  <div className="grid gap-6">
                    {catItems.map((menu, mIdx) => {
                      const qty = getCartQty(menu.id)
                      return (
                        <motion.div
                          key={menu.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: mIdx * 0.05 }}
                          className={`group bg-white/80 backdrop-blur-md p-5 rounded-[2.5rem] border border-white shadow-xl shadow-black/5 hover:shadow-primary-900/10 hover:border-primary-100 transition-all duration-700 flex gap-6 ${!menu.is_available ? 'opacity-60 grayscale' : ''}`}
                        >
                          {/* Image */}
                          <div
                            className="w-32 h-32 bg-gray-50 rounded-[2rem] overflow-hidden shrink-0 cursor-pointer relative shadow-inner"
                            onClick={() => menu.is_available && setSelectedMenu(menu)}
                          >
                            {menu.image_url ? (
                              <img src={`${API_BASE}${menu.image_url}`} alt={menu.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" onError={e => e.target.style.display='none'} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Coffee size={40} className="text-gray-100" />
                              </div>
                            )}
                            {!menu.is_available && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-black/40 px-3 py-1.5 rounded-full border border-white/20">Habis Terjual</span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <h3 className="font-serif font-medium text-gray-900 text-xl leading-tight tracking-tight group-hover:text-primary-800 transition-colors">{menu.name}</h3>
                              {menu.description && (
                                <p className="text-xs text-gray-400 mt-2 line-clamp-2 font-medium leading-relaxed">{menu.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <span className="font-serif font-medium text-2xl text-primary-800 tracking-tighter">{formatRupiah(menu.price)}</span>
                              
                              <div className="flex items-center">
                                <AnimatePresence mode="wait">
                                  {qty === 0 ? (
                                    <motion.button
                                      key="add"
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.5 }}
                                      onClick={() => handleAdd(menu)}
                                      disabled={!menu.is_available}
                                      className="bg-gray-900 text-white p-3.5 rounded-2xl shadow-2xl shadow-gray-900/30 hover:bg-primary-800 hover:shadow-primary-800/40 transition-all disabled:opacity-40 active:scale-90"
                                    >
                                      <Plus size={20} />
                                    </motion.button>
                                  ) : (
                                    <motion.div 
                                      key="qty"
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 20 }}
                                      className="flex items-center gap-4 bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-2xl border border-white"
                                    >
                                      <button onClick={() => updateQuantity(menu.id, qty - 1)} className="w-10 h-10 bg-white text-gray-900 rounded-[1rem] flex items-center justify-center shadow-sm active:scale-90 transition-all">
                                        <Minus size={16} />
                                      </button>
                                      <span className="font-black text-gray-900 text-sm min-w-[14px] text-center">{qty}</span>
                                      <button onClick={() => updateQuantity(menu.id, qty + 1)} className="w-10 h-10 bg-primary-800 text-white rounded-[1rem] flex items-center justify-center shadow-lg active:scale-90 transition-all">
                                        <Plus size={16} />
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Floating Checkout Card */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div 
            initial={{ y: 150, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 150, opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-8 right-8 max-w-2xl mx-auto z-40"
          >
            <Link to="/cart">
              <div className="bg-gray-900 text-white rounded-[3rem] p-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-800/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/5">
                    <ShoppingCart size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Siap Dinikmati</p>
                    <p className="font-serif text-xl font-medium">{totalItems} Mahakarya Terpilih</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-black text-xs uppercase tracking-widest relative z-10 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md group-hover:bg-primary-800 transition-colors">
                  Check Out <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMenu && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMenu(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="bg-white rounded-t-[4rem] sm:rounded-[4rem] w-full max-w-xl mx-auto relative z-10 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
            >
              <div className="relative h-80">
                {selectedMenu.image_url ? (
                  <img src={`${API_BASE}${selectedMenu.image_url}`} alt={selectedMenu.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <Coffee size={80} className="text-gray-100" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={() => setSelectedMenu(null)} className="absolute top-8 right-8 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 border border-white/20">
                  <X size={24} />
                </button>
                <div className="absolute bottom-8 left-8">
                   <span className="badge bg-primary-800 text-white mb-2">{selectedMenu.category}</span>
                   <h3 className="text-4xl font-serif font-medium text-white tracking-tight">{selectedMenu.name}</h3>
                </div>
              </div>
              <div className="p-10">
                <p className="text-gray-500 text-base font-medium leading-relaxed mb-10 italic-accent">
                  "{selectedMenu.description || 'Mahakarya yang diciptakan khusus untuk melengkapi hari istimewamu.'}"
                </p>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Harga</span>
                    <span className="text-4xl font-serif font-medium text-primary-800 tracking-tighter">{formatRupiah(selectedMenu.price)}</span>
                  </div>
                  <button
                    onClick={() => { handleAdd(selectedMenu); setSelectedMenu(null) }}
                    className="flex-1 btn-primary text-sm uppercase tracking-widest py-5"
                  >
                    Mulai Nikmati
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="max-w-2xl mx-auto px-8 py-20 text-center opacity-30">
        <div className="w-8 h-px bg-gray-400 mx-auto mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">ScanCafe • Est 2024</p>
      </footer>
    </div>
  )
}
