import React, { useEffect, useState } from 'react'
import './Orders.css'
import { toast } from 'react-toastify';
import { assets, currency } from '../../assets/assets';
import { orderApi } from '../../lib/api';

const Order = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const newStatus = event.target.value;
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      await fetchAllOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [])

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="order-list">
          {orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            orders.map((order, index) => (
              <div key={index} className='order-item'>
                <img src={assets.parcel_icon} alt="" />
                <div>
                  <p className='order-item-name'>{order.customer_name}</p>
                  <p className='order-item-name'>{order.customer_email}</p>
                  <div className='order-item-address'>
                    <p>{order.delivery_address}</p>
                  </div>
                  <p className='order-item-phone'>{order.customer_phone}</p>
                  {order.special_instructions && (
                    <p style={{ fontStyle: 'italic', marginTop: '5px' }}>
                      Note: {order.special_instructions}
                    </p>
                  )}
                </div>
                <p>{currency}{order.total_amount}</p>
                <select 
                  onChange={(e) => statusHandler(e, order.id)} 
                  value={order.order_status}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Order
