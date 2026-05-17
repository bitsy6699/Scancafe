import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@scancafe.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data.success) {
        login(data.user, data.token)
        toast.success('Selamat datang kembali di ScanCafe.')
        navigate('/dashboard')
      } else {
        toast.error('Email atau kata sandi salah.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Akses ditolak. Silakan periksa kembali email & kata sandi Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px] animate-fade-in">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-[#111] rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <Coffee size={28} className="text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#111]">ScanCafe</h1>
          <p className="font-serif italic text-sm text-[#999] mt-1">Simfoni rasa dalam setiap sentuhan.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#111]">Login Pegawai</h2>
            <p className="text-xs text-[#999] mt-1 uppercase tracking-wider font-bold">Silakan masuk untuk mengelola cafe</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-text">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="admin@scancafe.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Kata Sandi</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-[13px] uppercase tracking-[0.1em] font-black"
            >
              {loading ? <div className="spinner !border-white/20 !border-t-white" /> : 'Akses Dashboard'}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
          <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Akses Demo</p>
            <p className="text-xs font-medium text-gray-600">admin@scancafe.com / password123</p>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-gray-400 mt-10 uppercase tracking-widest font-medium">
          &copy; 2024 ScanCafe Management System
        </p>
      </div>
    </div>
  )
}
