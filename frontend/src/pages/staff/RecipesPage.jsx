import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, X, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function RecipesPage() {
  const [menus, setMenus] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedMenu, setExpandedMenu] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [form, setForm] = useState({ ingredient_id: '', quantity_needed: '' })
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    try {
      const [menusRes, ingRes, recipesRes] = await Promise.all([
        api.get('/menus'),
        api.get('/ingredients'),
        api.get('/recipes'),
      ])
      setMenus(menusRes.data.data)
      setIngredients(ingRes.data.data)
      setRecipes(recipesRes.data.data)
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const getRecipesForMenu = (menuId) => recipes.filter(r => r.menu_id === menuId)

  const openAddRecipe = (menu) => {
    setSelectedMenu(menu)
    setForm({ ingredient_id: '', quantity_needed: '' })
    setShowModal(true)
  }

  const handleAddRecipe = async (e) => {
    e.preventDefault()
    if (!form.ingredient_id || !form.quantity_needed) { toast.error('Semua field wajib diisi'); return }
    setSaving(true)
    try {
      await api.post('/recipes', {
        menu_id: selectedMenu.id,
        ingredient_id: parseInt(form.ingredient_id),
        quantity_needed: parseFloat(form.quantity_needed)
      })
      toast.success('Resep ditambahkan')
      setShowModal(false)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambah resep')
    } finally { setSaving(false) }
  }

  const handleDeleteRecipe = async (recipeId, menuName) => {
    if (!confirm(`Hapus bahan ini dari resep ${menuName}?`)) return
    try {
      await api.delete(`/recipes/${recipeId}`)
      toast.success('Resep dihapus')
      fetchAll()
    } catch { toast.error('Gagal menghapus') }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Resep</h1>
        <p className="text-sm text-gray-500">Kelola bahan baku yang dibutuhkan untuk setiap menu</p>
      </div>

      <div className="space-y-3">
        {menus.length === 0 ? (
          <div className="card p-8 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-800">Belum Ada Menu Cafe</p>
            <p className="text-sm text-gray-500 mt-1 mb-6">Kamu harus menambahkan menu terlebih dahulu di halaman "Menu Cafe" sebelum bisa mengatur resep bahan bakunya.</p>
            <a href="/dashboard/menu" className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-4 mx-auto">
              <Plus size={16} /> Buat Menu Sekarang
            </a>
          </div>
        ) : (
          menus.map(menu => {
            const menuRecipes = getRecipesForMenu(menu.id)
            const isOpen = expandedMenu === menu.id
            return (
              <div key={menu.id} className="card overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedMenu(isOpen ? null : menu.id)}
                >
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-primary-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{menu.name}</p>
                    <p className="text-xs text-gray-500">
                      {menuRecipes.length > 0 ? `${menuRecipes.length} bahan` : 'Belum ada resep'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${menu.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {menu.is_available ? 'Tersedia' : 'Habis'}
                    </span>
                    {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4 animate-fade-in">
                    {menuRecipes.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-3">Belum ada bahan baku untuk menu ini</p>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {menuRecipes.map(recipe => {
                          const ing = ingredients.find(i => i.id === recipe.ingredient_id)
                          const hasEnough = ing && ing.stock >= recipe.quantity_needed
                          return (
                            <div key={recipe.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${hasEnough ? 'bg-green-400' : 'bg-red-400'}`} />
                                <span className="text-sm font-medium text-gray-800">{recipe.ingredient_name}</span>
                                <span className="text-xs text-gray-500">{recipe.quantity_needed} {recipe.unit}</span>
                                {!hasEnough && <span className="badge bg-red-100 text-red-600">Kurang!</span>}
                              </div>
                              <button
                                onClick={() => handleDeleteRecipe(recipe.id, menu.name)}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} className="text-red-400" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <button
                      onClick={() => openAddRecipe(menu)}
                      className="flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors"
                    >
                      <Plus size={16} /> Tambah Bahan ke Resep
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800">Tambah Bahan ke Resep</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedMenu?.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddRecipe} className="p-5 space-y-4">
              <div>
                <label className="label-text">Bahan Baku</label>
                <select value={form.ingredient_id} onChange={e => setForm({...form, ingredient_id: e.target.value})} className="input-field" required>
                  <option value="">Pilih bahan...</option>
                  {ingredients.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (stok: {i.stock} {i.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">Jumlah yang Dibutuhkan</label>
                <div className="flex gap-2">
                  <input
                    type="number" value={form.quantity_needed}
                    onChange={e => setForm({...form, quantity_needed: e.target.value})}
                    className="input-field" placeholder="0" min="0.01" step="0.01" required
                  />
                  <div className="px-4 py-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 shrink-0">
                    {ingredients.find(i => i.id == form.ingredient_id)?.unit || 'unit'}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? 'Menyimpan...' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
