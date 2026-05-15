import { useState, useEffect, useRef } from 'react'
import { Download, TrendingUp, ShoppingBag, Calendar, FileSpreadsheet } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
const STATUS_LABELS = {
  waiting_payment: 'Menunggu Bayar', paid: 'Dibayar', in_progress: 'Diproses',
  ready: 'Siap', completed: 'Selesai', cancelled: 'Dibatalkan'
}

export default function ReportsPage() {
  const [tab, setTab] = useState('summary')
  const [period, setPeriod] = useState('daily')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [salesData, setSalesData] = useState([])
  const [topMenus, setTopMenus] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = `?period=${period}&date_from=${dateFrom}&date_to=${dateTo}`
      const [sR, tR, txR] = await Promise.all([
        api.get(`/reports/sales${params}`),
        api.get(`/reports/top-menus${params}`),
        api.get(`/reports/transactions${params}&limit=200`),
      ])
      setSalesData(sR.data.data)
      setTopMenus(tR.data.data)
      setTransactions(txR.data.data)
    } catch { toast.error('Gagal memuat laporan') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchReport() }, [period, dateFrom, dateTo])

  const totalRevenue = salesData.reduce((s, d) => s + (d.revenue || 0), 0)
  const totalOrders = salesData.reduce((s, d) => s + (d.order_count || 0), 0)
  const maxRevenue = Math.max(...salesData.map(d => d.revenue || 0), 1)
  const maxQty = Math.max(...topMenus.map(d => d.total_quantity || 0), 1)

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions.map(t => ({
      'ID': t.id, 'Tanggal': new Date(t.created_at).toLocaleString('id-ID'),
      'Meja': t.table_number, 'Item': t.items_summary,
      'Total': t.total_amount, 'Metode': t.payment_method,
      'Status': STATUS_LABELS[t.status] || t.status,
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi')
    XLSX.writeFile(wb, `ScanCafe_${dateFrom}_${dateTo}.xlsx`)
    toast.success('Laporan diexport!')
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
          <p className="text-sm text-gray-500">Analisis penjualan dan transaksi</p>
        </div>
        <button onClick={exportExcel} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
          <FileSpreadsheet size={18} /> Export Excel
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label-text text-xs">Dari Tanggal</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field text-sm py-2" />
        </div>
        <div>
          <label className="label-text text-xs">Sampai</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field text-sm py-2" />
        </div>
        <div>
          <label className="label-text text-xs">Periode</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="input-field text-sm py-2">
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        {[
          { id: 'summary', label: '📊 Ringkasan' },
          { id: 'sales', label: '📈 Penjualan' },
          { id: 'top', label: '🏆 Terlaris' },
          { id: 'transactions', label: '📋 Transaksi' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? 'bg-white text-primary-800 shadow-sm' : 'text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><div className="spinner" /></div> : (
        <>
          {tab === 'summary' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              <div className="card p-5 bg-gradient-to-br from-primary-800 to-primary-600 text-white">
                <TrendingUp size={24} className="mb-3 opacity-80" />
                <p className="text-2xl font-bold">{formatRupiah(totalRevenue)}</p>
                <p className="text-primary-200 text-sm mt-1">Total Pendapatan</p>
              </div>
              <div className="card p-5">
                <ShoppingBag size={24} className="mb-3 text-blue-600" />
                <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
                <p className="text-gray-500 text-sm mt-1">Total Pesanan</p>
              </div>
              <div className="card p-5">
                <Calendar size={24} className="mb-3 text-purple-600" />
                <p className="text-2xl font-bold text-gray-800">
                  {totalOrders > 0 ? formatRupiah(totalRevenue / totalOrders) : 'Rp 0'}
                </p>
                <p className="text-gray-500 text-sm mt-1">Rata-rata / Pesanan</p>
              </div>
              {topMenus[0] && (
                <div className="card p-5 sm:col-span-2 lg:col-span-3">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">🏆 Menu Terlaris</p>
                  <p className="text-xl font-bold text-gray-800">{topMenus[0].menu_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{topMenus[0].total_quantity} porsi · {formatRupiah(topMenus[0].total_revenue)}</p>
                </div>
              )}
            </div>
          )}

          {tab === 'sales' && (
            <div className="card p-5 animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4">Penjualan per Periode</h3>
              {salesData.length === 0 ? <p className="text-center text-gray-400 py-8">Tidak ada data</p> : (
                <div className="space-y-3">
                  {salesData.map(row => (
                    <div key={row.period} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-500 w-24 shrink-0">{row.period}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full flex items-center px-3 transition-all duration-500"
                          style={{ width: `${Math.max(5, (row.revenue / maxRevenue) * 100)}%` }}>
                          <span className="text-xs text-white font-semibold whitespace-nowrap">{formatRupiah(row.revenue)}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right shrink-0">{row.order_count} order</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'top' && (
            <div className="card p-5 animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4">Menu Terlaris</h3>
              {topMenus.length === 0 ? <p className="text-center text-gray-400 py-8">Tidak ada data</p> : (
                <div className="space-y-3">
                  {topMenus.map((menu, idx) => (
                    <div key={menu.menu_id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`}>{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{menu.menu_name}</p>
                        <div className="mt-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-primary-600 rounded-full" style={{ width: `${(menu.total_quantity / maxQty) * 100}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{menu.total_quantity} porsi</p>
                        <p className="text-xs text-gray-500">{formatRupiah(menu.total_revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'transactions' && (
            <div className="card overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-800">{transactions.length} Transaksi</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['#', 'Tanggal', 'Meja', 'Item', 'Total', 'Metode', 'Status'].map(h => (
                        <th key={h} className="text-left p-3 font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-400 text-xs">#{tx.id}</td>
                        <td className="p-3 text-xs">{new Date(tx.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="p-3 font-semibold">{tx.table_number}</td>
                        <td className="p-3 text-xs text-gray-600 max-w-36 truncate">{tx.items_summary || '—'}</td>
                        <td className="p-3 font-semibold">{formatRupiah(tx.total_amount)}</td>
                        <td className="p-3">
                          <span className={`badge ${tx.payment_method === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                            {tx.payment_method}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="badge bg-gray-100 text-gray-700">{STATUS_LABELS[tx.status] || tx.status}</span>
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-gray-400">Tidak ada transaksi</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
