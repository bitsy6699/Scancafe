import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Coffee, Lock, Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '../../store/useAuthStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Kredensial wajib diisi untuk menjaga keamanan sistem.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      if (data.success) {
        login(data.user, data.token)
        toast.success(`Selamat kembali, ${data.user.name}. Mari kita kelola hari ini.`, { 
          style: { background: '#2e7d32', color: '#fff', borderRadius: '20px', fontWeight: 'bold' } 
        })
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Akses ditolak. Silakan periksa kembali kredensial Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 overflow-hidden relative selection:bg-primary-800 selection:text-white font-sans">
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-900/30 blur-[150px] rounded-full animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/20 blur-[150px] rounded-full animate-blob animation-delay-4000" />
        <div className="absolute top-[30%] left-[40%] w-[20%] h-[20%] bg-amber-900/10 blur-[100px] rounded-full animate-blob animation-delay-2000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-primary-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(46,125,50,0.4)] mb-8 border border-white/10"
          >
            <Coffee size={40} className="text-white" />
          </motion.div>
          <h1 className="font-serif text-5xl font-medium text-white tracking-tight mb-3">ScanCafe</h1>
          <p className="italic-accent text-gray-400 text-sm opacity-60">Pintu gerbang menuju manajemen cafe masa depan.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[4rem] border border-white/10 p-10 lg:p-14 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          <div className="mb-10">
            <h2 className="font-serif text-2xl font-medium text-white tracking-tight mb-2">Selamat Datang Kembali</h2>
            <p className="text-xs font-black text-gray-500 uppercase tracking-[0.25em]">Silakan autentikasi untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Email Pegawai</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Masukkan email resmi Anda"
                  className="w-full pl-14 pr-8 py-5 rounded-[2rem] bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:bg-white/10 focus:outline-none transition-all font-semibold placeholder:text-gray-700 placeholder:italic"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Kata Sandi</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Keamanan adalah prioritas utama"
                  className="w-full pl-14 pr-16 py-5 rounded-[2rem] bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:bg-white/10 focus:outline-none transition-all font-semibold placeholder:text-gray-700 placeholder:italic"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary-800 hover:bg-primary-700 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-primary-800/30 flex items-center justify-center gap-4 transition-all disabled:opacity-50 text-sm uppercase tracking-widest"
            >
              {loading ? <Loader2 size={22} className="animate-spin" /> : <ShieldCheck size={20} />}
              {loading ? 'Sedang Memverifikasi...' : 'Akses Dashboard'}
              {!loading && <ArrowRight size={18} className="opacity-40" />}
            </motion.button>
          </form>

          {/* Demo Info */}
          <div className="mt-12 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Akses Demo Terotorisasi</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <p className="text-xs text-gray-500">Alamat Email: <span className="text-white font-mono font-medium ml-1">admin@scancafe.com</span></p>
              <p className="text-xs text-gray-400">Kata Sandi: <span className="text-white font-mono font-medium ml-1">password123</span></p>
            </div>
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-600 text-sm mt-10 font-medium"
        >
          Butuh melihat menu?{' '}
          <a href="/menu" className="text-primary-500 font-bold hover:underline underline-offset-8 transition-all">
            Kembali ke Simfoni Rasa
          </a>
        </motion.p>
      </motion.div>
    </div>
  )
}
