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
    setPrice(0);
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
    setCategoryId(prod.categoryId);
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
    setFormError(null);
    setModalOpen(true);
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
      loadData();
    } catch (err: any) {
      alert(`Could not duplicate product: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${prodName}"?`)) return;
    try {
      await api.deleteProduct(id);
      loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
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
    if (price <= 0) {
      setFormError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload: Partial<Product> = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: sku.trim() || `ZC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      categoryId,
      price: Number(price),
      salePrice: salePrice && Number(salePrice) > 0 ? Number(salePrice) : undefined,
      stock: Number(stock),
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
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
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
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17191F]">Product Catalog</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage automotive pieces, specs, pricing, and variants.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#17191F] text-white text-xs font-bold hover:bg-[#5B5FEF] transition-colors"
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
              <option key={c.id} value={c.id}>{c.name}</option>
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
            No products found matching your search.
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
                  <th className="py-3 px-4">Badges</th>
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
                      <span className={`font-mono font-bold ${
                        p.stock <= 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-[#17191F]'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {p.isBestseller && (
                          <span className="p-1 bg-[#FF7547]/10 text-[#FF7547] rounded" title="Bestseller">
                            <Flame size={12} />
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="p-1 bg-amber-100 text-amber-700 rounded" title="Featured">
                            <Star size={12} />
                          </span>
                        )}
                        {p.isNewArrival && (
                          <span className="p-1 bg-[#5B5FEF]/10 text-[#5B5FEF] rounded" title="New Arrival">
                            <Sparkles size={12} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {p.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Eye size={10} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                          <EyeOff size={10} /> Draft
                        </span>
                      )}
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
              </div>

              {/* Product Images Manager */}
              <div className="space-y-3 pt-4 border-t border-[#E7E3D8]">
                <label className="block text-xs font-bold uppercase text-zinc-700">Product Images</label>
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
                    <span className="text-[10px] mt-1 font-bold">Upload</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
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
