import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, X, Image, Search } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const CATEGORIES = [
  { value: 'drinks', label: '☕ Minuman' },
  { value: 'food', label: '🍞 Makanan' },
  { value: 'snack', label: '🍪 Snack' },
]

const emptyForm = { name: '', description: '', price: '', category: 'drinks', is_available: true }

export default function MenuManagementPage() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const fetchMenus = async () => {
    try {
      const { data } = await api.get('/menus')
      setMenus(data.data)
    } catch {
      toast.error('Gagal memuat menu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMenus() }, [])

  const openAdd = () => {
    setEditingMenu(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview('')
    setShowModal(true)
  }

  const openEdit = (menu) => {
    setEditingMenu(menu)
    setForm({
      name: menu.name, description: menu.description || '',
      price: menu.price, category: menu.category || 'drinks',
      is_available: menu.is_available === 1
    })
    setImageFile(null)
    setImagePreview(menu.image_url ? `${API_BASE}${menu.image_url}` : '')
    setShowModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Nama dan harga wajib diisi'); return }
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (imageFile) formData.append('image', imageFile)

      if (editingMenu) {
        await api.put(`/menus/${editingMenu.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Menu berhasil diperbarui')
      } else {
        await api.post('/menus', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Menu berhasil ditambahkan')
      }
      setShowModal(false)
      fetchMenus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan menu')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (menu) => {
    try {
      await api.patch(`/menus/${menu.id}/availability`)
      fetchMenus()
      toast.success(`${menu.name} ${menu.is_available ? 'dinonaktifkan' : 'diaktifkan'}`)
    } catch { toast.error('Gagal mengubah status') }
  }

  const handleDelete = async (menu) => {
    if (!confirm(`Hapus menu "${menu.name}"?`)) return
    try {
      await api.delete(`/menus/${menu.id}`)
      toast.success('Menu dihapus')
      fetchMenus()
    } catch { toast.error('Gagal menghapus menu') }
  }

  const filtered = menus
    .filter(m => categoryFilter === 'all' || m.category === categoryFilter)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Menu</h1>
          <p className="text-sm text-gray-500">{menus.length} item tersedia</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
          <Plus size={18} /> Tambah Menu
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari menu..." className="input-field pl-10 text-sm" />
        </div>
        <div className="flex gap-2">
          {['all', 'drinks', 'food', 'snack'].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${categoryFilter === cat ? 'bg-primary-800 text-white border-primary-800' : 'bg-white text-gray-600 border-gray-200'}`}>
              {cat === 'all' ? 'Semua' : cat === 'drinks' ? '☕ Minum' : cat === 'food' ? '🍞 Makan' : '🍪 Snack'}
            </button>
          ))}
        </div>
      </div>

      {/* Menu grid */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(menu => (
            <div key={menu.id} className={`card transition-all duration-200 ${!menu.is_available ? 'opacity-60' : ''}`}>
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                {menu.image_url ? (
                  <img src={`${API_BASE}${menu.image_url}`} alt={menu.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={40} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`badge ${menu.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {menu.is_available ? 'Tersedia' : 'Habis'}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-800 text-sm truncate">{menu.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{menu.description || '—'}</p>
                <p className="text-primary-700 font-bold text-sm mt-1.5">{formatRupiah(menu.price)}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <button onClick={() => openEdit(menu)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-colors">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleToggle(menu)} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Toggle available">
                    {menu.is_available ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} className="text-gray-400" />}
                  </button>
                  <button onClick={() => handleDelete(menu)} className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Image upload */}
              <div>
                <label className="label-text">Foto Menu</label>
                <label className="block cursor-pointer">
                  <div className={`h-32 rounded-xl border-2 border-dashed overflow-hidden flex items-center justify-center ${imagePreview ? 'border-primary-300' : 'border-gray-300 hover:border-primary-400'} transition-colors`}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Image size={28} className="mx-auto text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Klik untuk upload</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <div>
                <label className="label-text">Nama Menu *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="Contoh: Cappuccino" required />
              </div>
              <div>
                <label className="label-text">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" rows={2} placeholder="Deskripsi singkat menu" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Harga (Rp) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" placeholder="25000" min="0" required />
                </div>
                <div>
                  <label className="label-text">Kategori</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_available" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} className="w-4 h-4 accent-primary-800" />
                <label htmlFor="is_available" className="text-sm font-medium text-gray-700">Tersedia untuk dipesan</label>
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
