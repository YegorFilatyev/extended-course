import React, { useState, useEffect } from 'react';
import { getAllProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === parseInt(selectedCategory));
    }
    if (sortOrder === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, selectedCategory, sortOrder]);

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      if (response.products) {
        setProducts(response.products);
        setFilteredProducts(response.products);
      }
      const cat_response = await getCategories();
      if (cat_response.categories){
        setCategories(cat_response.categories);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page-container">
      <h1>Все товары</h1>
      
      <div className="filters">
        <div className="sort-filter">
          <label>Сортировка по цене:</label>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">По умолчанию</option>
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>
        <div className="sort-filter">
            <label>Категория:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Все категории</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
        </div>
      </div>

      {paginatedProducts.length === 0 ? (
        <p>Товары не найдены</p>
      ) : (
        <>
          <div className="products-grid">
            {paginatedProducts.map(product => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
};

export default HomePage;