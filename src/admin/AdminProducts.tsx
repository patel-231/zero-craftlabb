import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Upload,
  Check,
  X,
  Star,
  Eye,
  EyeOff,
  Flame,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Product, Category, ProductVariant } from '../types/index.ts';
import { api } from '../services/api.ts';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number>(10);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  // Variants and Specs state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.getProducts(true),
        api.getCategories(true),
      ]);
      setProducts(pRes.products);
      setCategories(cRes.categories);
      if (cRes.categories.length > 0 && !categoryId) {
        setCategoryId(cRes.categories[0].id);
      }
    } catch (err) {
      console.error('Failed to load products/categories in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setSku('');
    setCategoryId(categories[0]?.id || '');
    setPrice(1499);
    setSalePrice(undefined);
    setStock(10);
    setShortDescription('');
    setDescription('');
    setImages([]);
    setPrimaryImage('');
    setIsPublished(true);
    setIsFeatured(false);
    setIsBestseller(false);
    setIsNewArrival(false);
    setVariants([]);
    setSpecs({});
    setTags([]);
    setTagInput('');
    setImageUrlInput('');
    setNewSpecKey('');
    setNewSpecVal('');
    setEditingProduct(null);
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSlug(prod.slug);
    setSku(prod.sku);
    setCategoryId(prod.categoryId || (categories[0]?.id || ''));
    setPrice(prod.price);
    setSalePrice(prod.salePrice);
    setStock(prod.stock);
    setShortDescription(prod.shortDescription || '');
    setDescription(prod.description || '');
    setImages(prod.images || []);
    setPrimaryImage(prod.primaryImage || (prod.images && prod.images[0]) || '');
    setIsPublished(prod.isPublished);
    setIsFeatured(prod.isFeatured);
    setIsBestseller(prod.isBestseller);
    setIsNewArrival(prod.isNewArrival);
    setVariants(prod.variants || []);
    setSpecs(prod.specifications || {});
    setTags(prod.tags || []);
    setTagInput((prod.tags || []).join(', '));
    setImageUrlInput('');
    setNewSpecKey('');
    setNewSpecVal('');
    setFormError(null);
    setModalOpen(true);
  };

  // Quick In-Table Toggles
  const handleTogglePublished = async (prod: Product) => {
    try {
      await api.updateProduct(prod.id, { isPublished: !prod.isPublished });
      showToast(`"${prod.name}" marked as ${!prod.isPublished ? 'Published' : 'Draft'}.`);
      loadData();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleToggleBestseller = async (prod: Product) => {
    try {
      await api.updateProduct(prod.id, { isBestseller: !prod.isBestseller });
      showToast(`"${prod.name}" bestseller badge ${!prod.isBestseller ? 'enabled' : 'disabled'}.`);
      loadData();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleToggleFeatured = async (prod: Product) => {
    try {
      await api.updateProduct(prod.id, { isFeatured: !prod.isFeatured });
      showToast(`"${prod.name}" featured status ${!prod.isFeatured ? 'enabled' : 'disabled'}.`);
      loadData();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleToggleNewArrival = async (prod: Product) => {
    try {
      await api.updateProduct(prod.id, { isNewArrival: !prod.isNewArrival });
      showToast(`"${prod.name}" new arrival badge ${!prod.isNewArrival ? 'enabled' : 'disabled'}.`);
      loadData();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDuplicate = async (prod: Product) => {
    try {
      const dupData: Partial<Product> = {
        ...prod,
        id: undefined,
        name: `${prod.name} (Copy)`,
        slug: `${prod.slug}-copy-${Date.now().toString().slice(-4)}`,
        sku: `${prod.sku}-CP`,
      };
      await api.createProduct(dupData);
      showToast(`Duplicated "${prod.name}"!`);
      loadData();
    } catch (err: any) {
      alert(`Could not duplicate product: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${prodName}"?`)) return;
    try {
      await api.deleteProduct(id);
      showToast(`Deleted "${prodName}"!`);
      loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Direct image URL adder
  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    if (!primaryImage) setPrimaryImage(trimmed);
    setImageUrlInput('');
  };

  // Add Specification
  const handleAddSpec = () => {
    const k = newSpecKey.trim();
    const v = newSpecVal.trim();
    if (!k || !v) return;
    setSpecs((prev) => ({ ...prev, [k]: v }));
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (keyToRemove: string) => {
    setSpecs((prev) => {
      const next = { ...prev };
      delete next[keyToRemove];
      return next;
    });
  };

  // Image upload handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await api.uploadImage(base64, file.name);
          setImages((prev) => {
            const next = [...prev, res.url];
            if (!primaryImage) setPrimaryImage(res.url);
            return next;
          });
        } catch (err) {
          // Fallback: use raw data URL
          setImages((prev) => {
            const next = [...prev, base64];
            if (!primaryImage) setPrimaryImage(base64);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (Number(price) <= 0) {
      setFormError('Please enter a valid price greater than 0');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const chosenCategoryId = categoryId || (categories.length > 0 ? categories[0].id : '');

    // Parse tags from comma string if needed
    const parsedTags = tagInput
      ? tagInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : tags;

    const payload: Partial<Product> = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      sku: sku.trim() || `ZC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      categoryId: chosenCategoryId,
      price: Number(price),
      salePrice: salePrice && Number(salePrice) > 0 ? Number(salePrice) : undefined,
      stock: Number(stock) >= 0 ? Number(stock) : 10,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'],
      primaryImage: primaryImage || images[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      isPublished,
      isFeatured,
      isBestseller,
      isNewArrival,
      variants,
      specifications: specs,
      tags: parsedTags,
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast(`Product "${payload.name}" updated successfully!`);
      } else {
        await api.createProduct(payload);
        showToast(`Product "${payload.name}" created successfully!`);
      }
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCatFilter !== 'all' && p.categoryId !== selectedCatFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#17191F] text-white px-4 py-3 rounded-2xl shadow-2xl border border-zinc-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17191F]">Product Catalog</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage automotive pieces, specs, pricing, and variants. Click any status badge below to toggle immediately.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#17191F] text-white text-xs font-bold hover:bg-[#5B5FEF] transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E7E3D8] rounded-xl text-xs focus:outline-none focus:border-[#5B5FEF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-500 font-medium">Category:</span>
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="bg-[#F7F5F0] border border-[#E7E3D8] px-3 py-2 rounded-xl text-xs font-bold text-[#17191F] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E7E3D8] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No products found matching your search. Click "New Product" to add your first automotive piece.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F0] border-b border-[#E7E3D8] text-zinc-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Badges (Click to Toggle)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3D8]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primaryImage || '/placeholder.png'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-zinc-100 border border-zinc-200"
                        />
                        <div>
                          <div className="font-bold text-[#17191F] line-clamp-1">{p.name}</div>
                          <div className="font-mono text-[10px] text-zinc-400">SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 font-medium">
                      {p.categoryName || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#17191F]">₹{p.price.toLocaleString('en-IN')}</div>
                      {p.salePrice && (
                        <div className="text-[10px] text-emerald-600 font-semibold">Sale: ₹{p.salePrice}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-bold ${
                          p.stock <= 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-[#17191F]'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBestseller(p)}
                          className={`p-1.5 rounded transition-colors ${
                            p.isBestseller
                              ? 'bg-[#FF7547] text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-400 hover:text-[#FF7547] hover:bg-orange-50'
                          }`}
                          title={`Bestseller: ${p.isBestseller ? 'Active (click to remove)' : 'Off (click to activate)'}`}
                        >
                          <Flame size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1.5 rounded transition-colors ${
                            p.isFeatured
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : 'bg-zinc-100 text-zinc-400 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                          title={`Featured: ${p.isFeatured ? 'Active (click to remove)' : 'Off (click to activate)'}`}
                        >
                          <Star size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleNewArrival(p)}
                          className={`p-1.5 rounded transition-colors ${
                            p.isNewArrival
                              ? 'bg-[#5B5FEF] text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-400 hover:text-[#5B5FEF] hover:bg-indigo-50'
                          }`}
                          title={`New Arrival: ${p.isNewArrival ? 'Active (click to remove)' : 'Off (click to activate)'}`}
                        >
                          <Sparkles size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(p)}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                          p.isPublished
                            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                            : 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300'
                        }`}
                        title="Click to toggle Published / Draft status in storefront"
                      >
                        {p.isPublished ? <Eye size={12} className="text-emerald-600" /> : <EyeOff size={12} className="text-zinc-400" />}
                        <span>{p.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-[#5B5FEF]"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-black"
                          title="Duplicate Product"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600"
                          title="Delete Product"
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

      {/* Product Edit / Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E7E3D8] w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E7E3D8] flex items-center justify-between bg-[#F7F5F0]">
              <h2 className="font-extrabold text-lg text-[#17191F]">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-[#17191F] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-6 flex-1">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Monza Formula Track Acrylic Wall Silhouette"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="ZC-ART-001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                  />
                </div>

                {/* Sale Price */}
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Sale Price (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={salePrice ?? ''}
                    onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Leave blank for regular price"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generated-from-name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                  />
                </div>

                {/* Short Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief 1-line summary displayed on product cards"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                  />
                </div>

                {/* Full Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Full Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed craftsmanship, materials, dimensions, mounting instructions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                  />
                </div>
                {/* Tags */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                    Tags (Comma-separated for search &amp; filters)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Automotive, F1, Track Art, Gift, Silhouette"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-sm focus:outline-none focus:border-[#5B5FEF]"
                  />
                </div>
              </div>

              {/* Product Images Manager */}
              <div className="space-y-3 pt-4 border-t border-[#E7E3D8]">
                <label className="block text-xs font-bold uppercase text-zinc-700">Product Images</label>
                
                {/* Paste Direct URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Paste direct image URL (https://...)"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-xs focus:outline-none focus:border-[#5B5FEF]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-[#17191F] text-white text-xs font-bold rounded-xl hover:bg-[#5B5FEF] transition-colors"
                  >
                    Add URL
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {images.map((imgUrl, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-300 group">
                      <img src={imgUrl} alt={`Prod ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = images.filter((_, idx) => idx !== i);
                          setImages(filtered);
                          if (primaryImage === imgUrl) setPrimaryImage(filtered[0] || '');
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md text-[10px]"
                      >
                        <X size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(imgUrl)}
                        className={`absolute bottom-1 left-1 right-1 py-0.5 text-[9px] font-bold rounded ${
                          primaryImage === imgUrl ? 'bg-[#5B5FEF] text-white' : 'bg-black/60 text-white hover:bg-black'
                        }`}
                      >
                        {primaryImage === imgUrl ? 'Primary' : 'Set Primary'}
                      </button>
                    </div>
                  ))}

                  {/* Upload button */}
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-300 hover:border-[#5B5FEF] flex flex-col items-center justify-center text-zinc-400 hover:text-[#5B5FEF] cursor-pointer transition-colors">
                    <Upload size={18} />
                    <span className="text-[10px] mt-1 font-bold">Upload File</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Specifications / Technical Details Manager */}
              <div className="space-y-3 pt-4 border-t border-[#E7E3D8]">
                <label className="block text-xs font-bold uppercase text-zinc-700">Specifications &amp; Features</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Feature / Key (e.g. Material)"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="sm:w-1/3 px-3 py-2 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 5mm Cast Acrylic)"
                    value={newSpecVal}
                    onChange={(e) => setNewSpecVal(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E7E3D8] bg-[#F7F5F0] text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-4 py-2 bg-zinc-200 text-zinc-800 hover:bg-[#17191F] hover:text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                  >
                    + Add Spec
                  </button>
                </div>

                {Object.entries(specs).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {Object.entries(specs).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between p-2.5 bg-[#F7F5F0] rounded-xl border border-[#E7E3D8] text-xs"
                      >
                        <div>
                          <strong className="text-zinc-800">{k}:</strong> <span className="text-zinc-600">{v}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(k)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility and Flags */}
              <div className="pt-4 border-t border-[#E7E3D8] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-[#5B5FEF]"
                  />
                  <span>Published</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#5B5FEF]"
                  />
                  <span>Featured</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="rounded text-[#5B5FEF]"
                  />
                  <span>Bestseller</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded text-[#5B5FEF]"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              {/* Save Footer */}
              <div className="pt-6 border-t border-[#E7E3D8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E7E3D8] text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#5B5FEF] text-white text-xs font-bold hover:bg-[#4d51df] transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
