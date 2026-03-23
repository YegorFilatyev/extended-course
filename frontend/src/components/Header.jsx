import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaBars } from 'react-icons/fa';
import { getCategories } from '../services/api';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.categories) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const cartItemsCount = cart?.count || 0;

  // Показываем загрузку, пока проверяется авторизация
  if (loading) {
    return (
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">Магазин</Link>
          </div>
          <div>Загрузка...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">Магазин</Link>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </button>

        <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <div className="dropdown">
            <button className="dropbtn">Категории</button>
            <div className="dropdown-content">
              <Link to="/" onClick={() => setMenuOpen(false)}>Все товары</Link>
              {categories.map(cat => (
                <Link 
                  key={cat.category_id} 
                  to={`/category/${cat.category_id}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.category_name}
                </Link>
              ))}
            </div>
          </div>

          <div className="nav-icons">
            <Link to="/cart" className="cart-icon" onClick={() => setMenuOpen(false)}>
              <FaShoppingCart />
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </Link>

            {user ? (
              <div>
              <div className="user-menu">
                <button className="user-btn">
                  <FaUser />
                </button>
                <div className="user-dropdown">
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>Профиль</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)}>Заказы</Link>
                  <button onClick={handleLogout}>Выйти</button>
                </div>
                <p className="user-name">{user.name}</p>
              </div>
              </div>
            ) : (
              <Link to="/login" className="login-btn" onClick={() => setMenuOpen(false)}>
                Войти
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;