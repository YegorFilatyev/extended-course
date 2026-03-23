import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrdersByUser } from '../services/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrdersByUser();
      if (response.orders) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="orders-container">
      <h2>Мои заказы</h2>

      {orders.length === 0 ? (
        <p>У вас пока нет заказов</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <Link to={`/orders/${order.order_id}`} key={order.order_id} className="order-card">
              <div className="order-info">
                <div className="order-header">
                  <span className="order-id">Заказ №{order.order_id}</span>
                  <span className="order-date">{formatDate(order.date_order)}</span>
                </div>
                <div className="order-details">
                  <span>Товаров: {order.products_count} шт.</span>
                  <span className="order-cost">{order.cost} ₽</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;