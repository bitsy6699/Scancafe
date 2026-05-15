import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle, Loader2, X, Search } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const UNITS = ['gram', 'ml', 'liter', 'kg', 'pcs', 'slice', 'cup', 'sachet']
const emptyForm = { name: '', unit: 'gram', stock: '', min_stock: '' }

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [showLowOnly, setShowLowOnly] = useState(false)

  const fetchIngredients = async () => {
    try {
      const { data } = await api.get('/ingredients')
      setIngredients(data.data)
    } catch { toast.error('Gagal memuat bahan baku') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchIngredients() }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, unit: item.unit, stock: item.stock, min_stock: item.min_stock }); setShowModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name) { toast.error('Nama wajib diisi'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/ingredients/${editing.id}`, form)
        toast.success('Bahan diperbarui')
      } else {
        await api.post('/ingredients', form)
        toast.success('Bahan ditambahkan')
      }
      setShowModal(false)
      fetchIngredients()
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Hapus "${item.name}"?`)) return
    try {
      await api.delete(`/ingredients/${item.id}`)
      toast.success('Bahan dihapus')
      fetchIngredients()
    } catch { toast.error('Gagal menghapus') }
  }

  const filtered = ingredients
    .filter(i => !showLowOnly || i.is_low_stock)
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  const lowCount = ingredients.filter(i => i.is_low_stock).length

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stok Bahan Baku</h1>
          <p className="text-sm text-gray-500">{ingredients.length} bahan · {lowCount > 0 && <span className="text-red-500 font-semibold">{lowCount} menipis</span>}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
          <Plus size={18} /> Tambah Bahan
        </button>
      </div>

      {lowCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0" />
          <p className="text-red-700 text-sm font-medium">{lowCount} bahan baku di bawah stok minimum!</p>
          <button onClick={() => setShowLowOnly(!showLowOnly)} className="ml-auto text-xs font-bold text-red-600 underline">
            {showLowOnly ? 'Lihat semua' : 'Filter stok tipis'}
          </button>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari bahan baku..." className="input-field pl-10 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Bahan</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Stok</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Min Stok</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Status</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(item => (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.is_low_stock ? 'bg-red-50/30' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {item.is_low_stock && <AlertTriangle size={15} className="text-red-500 shrink-0" />}
                        <span className="font-medium text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      <span className={item.is_low_stock ? 'text-red-600' : 'text-gray-800'}>
                        {item.stock} {item.unit}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-500">{item.min_stock} {item.unit}</td>
                    <td className="p-4 text-center">
                      {item.is_low_stock ? (
                        <span className="badge bg-red-100 text-red-700">⚠ Menipis</span>
                      ) : (
                        <span className="badge bg-green-100 text-green-700">✓ Aman</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Pencil size={15} className="text-gray-600" />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">{editing ? 'Edit Bahan' : 'Tambah Bahan'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="label-text">Nama Bahan *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="Contoh: Biji Kopi" required />
              </div>
              <div>
                <label className="label-text">Satuan</label>
                <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="input-field">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Stok Saat Ini</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="input-field" placeholder="0" min="0" step="0.1" />
                </div>
                <div>
                  <label className="label-text">Stok Minimum</label>
                  <input type="number" value={form.min_stock} onChange={e => setForm({...form, min_stock: e.target.value})} className="input-field" placeholder="0" min="0" step="0.1" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
