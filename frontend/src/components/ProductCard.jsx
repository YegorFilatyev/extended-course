import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product }) => {

  const [inCart, setInCart] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();

  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addItem(product.product_id, product.price);
    setInCart(true);
    setTimeout(() => {setInCart(false);}, 2000);
  };

  const imageUrl = product.image 
    ? `http://localhost:8000/images/${product.image}`
    : '/placeholder-image.jpg';

  return (
      <div className="product-card">
        <Link to={`/product/${product.product_id}`} className="product-card">
        <div className="product-image">
          <img src={imageUrl} alt={product.product_name} />
        </div>
        <div className="product-info">
          <h3>{product.product_name}</h3>
          <p className="product-description">{truncateDescription(product.description)}</p>
          <div className="product-price">{product.price} ₽</div>
        </div>
        </Link>
        <div>
        <button onClick={handleAddToCart} className="btn-primary add-to-cart-btn">
            <FaShoppingCart /> Добавить в корзину
          </button>
          <div>
            {inCart ? (<p className="in-cart">Товар добавлен в корзину</p>):(<p></p>)}
          </div>
        </div>
      </div>
  );
};

export default ProductCard;