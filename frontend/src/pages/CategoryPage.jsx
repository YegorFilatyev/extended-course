import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductsByCategory } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  useEffect(() => {
    let sorted = [...products];
    if (sortOrder === 'asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      sorted.sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(sorted);
    setCurrentPage(1);
  }, [products, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProductsByCategory(categoryId);
      if (response.products) {
        setProducts(response.products);
        setFilteredProducts(response.products);
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
      <h1>Товары категории</h1>
      
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

export default CategoryPage;