import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, getProductImages } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inCart, setInCart] = useState(false);
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const productResponse = await getProductById(productId);
      if (productResponse.product) {
        setProduct(productResponse.product);
      }

      const imagesResponse = await getProductImages(productId);
      if (imagesResponse.images) {
        setImages(imagesResponse.images);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addItem(productId, product.price);
    setInCart(true);
    setTimeout(() => {setInCart(false);}, 2000);
    //alert('Товар добавлен в корзину');
  };

  const getCategoryId = (category_name) => {
    if (category_name=="Офисные"){
      return 1;
    }
    if (category_name=="Игровые проводные"){
      return 2;
    }
    if (category_name=="Игровые беспроводные"){
      return 3;
    }
    else{
      return 0;
    }
  }

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!product) return <div>Товар не найден</div>;

  return (
    <div className="product-page">
      <div className="breadcrumbs">
        <Link to="/">Главная</Link>
        {product.category && (
          <>
            <span> / </span>
            <Link to={`/category/${getCategoryId(product.category)}`}>
              {product.category_name || product.category}
            </Link>
          </>
        )}
        <span> / </span>
        <span>{product.product_name}</span>
      </div>

      <div className="product-details">
        <div className="product-gallery">
          <div className="main-image">
            <img 
              src={images.length > 0 
                ? `http://localhost:8000/images/${images[currentImage].path}`
                : '/placeholder-image.jpg'
              } 
              alt={product.product_name}
            />
          </div>
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((img, index) => (
                <img
                  key={img.image_id}
                  src={`http://localhost:8000/images/${img.path}`}
                  alt={`${product.product_name} ${index + 1}`}
                  className={index === currentImage ? 'active' : ''}
                  onClick={() => setCurrentImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1>{product.product_name}</h1>
          <p className="product-price">{product.price} ₽</p>
          <div className="product-description">
            <h3>Описание:</h3>
            <p>{product.description}</p>
          </div>
          <button onClick={handleAddToCart} className="btn-primary add-to-cart-btn">
            <FaShoppingCart /> Добавить в корзину
          </button>
          <div>
            {inCart ? (<p className="in-cart">Товар добавлен в корзину</p>):(<p></p>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;