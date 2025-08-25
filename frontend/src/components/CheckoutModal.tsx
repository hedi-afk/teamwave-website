import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder, CreateOrderData } from '../services/orderService';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, onOrderSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerLocation: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.customerLocation) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData: CreateOrderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone,
        customerLocation: formData.customerLocation,
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        notes: formData.notes || undefined,
      };

      await createOrder(orderData);
      onOrderSuccess();
      onClose();
      
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerLocation: '',
        notes: '',
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-purple border-2 border-neon-purple rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-pixel text-white">CHECKOUT</h2>
              <button
                onClick={onClose}
                className="text-neon-red hover:text-red-400 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Order Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-pixel text-neon-purple mb-3">ORDER SUMMARY</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">
                      {item.name} x{item.quantity}
                    </span>
                                         <span className="text-neon-pink">{(item.price * item.quantity).toFixed(2)} DT</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neon-purple/50 pt-2 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-pixel">TOTAL:</span>
                                     <span className="text-neon-pink font-arcade text-lg">{totalAmount.toFixed(2)} DT</span>
                </div>
              </div>
            </div>

            {/* Customer Information Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-neon-purple font-pixel text-sm mb-2">
                  FULL NAME *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-neon-purple font-pixel text-sm mb-2">
                  EMAIL (OPTIONAL)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-neon-purple font-pixel text-sm mb-2">
                  PHONE NUMBER *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-neon-purple font-pixel text-sm mb-2">
                  LOCATION *
                </label>
                <input
                  type="text"
                  name="customerLocation"
                  value={formData.customerLocation}
                  onChange={handleInputChange}
                  className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink"
                  placeholder="Enter your location/address"
                  required
                />
              </div>

              <div>
                <label className="block text-neon-purple font-pixel text-sm mb-2">
                  NOTES (OPTIONAL)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink resize-none"
                  placeholder="Any special instructions or notes"
                  rows={3}
                />
              </div>

              {error && (
                <div className="text-neon-red text-sm text-center p-2 bg-red-900/20 border border-neon-red rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 pixel-btn border-neon-red text-neon-red hover:bg-neon-red hover:text-white"
                  disabled={loading}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 pixel-btn bg-neon-purple text-white hover:bg-white hover:text-dark-purple"
                  disabled={loading}
                >
                  {loading ? 'PROCESSING...' : 'PLACE ORDER'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
