import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { CreditCard, CheckCircle, XCircle, Loader2, ArrowLeft, Shield, Smartphone } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function PaymentPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [step, setStep] = useState('details')

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then(({ data }) => setOrder(data.data))
      .catch(() => toast.error('Pesanan tidak ditemukan'))
      .finally(() => setLoading(false))
  }, [orderId])

  const handleSimulatedPayment = async (success = true) => {
    if (!success) { setStep('failed'); return }
    setPaying(true)
    setStep('processing')
    await new Promise(r => setTimeout(r, 2500))
    try {
      await api.patch(`/orders/${orderId}/simulate-payment`)
      setStep('success')
      toast.success('Pembayaran berhasil!')
    } catch {
      setStep('failed')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <div>
        <XCircle size={48} className="mx-auto text-red-400 mb-3" />
        <p className="text-gray-600">Pesanan tidak ditemukan</p>
        <Link to="/menu" className="btn-primary mt-4 inline-block">Kembali ke Menu</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        {step === 'details' && (
          <Link to={`/order/${orderId}`} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={22} className="text-gray-700" />
          </Link>
        )}
        <h1 className="font-bold text-gray-800">Pembayaran Online</h1>
        <div className="ml-auto flex items-center gap-1 text-green-600 text-xs font-semibold">
          <Shield size={14} /> Aman
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col items-center justify-center">
        {step === 'details' && (
          <div className="w-full space-y-4 animate-fade-in">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">Detail Pesanan</h2>
                <span className="badge bg-blue-100 text-blue-700">#{order.id}</span>
              </div>
              <div className="space-y-2">
                {(order.items || []).map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.menu_name} ×{item.quantity}</span>
                    <span className="font-semibold">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-primary-800">
                  <span>Total</span>
                  <span className="text-xl">{formatRupiah(order.total_amount)}</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Smartphone size={22} className="text-purple-700" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Simulasi Payment</p>
                  <p className="text-xs text-gray-500">Mode demo</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-xs font-semibold">SC-{String(orderId).padStart(6,'0')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-primary-800">{formatRupiah(order.total_amount)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <button onClick={() => handleSimulatedPayment(true)} disabled={paying} className="btn-primary w-full flex items-center justify-center gap-2">
                  <CreditCard size={18} /> ✅ Simulasi Bayar Sukses
                </button>
                <button onClick={() => handleSimulatedPayment(false)} disabled={paying} className="w-full py-3 px-6 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-all">
                  ❌ Simulasi Bayar Gagal
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400">Simulasi untuk demo. Integrasi nyata: Midtrans / Xendit.</p>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={48} className="text-primary-700 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Memproses...</h2>
            <p className="text-gray-500 text-sm">Mohon tunggu sebentar</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={52} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h2>
            <p className="text-gray-500 mb-2">Pesanan sedang diproses</p>
            <p className="text-primary-700 font-bold text-lg mb-8">{formatRupiah(order.total_amount)}</p>
            <button onClick={() => navigate(`/order/${orderId}`)} className="btn-primary w-full">Lihat Status Pesanan</button>
          </div>
        )}

        {step === 'failed' && (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={52} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Gagal</h2>
            <p className="text-gray-500 mb-8">Silakan coba lagi</p>
            <div className="space-y-3">
              <button onClick={() => setStep('details')} className="btn-primary w-full">Coba Lagi</button>
              <Link to="/menu" className="block text-center text-gray-500 text-sm">Kembali ke Menu</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
