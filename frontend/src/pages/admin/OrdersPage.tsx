import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllOrders, updateOrderStatus, deleteOrder, getOrderStats, Order, OrderStats } from '../../services/orderService';
import config from '../../config';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
      setError('');
    } catch (error: any) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getOrderStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      setError('Failed to update order status');
      console.error('Error updating order:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        fetchOrders();
        fetchStats();
      } catch (error: any) {
        setError('Failed to delete order');
        console.error('Error deleting order:', error);
      }
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'confirmed': return 'text-blue-400';
      case 'shipped': return 'text-purple-400';
      case 'delivered': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-retro-black min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-pixel text-yellow-400 mb-2">ORDERS MANAGEMENT</h1>
          <p className="text-gray-300">Manage shop orders and track their status</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="arcade-card p-4 text-center">
              <div className="text-2xl font-pixel text-white">{stats.totalOrders}</div>
              <div className="text-sm text-gray-300">Total Orders</div>
            </div>
            <div className="arcade-card p-4 text-center">
              <div className="text-2xl font-pixel text-yellow-400">{stats.pendingOrders}</div>
              <div className="text-sm text-gray-300">Pending</div>
            </div>
            <div className="arcade-card p-4 text-center">
              <div className="text-2xl font-pixel text-blue-400">{stats.confirmedOrders}</div>
              <div className="text-sm text-gray-300">Confirmed</div>
            </div>
            <div className="arcade-card p-4 text-center">
              <div className="text-2xl font-pixel text-purple-400">{stats.shippedOrders}</div>
              <div className="text-sm text-gray-300">Shipped</div>
            </div>
            <div className="arcade-card p-4 text-center">
              <div className="text-2xl font-pixel text-green-400">{stats.deliveredOrders}</div>
              <div className="text-sm text-gray-300">Delivered</div>
            </div>
            <div className="arcade-card p-4 text-center">
              <div className="text-2xl font-pixel text-red-400">{stats.cancelledOrders}</div>
              <div className="text-sm text-gray-300">Cancelled</div>
            </div>
                         <div className="arcade-card p-4 text-center">
               <div className="text-2xl font-pixel text-neon-pink">{stats.totalRevenue.toFixed(2)} DT</div>
               <div className="text-sm text-gray-300">Revenue</div>
             </div>
          </div>
        )}

        {/* Filters */}
        <div className="arcade-card p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              className={`pixel-btn text-sm ${selectedStatus === 'all' ? 'bg-neon-purple text-white' : 'border-neon-purple text-neon-purple'}`}
              onClick={() => setSelectedStatus('all')}
            >
              ALL
            </button>
            <button
              className={`pixel-btn text-sm ${selectedStatus === 'pending' ? 'bg-yellow-400 text-black' : 'border-yellow-400 text-yellow-400'}`}
              onClick={() => setSelectedStatus('pending')}
            >
              PENDING
            </button>
            <button
              className={`pixel-btn text-sm ${selectedStatus === 'confirmed' ? 'bg-blue-400 text-black' : 'border-blue-400 text-blue-400'}`}
              onClick={() => setSelectedStatus('confirmed')}
            >
              CONFIRMED
            </button>
            <button
              className={`pixel-btn text-sm ${selectedStatus === 'shipped' ? 'bg-purple-400 text-black' : 'border-purple-400 text-purple-400'}`}
              onClick={() => setSelectedStatus('shipped')}
            >
              SHIPPED
            </button>
            <button
              className={`pixel-btn text-sm ${selectedStatus === 'delivered' ? 'bg-green-400 text-black' : 'border-green-400 text-green-400'}`}
              onClick={() => setSelectedStatus('delivered')}
            >
              DELIVERED
            </button>
            <button
              className={`pixel-btn text-sm ${selectedStatus === 'cancelled' ? 'bg-red-400 text-black' : 'border-red-400 text-red-400'}`}
              onClick={() => setSelectedStatus('cancelled')}
            >
              CANCELLED
            </button>
          </div>
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
            <div className="text-neon-purple text-xl font-pixel">LOADING ORDERS...</div>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="arcade-card p-8 text-center">
                <div className="text-gray-300 text-lg">No orders found.</div>
              </div>
            ) : (
              filteredOrders.map(order => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="arcade-card p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <h3 className="text-lg font-pixel text-white">Order #{order._id.slice(-8)}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-pixel uppercase ${getStatusColor(order.status)} border ${getStatusColor(order.status).replace('text-', 'border-')}`}>
                          {order.status}
                        </span>
                        <span className="text-gray-400 text-sm">{formatDate(order.createdAt)}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-neon-purple font-pixel">Customer:</span>
                          <div className="text-white">{order.customerName}</div>
                        </div>
                        <div>
                          <span className="text-neon-purple font-pixel">Phone:</span>
                          <div className="text-white">{order.customerPhone}</div>
                        </div>
                        <div>
                          <span className="text-neon-purple font-pixel">Location:</span>
                          <div className="text-white">{order.customerLocation}</div>
                        </div>
                                                 <div>
                           <span className="text-neon-purple font-pixel">Total:</span>
                           <div className="text-neon-pink font-arcade">{order.totalAmount.toFixed(2)} DT</div>
                         </div>
                      </div>

                      {order.customerEmail && (
                        <div className="mt-2">
                          <span className="text-neon-purple font-pixel text-sm">Email:</span>
                          <span className="text-white text-sm ml-2">{order.customerEmail}</span>
                        </div>
                      )}

                      {order.notes && (
                        <div className="mt-2">
                          <span className="text-neon-purple font-pixel text-sm">Notes:</span>
                          <span className="text-gray-300 text-sm ml-2">{order.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        className="pixel-btn bg-neon-purple text-white hover:bg-white hover:text-dark-purple text-sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                      >
                        VIEW DETAILS
                      </button>
                      
                      <select
                        className="bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink text-sm"
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <button
                        className="pixel-btn border-neon-red text-neon-red hover:bg-neon-red hover:text-white text-sm"
                        onClick={() => handleDeleteOrder(order._id)}
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

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-purple border-2 border-neon-purple rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-pixel text-white">Order Details</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-neon-red hover:text-red-400 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="text-lg font-pixel text-neon-purple mb-3">ORDER INFORMATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-300">Order ID:</span>
                    <div className="text-white font-mono">{selectedOrder._id}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Status:</span>
                    <div className={`font-pixel ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-300">Created:</span>
                    <div className="text-white">{formatDate(selectedOrder.createdAt)}</div>
                  </div>
                                     <div>
                     <span className="text-gray-300">Total Amount:</span>
                     <div className="text-neon-pink font-arcade">{selectedOrder.totalAmount.toFixed(2)} DT</div>
                   </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-pixel text-neon-purple mb-3">CUSTOMER INFORMATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-300">Name:</span>
                    <div className="text-white">{selectedOrder.customerName}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Phone:</span>
                    <div className="text-white">{selectedOrder.customerPhone}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Location:</span>
                    <div className="text-white">{selectedOrder.customerLocation}</div>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div>
                      <span className="text-gray-300">Email:</span>
                      <div className="text-white">{selectedOrder.customerEmail}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-pixel text-neon-purple mb-3">ORDER ITEMS</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-dark-purple/30 rounded">
                      <div>
                        <div className="text-white font-medium">{item.name}</div>
                        <div className="text-gray-300 text-sm">Quantity: {item.quantity}</div>
                      </div>
                                             <div className="text-neon-pink font-arcade">
                         {(item.price * item.quantity).toFixed(2)} DT
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-pixel text-neon-purple mb-3">NOTES</h3>
                  <div className="text-gray-300 p-3 bg-dark-purple/30 rounded">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
