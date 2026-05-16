import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Package,
  BookOpen, BarChart3, QrCode, LogOut, Menu, Coffee, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/orders', label: 'Pesanan', icon: ShoppingBag },
  { to: '/dashboard/menu', label: 'Menu Cafe', icon: UtensilsCrossed },
  { to: '/dashboard/ingredients', label: 'Stok Bahan', icon: Package },
  { to: '/dashboard/recipes', label: 'Data Resep', icon: BookOpen },
  { to: '/dashboard/reports', label: 'Laporan Penjualan', icon: BarChart3 },
  { to: '/dashboard/qr', label: 'Generator QR', icon: QrCode },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Berhasil logout dari sistem.')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans selection:bg-gray-200">
      {/* Sidebar Overlay (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col border-r border-gray-100
        transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111] rounded-lg flex items-center justify-center">
              <Coffee size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-[#111] tracking-tight">ScanCafe</h1>
              <p className="text-[9px] font-bold text-[#999] uppercase tracking-[0.2em] mt-0.5">Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto pt-8 space-y-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-[#111] text-white' 
                  : 'text-[#666] hover:bg-gray-50 hover:text-[#111]'}`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Profile */}
        <div className="p-4 mt-auto border-t border-gray-50">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-gray-100 text-[#111] rounded-full flex items-center justify-center font-bold text-xs border border-gray-200 uppercase">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#111] truncate">{user?.name}</p>
              <p className="text-[9px] font-medium text-[#999] uppercase tracking-wider">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="lg:hidden p-5 bg-white border-b border-gray-100 flex items-center justify-between z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-[#111]">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-[#111] rounded-lg flex items-center justify-center">
                <Coffee size={16} className="text-white" />
             </div>
             <h1 className="font-serif text-lg font-bold">ScanCafe</h1>
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 scrollbar-hide">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
