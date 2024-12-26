/* eslint-disable no-unused-vars */
import React, { useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../../assets/css/product_list.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import LoadingModal from "./LoadingModal";
import { ProListContext } from "../../contexts/productCon/ProListContext";

const ProductList = () => {
    const {
        products,
        currentPage,
        pageInfo,
        sortBy,
        setSortBy,
        categories,
        activeCategory,
        setActiveCategory,
        cartItem,
        wishItem,
        searchOpen,
        setSearchOpen,
        searchTerm,
        setSearchTerm,
        isLoading,
        fetchProducts,
        handleProductClick,
        handleWishClick,
        handleCartClick
    } = useContext(ProListContext);

    useEffect(() => {
        fetchProducts(0);
    }, [sortBy, searchTerm, activeCategory, fetchProducts]);

  return (
    <div className={styles.container}>
      <Banner />
      <div className={styles.productListWrapper}>
        {/* 상품 상단 */}
        <div className={styles.filterSection}>
          <div className={styles.searchAndCategories}>
            {/* 검색바 */}
            <motion.div
              className={`${styles.searchContainer} ${searchOpen ? styles.open : ''}`}
              animate={{ width: searchOpen ? "300px" : "40px" }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className={styles.searchIcon}
                onClick={() => setSearchOpen(!searchOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="fas fa-search" />
              </motion.button>
              <motion.input
                type="text"
                placeholder="상품 검색.."
                className={styles.searchInput}
                animate={{ opacity: searchOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </motion.div>
            {/* 카테고리 */}
            <div className={styles.categoryList}>
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  className={`${styles.categoryItem} ${
                    activeCategory === category ? styles.active : ''
                  }`}
                  onClick={() => setActiveCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.85 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
          </div>
          {/* 정렬 */}
          <select
            className={styles.sortDropdown}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">최신순</option>
            <option value="priceHigh">높은 가격순</option>
            <option value="priceLow">낮은 가격순</option>
          </select>
        </div>

        {/* 상품 목록 */}
        <motion.div
          className={styles.productGrid}
          layout
          transition={{
            layout: { duration: 0.3 },
            opacity: { duration: 0.2 },
          }}
        >
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product.id}
                className={styles.productCard}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.productImageWrapper}>
                  <img
                    src={product.img}
                    alt={product.name}
                    className={styles.productImage}
                  />
                  <div 
                    className={styles.productOverlay}
                    onClick={() => handleProductClick(product.id)}
                  >
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productTitle}>{product.name}</h3>
                    <p className={styles.productPrice}>
                      ₩{product.price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 페이징 처리 */}
        <motion.div className={styles.paginationContainer}>
          <button
            className={styles.pageButton}
            onClick={() => fetchProducts(0)}
            disabled={pageInfo.isFirst}
          >
            &laquo;
          </button>
          <button
            className={styles.pageButton}
            onClick={() => fetchProducts(currentPage - 1)}
            disabled={!pageInfo.hasPrevious}
          >
            &lt;
          </button>
          {(() => {
            return Array.from({ length: pageInfo.endPage - pageInfo.startPage }, (_, index) => {
              const pageIndex = pageInfo.startPage + index;
              return (
                <button
                  key={pageIndex}
                  className={`${styles.pageButton} ${currentPage === pageIndex ? styles.active : ""}`}
                  onClick={() => fetchProducts(pageIndex)}
                >
                  {pageIndex + 1}
                </button>
              );
            });
          })()}
          <button
            className={styles.pageButton}
            onClick={() => fetchProducts(currentPage + 1)}
            disabled={!pageInfo.hasNext}
          >
            &gt;
          </button>
          <button
            className={styles.pageButton}
            onClick={() => fetchProducts(pageInfo.totalPages - 1)}
            disabled={pageInfo.isLast}
          >
            &raquo;
          </button>
        </motion.div>

        <div className={styles.floatingButtonContainer}>
          <motion.div
            className={styles.floatingButton}
            data-totalitems={wishItem}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishClick}
          >
            <i className="fas fa-heart"></i>
          </motion.div>
          <motion.div
            className={styles.floatingButton}
            data-totalitems={cartItem}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCartClick}
          >
            <i className="fas fa-shopping-cart"></i>
          </motion.div>
        </div>
        <LoadingModal isOpen={isLoading} />
      </div>
      <Footer />
    </div>
  );
};

export default ProductList;