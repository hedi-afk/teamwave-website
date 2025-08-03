import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'TeamWave Official Jersey',
      category: 'Apparel',
      price: 59.99,
      stock: 25,
      image: '/images/shop/jersey.jpg',
      description: 'Official team jersey with logo and sponsored branding.'
    },
    {
      id: '2',
      name: 'Gaming Mouse Pad XL',
      category: 'Accessories',
      price: 24.99,
      stock: 50,
      image: '/images/shop/mousepad.jpg',
      description: 'Extra large gaming mouse pad with TeamWave logo.'
    },
    {
      id: '3',
      name: 'TeamWave Snapback Cap',
      category: 'Apparel',
      price: 29.99,
      stock: 35,
      image: '/images/shop/cap.jpg',
      description: 'Stylish snapback cap with embroidered logo.'
    },
    {
      id: '4',
      name: 'LED Gaming Keyboard',
      category: 'Hardware',
      price: 149.99,
      stock: 10,
      image: '/images/shop/keyboard.jpg',
      description: 'Mechanical gaming keyboard with custom TeamWave keycaps.'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredProducts = activeFilter === 'all' 
    ? products 
    : products.filter(product => product.category.toLowerCase() === activeFilter.toLowerCase());

  const sumStock = products.reduce((sum, product) => sum + product.stock, 0);
  const sumValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const uniqueCategories = ['all', ...Array.from(new Set(products.map(product => product.category.toLowerCase())))];

  return (
    <div className="min-h-screen bg-retro-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neon-pink">Shop Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-400 text-dark-purple px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors"
          >
            Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-dark-purple-light p-6 rounded-lg border border-neon-purple/20">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Total Products</h2>
            <p className="text-3xl font-bold text-yellow-400">{products.length}</p>
          </div>
          <div className="bg-dark-purple-light p-6 rounded-lg border border-neon-purple/20">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Total Stock</h2>
            <p className="text-3xl font-bold text-yellow-400">{sumStock}</p>
          </div>
          <div className="bg-dark-purple-light p-6 rounded-lg border border-neon-purple/20">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Inventory Value</h2>
            <p className="text-3xl font-bold text-yellow-400">${sumValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {uniqueCategories.map((category) => (
              <button
                key={category}
                className={`px-3 py-1 rounded-full text-sm transition-colors capitalize ${
                  activeFilter === category 
                    ? 'bg-yellow-400 text-dark-purple' 
                    : 'bg-dark-purple-light text-gray-300 hover:bg-yellow-400/40'
                }`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-dark-purple-light rounded-lg border border-neon-purple/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-purple/20">
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neon-purple/20">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neon-purple/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-dark-purple">
                          <img src={product.image} alt={product.name} className="h-10 w-10 object-cover" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{product.name}</div>
                          <div className="text-xs text-gray-400 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.category.toLowerCase() === 'apparel' ? 'bg-purple-500/20 text-purple-400' :
                        product.category.toLowerCase() === 'accessories' ? 'bg-blue-500/20 text-blue-400' :
                        product.category.toLowerCase() === 'hardware' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">${product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${product.stock < 10 ? 'text-red-400' : 'text-white'}`}>{product.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-neon-blue hover:text-neon-blue/80 mr-3">Edit</button>
                      <button className="text-red-500 hover:text-red-400">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal - simplified for this example */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-purple-light p-6 rounded-lg w-full max-w-2xl"
            >
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Add Product</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Product Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Category</label>
                    <select className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white">
                      <option>Apparel</option>
                      <option>Accessories</option>
                      <option>Hardware</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Stock</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white h-24"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Product Image</label>
                  <input
                    type="file"
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-white hover:text-yellow-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-400 text-dark-purple rounded-md hover:bg-yellow-300 transition-colors"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage; 