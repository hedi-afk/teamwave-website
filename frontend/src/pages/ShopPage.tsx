import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import config from '../config';

interface Product {
  _id: string;
  name: string;
  category: 'jerseys' | 'accessories' | 'peripherals';
  price: number;
  image: string;
  description: string;
  stock: number;
  rating: number;
}

const ShopPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'jerseys' | 'accessories' | 'peripherals'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${config.apiUrl}/products`);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="bg-retro-black min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Shop Hero */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pixel text-yellow-400 mb-3 sm:mb-4 px-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            TEAMWAVE SHOP
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Level up your gaming style with our exclusive merchandise
          </motion.p>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6">
          <div className="arcade-card p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:border-neon-pink text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  className={`pixel-btn text-xs sm:text-sm px-3 sm:px-4 py-2 ${activeCategory === 'all' ? 'bg-neon-purple text-white' : 'border-neon-purple text-neon-purple'}`}
                  onClick={() => setActiveCategory('all')}
                >
                  ALL
                </button>
                <button
                  className={`pixel-btn text-xs sm:text-sm px-3 sm:px-4 py-2 ${activeCategory === 'jerseys' ? 'bg-neon-pink text-white' : 'border-neon-pink text-neon-pink'}`}
                  onClick={() => setActiveCategory('jerseys')}
                >
                  JERSEYS
                </button>
                <button
                  className={`pixel-btn text-xs sm:text-sm px-3 sm:px-4 py-2 ${activeCategory === 'accessories' ? 'bg-neon-green text-white' : 'border-neon-green text-neon-green'}`}
                  onClick={() => setActiveCategory('accessories')}
                >
                  ACCESSORIES
                </button>
                <button
                  className={`pixel-btn text-xs sm:text-sm px-3 sm:px-4 py-2 ${activeCategory === 'peripherals' ? 'bg-neon-blue text-white' : 'border-neon-blue text-neon-blue'}`}
                  onClick={() => setActiveCategory('peripherals')}
                >
                  PERIPHERALS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-neon-purple text-xl font-pixel">LOADING...</div>
          </div>
        )}
        
        {error && (
          <div className="arcade-card p-6 text-center">
            <div className="text-neon-red text-xl font-pixel mb-2">ERROR</div>
            <p className="text-gray-300">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-300 text-lg">No products found matching your criteria.</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <motion.div
                  key={product._id}
                  className="arcade-card overflow-hidden group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={`${config.imageBaseUrl}${product.image}`}
                      alt={product.name}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/400x400/1A0033/FFFFFF?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-purple via-dark-purple/50 to-transparent opacity-80"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-pixel text-white mb-1">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <p className="text-neon-pink font-arcade">${product.price}</p>
                        <span className="text-sm text-gray-300">Stock: {product.stock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-300 text-sm mb-4">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-gray-300">{product.rating}</span>
                      </div>
                      <button
                        className="pixel-btn bg-neon-purple text-white hover:bg-white hover:text-dark-purple"
                        onClick={() => addToCart(product)}
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Shopping Cart */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-dark-purple/90 p-4 rounded-lg border-2 border-neon-purple"
          >
            <h3 className="text-lg font-pixel text-white mb-2">Shopping Cart</h3>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-gray-300">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-neon-pink">${item.price}</span>
                    <button
                      className="text-neon-red hover:text-red-400"
                      onClick={() => removeFromCart(item._id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t border-neon-purple/50 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-pixel">TOTAL:</span>
                  <span className="text-neon-pink font-arcade">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ShopPage; 