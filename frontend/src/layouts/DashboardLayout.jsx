import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Package,
  BookOpen, BarChart3, QrCode, LogOut, Menu, X, Coffee, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/orders', label: 'Pesanan', icon: ShoppingBag },
  { to: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/dashboard/ingredients', label: 'Stok Bahan', icon: Package },
  { to: '/dashboard/recipes', label: 'Resep', icon: BookOpen },
  { to: '/dashboard/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/dashboard/qr', label: 'QR Code', icon: QrCode },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Berhasil logout')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white flex font-sans selection:bg-primary-100">
      {/* Sidebar Overlay (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-[#0d0d0d] z-50 flex flex-col
        transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-10 pb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-800/40 border border-white/5">
              <Coffee size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-medium text-white tracking-tight leading-none">ScanCafe</h1>
              <p className="font-serif italic text-[11px] text-gray-500 uppercase tracking-[0.2em] mt-1.5 opacity-80">Control Hub</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-5 overflow-y-auto space-y-12">
          <div>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] px-5 mb-6 opacity-60">Main Menu</p>
            <ul className="space-y-2">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-500 group relative overflow-hidden
                      ${isActive 
                        ? 'text-white' 
                        : 'text-gray-500 hover:text-white/80 hover:bg-white/5'}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div 
                            layoutId="activeNav"
                            className="absolute inset-0 bg-primary-800 rounded-2xl -z-10 shadow-lg shadow-primary-800/20"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <Icon size={20} className={`shrink-0 transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-white'}`} />
                        <span className="flex-1 tracking-tight">{label}</span>
                        {isActive && <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}><ChevronRight size={14} className="opacity-40" /></motion.div>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Profile */}
        <div className="p-6 mt-auto">
          <div className="bg-white/[0.03] rounded-[2.5rem] p-6 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-800/10 text-primary-500 rounded-2xl flex items-center justify-center font-serif text-2xl font-medium border border-primary-800/20">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate tracking-tight">{user?.name}</p>
                <p className="font-serif italic text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl text-red-500 hover:bg-red-500/10 font-bold transition-all duration-300 text-xs border border-red-500/10"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="lg:hidden p-6 border-b border-gray-100 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
            <Menu size={22} />
          </button>
          <h1 className="font-serif text-2xl font-medium tracking-tight">ScanCafe</h1>
          <div className="w-11" />
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-14 bg-white">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
