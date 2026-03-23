import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductsFromOrder, deleteOrder } from '../services/api';
import { FaTrash } from 'react-icons/fa';
import Modal from 'react-modal';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderProducts();
  }, [orderId]);

  const fetchOrderProducts = async () => {
    try {
      const response = await getProductsFromOrder(orderId);
      if (response.products) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error('Error fetching order products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
      try {
        console.log(1);
        const response = await deleteOrder(orderId);
        if (response.message) {
          navigate('/orders');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
      finally{
        setModalIsOpen(false);
      }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };
  
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const totalCost = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  if (loading) return <div className="loading">Загрузка...</div>;

  const modalContent = (
    <div className="modal-body confirm-modal">
      <p>Вы уверены, что хотите отменить заказ?</p>
      <div className="confirm-modal-actions">
        <button className="modal-btn modal-btn-primary" onClick={handleDeleteOrder}>Да</button>
        <button className="modal-btn modal-btn-danger" onClick={closeModal}>Нет</button>
      </div>
    </div>
  );

  return (
    <div className="order-details-container">
      <div className="order-header">
        <h2>Заказ №{orderId}</h2>
        <button onClick={openModal} className="btn-danger">
          <FaTrash /> Отменить заказ
        </button>
      </div>
      <Modal className="modal-content"
        overlayClassName="modal-overlay"
        isOpen={modalIsOpen} onRequestClose={closeModal}>
        {modalContent}
      </Modal>

      {products.length === 0 ? (
        <p>В заказе нет товаров</p>
      ) : (
        <>
          <div className="order-products">
            {products.map(product => (
              <div key={product.product_id} className="order-product">
                <div className="order-product-image">
                  <img 
                    src={product.image 
                      ? `http://localhost:8000/images/${product.image}`
                      : '/placeholder-image.jpg'
                    }
                    alt={product.product_name}
                  />
                </div>
                <div className="order-product-info">
                  <h3>
                    <Link to={`/product/${product.product_id}`}>
                      {product.product_name}
                    </Link>
                  </h3>
                  <p className="product-description">
                    {product.description && product.description.length > 100
                      ? product.description.substring(0, 100) + '...'
                      : product.description}
                  </p>
                </div>
                <div className="order-product-details">
                  <span className="product-quantity">x{product.quantity}</span>
                  <span className="product-price">{product.price} ₽</span>
                  <span className="product-total">{product.price * product.quantity} ₽</span>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h3>Итого по заказу:</h3>
            <div className="summary-row">
              <span>Общая стоимость:</span>
              <span className="total-cost">{totalCost} ₽</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetailsPage;