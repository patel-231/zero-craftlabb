import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Layers, Upload, X } from 'lucide-react';
import { Category } from '../types/index.ts';
import { api } from '../services/api.ts';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories(true);
      setCategories(res.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setCoverImage('');
    setDisplayOrder(categories.length + 1);
    setIsVisible(true);
    setEditingCategory(null);
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setCoverImage(cat.coverImage || '');
    setDisplayOrder(cat.displayOrder);
    setIsVisible(cat.isVisible);
    setFormError(null);
    setModalOpen(true);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleVisibility = async (cat: Category) => {
    try {
      await api.updateCategory(cat.id, { isVisible: !cat.isVisible });
      showToast(`Category "${cat.name}" is now ${!cat.isVisible ? 'Public' : 'Hidden'}.`);
      loadCategories();
    } catch (err: any) {
      alert(`Could not update category: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Delete category "${catName}"? Existing products will remain preserved.`)) return;
    try {
      await api.deleteCategory(id);
      showToast(`Category "${catName}" deleted.`);
      loadCategories();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await api.uploadImage(base64, file.name);
        setCoverImage(res.url);
      } catch {
        setCoverImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload: Partial<Category> = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      displayOrder: Number(displayOrder),
      isVisible,
    };

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
        showToast(`Category "${payload.name}" updated successfully!`);
      } else {
        await api.createCategory(payload);
        showToast(`Category "${payload.name}" created successfully!`);
      }
      setModalOpen(false);
      resetForm();
      loadCategories();
    } catch (err: any) {
      setFormError(err.message || 'Error saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#17191F] text-white px-4 py-3 rounded-2xl shadow-2xl border border-zinc-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17191F]">Catalog Categories</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Dynamic categories appear in storefront navigation and filters automatically.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#17191F] text-white text-xs font-bold hover:bg-[#5B5FEF] transition-colors"
        >
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid / Table */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No categories defined. Click "New Category" to create your first collection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F0] border-b border-[#E7E3D8] text-zinc-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3D8]">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-400">
                      #{c.displayOrder}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.coverImage || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'}
                          alt={c.name}
                          className="w-10 h-10 rounded-lg object-cover bg-zinc-100 border border-zinc-200"
                        />
                        <div>
                          <span className="font-bold text-[#17191F] block">{c.name}</span>
                          <span className="text-[11px] text-zinc-400 line-clamp-1">{c.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500">
                      /category/{c.slug}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(c)}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                          c.isVisible
                            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                            : 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300'
                        }`}
                        title="Click to toggle Public / Hidden visibility in store"
                      >
                        {c.isVisible ? <Eye size={12} className="text-emerald-600" /> : <EyeOff size={12} className="text-zinc-400" />}
                        <span>{c.isVisible ? 'Public (Click to Hide)' : 'Hidden (Click to Publish)'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-[#5B5FEF]"
                          title="Edit Category"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600"
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E3D8] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#E7E3D8] flex items-center justify-between bg-[#F7F5F0]">
              <h2 className="font-extrabold text-base text-[#17191F]">
                {editingCategory ? 'Edit Category' : 'Create New Collection'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Desk Accessories &amp; Paperweights"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="desk-accessories"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this collection..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="rounded text-[#5B5FEF]"
                    />
                    <span>Visible in Store</span>
                  </label>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Cover Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://... or upload"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-xs focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1">
                    <Upload size={13} />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7E3D8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E7E3D8] text-xs font-bold text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#5B5FEF] text-white text-xs font-bold hover:bg-[#4d51df]"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
