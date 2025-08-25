import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllProducts, createProduct, updateProduct, deleteProduct, Product, CreateProductData } from '../../services/productService';
import uploadService from '../../services/uploadService';
import config from '../../config';

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    category: 'jerseys',
    price: 0,
    image: '',
    stock: 10, // Default stock value since field is hidden
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setError('');
    } catch (error: any) {
      setError('Failed to load products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || formData.price <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (imageFile) {
        const uploadResult = await uploadService.uploadImage(imageFile, 'products');
        imageUrl = uploadResult.url;
      }

      const productData = {
        ...formData,
        image: imageUrl,
      };

      if (selectedProduct) {
        // Update existing product
        await updateProduct(selectedProduct._id, productData);
      } else {
        // Create new product
        await createProduct(productData);
      }

      fetchProducts();
      handleCloseModal();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
    setImagePreview(product.image ? `${config.imageBaseUrl}${product.image}` : '');
    setImageFile(null);
    setShowEditModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (error: any) {
        setError('Failed to delete product');
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'jerseys',
      price: 0,
      image: '',
      stock: 10, // Default stock value since field is hidden
    });
    setImageFile(null);
    setImagePreview('');
    setError('');
  };

  const filteredProducts = activeFilter === 'all' 
    ? products 
    : products.filter(product => product.category === activeFilter);

  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const categories = ['all', 'jerseys', 'accessories', 'peripherals'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'jerseys': return 'bg-neon-pink/20 text-neon-pink';
      case 'accessories': return 'bg-neon-green/20 text-neon-green';
      case 'peripherals': return 'bg-neon-blue/20 text-neon-blue';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-retro-black min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-pixel text-yellow-400 mb-2">SHOP MANAGEMENT</h1>
          <p className="text-gray-300">Manage products and inventory</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="arcade-card p-6 text-center">
            <div className="text-2xl font-pixel text-white">{products.length}</div>
            <div className="text-sm text-gray-300">Total Products</div>
          </div>
          <div className="arcade-card p-6 text-center">
            <div className="text-2xl font-pixel text-neon-pink">{totalValue.toFixed(2)} DT</div>
            <div className="text-sm text-gray-300">Inventory Value</div>
          </div>
          <div className="arcade-card p-6 text-center">
            <div className="text-2xl font-pixel text-neon-green">{products.filter(p => p.stock > 0).length}</div>
            <div className="text-sm text-gray-300">In Stock</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`pixel-btn text-sm ${activeFilter === category ? 'bg-neon-purple text-white' : 'border-neon-purple text-neon-purple'}`}
                onClick={() => setActiveFilter(category)}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="pixel-btn bg-neon-green text-white hover:bg-white hover:text-dark-purple"
          >
            ADD PRODUCT
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="arcade-card p-4 mb-6 border-neon-red">
            <div className="text-neon-red text-center">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-neon-purple text-xl font-pixel">LOADING PRODUCTS...</div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-300 text-lg">No products found.</div>
              </div>
            ) : (
              filteredProducts.map(product => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="arcade-card overflow-hidden group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={`${config.imageBaseUrl}${product.image}`}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/400x300/1A0033/FFFFFF?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-purple via-dark-purple/50 to-transparent opacity-80"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-pixel text-white mb-1">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <p className="text-neon-pink font-arcade">{product.price.toFixed(2)} DT</p>
                        <span className={`px-2 py-1 text-xs font-pixel rounded ${getCategoryColor(product.category)}`}>
                          {product.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                      <span>Added: {formatDate(product.createdAt)}</span>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span>{product.rating}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 pixel-btn bg-neon-purple text-white hover:bg-white hover:text-dark-purple text-sm"
                        onClick={() => handleEdit(product)}
                      >
                        EDIT
                      </button>
                      <button
                        className="flex-1 pixel-btn border-neon-red text-neon-red hover:bg-neon-red hover:text-white text-sm"
                        onClick={() => handleDelete(product._id)}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-purple border-2 border-neon-purple rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-pixel text-white">
                  {selectedProduct ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-neon-red hover:text-red-400 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-neon-purple font-pixel text-sm mb-2">
                    PRODUCT NAME *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neon-purple font-pixel text-sm mb-2">
                    DESCRIPTION *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink resize-none"
                    placeholder="Enter product description"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neon-purple font-pixel text-sm mb-2">
                      CATEGORY *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink"
                      required
                    >
                      <option value="jerseys">JERSEYS</option>
                      <option value="accessories">ACCESSORIES</option>
                      <option value="peripherals">PERIPHERALS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-neon-purple font-pixel text-sm mb-2">
                      PRICE (DT) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neon-purple font-pixel text-sm mb-2">
                    PRODUCT IMAGE
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border border-neon-purple"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="text-neon-red text-sm text-center p-2 bg-red-900/20 border border-neon-red rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 pixel-btn border-neon-red text-neon-red hover:bg-neon-red hover:text-white"
                    disabled={submitting}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 pixel-btn bg-neon-purple text-white hover:bg-white hover:text-dark-purple"
                    disabled={submitting}
                  >
                    {submitting ? 'SAVING...' : (selectedProduct ? 'UPDATE' : 'ADD PRODUCT')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage; 