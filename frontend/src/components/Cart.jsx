import React, { useState } from 'react';
import { useNavigate, Link, useAsyncError } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const Cart = () => {
  const { cart, removeItem, removeItemCompletely, refreshCart, addItem, clearUserCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [success , setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="cart-container">
        <h2>Корзина</h2>
        <p>Для просмотра корзины необходимо войти в систему</p>
        <button onClick={() => navigate('/login')} className="btn-primary">
          Войти
        </button>
      </div>
    );
  }

  if (!cart || !cart.cart_list || cart.cart_list.length === 0) {
    return (
      <div className="cart-container">
        <h2>Корзина пуста</h2>
        <p>Добавьте товары в корзину, чтобы оформить заказ</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Перейти к покупкам
        </button>
      </div>
    );
  }

  const handleQuantityChange = async (productId, currentCount, change) => {

    if (change<0){
      await removeItem(productId);
    }
    if (change>0){
      await addItem(productId, cart.cart_list.find(p => p.product_id === productId).product_price);
    }
    //const newCount = currentCount + change;
    //if (newCount <= 0) {
    //  await removeItemCompletely(productId);
    //} else if (change > 0) {
    //  await removeItem(productId); // Удаляем один, потом добавим
    //  for (let i = 0; i < change; i++) {
    //    await addItem(productId, cart.cart_list.find(p => p.product_id === productId).product_price);
   //   }
    //} else {
    //  for (let i = 0; i < Math.abs(change); i++) {
    //    await removeItem(productId);
    //  }
    //}
    refreshCart();
  };

  const handleRemoveItem = async (productId) => {
    await removeItemCompletely(productId);
    refreshCart();
  };

  const clearWholeCart = async () => {
    await clearUserCart();
    refreshCart();
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await createOrder();
      if (response.order_id) {
        console.log(response.order_id);
        clearUserCart();
        navigate(`/orders/${response.order_id}`);
        //setCreated(true);
        //setSuccess(true);
        //alert('Заказ успешно оформлен!');
        //setTimeout(() => {goToOrders();}, 2000);
        //clearUserCart();
        //navigate('/orders');
      } else {
        //setSuccess(false);
        //alert('Ошибка при оформлении заказа');
      }
    } catch (error) {
      //setSuccess(false);
      //alert('Ошибка при оформлении заказа');
    } finally {
      //setCreated(true);
      setLoading(false);
    }
  };

  const goToOrders = async () =>{
    clearUserCart();
    navigate('/orders');

  }

  return (
    <div className="cart-container">
      <h2>Корзина</h2>
      <div className="cart-content">
        <div className="cart-items">
          {cart.cart_list.map(item => (
            <div key={item.product_id} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={`http://localhost:8000/images/${item.product_image}`}
                  alt={item.product_name}
                />
              </div>
              <div className="cart-item-info">
                <h3><Link to={`/product/${item.product_id}`}>{item.product_name}</Link></h3>
                <p className="cart-item-price">{item.product_price} ₽</p>
              </div>
              <div className="cart-item-quantity">
                <button 
                  onClick={() => handleQuantityChange(item.product_id, item.product_count, -1)}
                  className="quantity-btn"
                >
                  <FaMinus />
                </button>
                <span>{item.product_count}</span>
                <button 
                  onClick={() => handleQuantityChange(item.product_id, item.product_count, 1)}
                  className="quantity-btn"
                >
                  <FaPlus />
                </button>
              </div>
              <div className="cart-item-total">
                {item.product_price * item.product_count} ₽
              </div>
              <button 
                onClick={() => handleRemoveItem(item.product_id)}
                className="remove-btn"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Итого</h3>
          <div className="summary-row">
            <span>Товаров:</span>
            <span>{cart.count} шт.</span>
          </div>
          <div className="summary-row total">
            <span>Общая стоимость:</span>
            <span>{cart.cost} ₽</span>
          </div>
          <button 
            onClick={clearWholeCart}
            disabled={loading}
            className="btn-danger checkout-btn"
          >
            Очистить корзину
          </button>
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="btn-primary checkout-btn"
          >
            {loading ? 'Оформление...' : 'Оформить заказ'}
          </button>
          <div>
            {created ? (<div>
              {success ? (<p className="in-cart">Заказ успешно оформлен!</p>):(<p className="in-cart">Ошибка при оформлении заказа</p>)}
            </div>):(<p></p>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;