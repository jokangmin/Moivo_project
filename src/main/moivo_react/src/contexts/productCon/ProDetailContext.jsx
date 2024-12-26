/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import PropTypes from 'prop-types';

const ProDetailContext = createContext();

export const ProDetailProvider = ({ children }) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [thumbnailImages, setThumbnailImages] = useState([]);
  const [detailImages, setDetailImages] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [stocks, setStocks] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [stockInfo, setStockInfo] = useState([]);

  const fetchProductDetail = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await axiosInstance.get(`/api/store/${productId}`);
      const { product: productData, imgList, stockList, reviewList } = response.data;
      
      setProduct(productData);
      
      const mainImg = imgList.find(img => img.layer === 1);
      const mainImgUrl = mainImg ? mainImg.fileName : productData.img;
      setMainImage(mainImgUrl);
      
      setThumbnailImages([{ id: 'main', fileName: mainImgUrl }, ...imgList.filter(img => img.layer === 2)]);
      setDetailImages(imgList.filter(img => img.layer === 3));
      setStocks(stockList);
      setReviews(reviewList);
  
    } catch (error) {
      console.error('Error fetching product detail:', error);
      setError(error.message || '상품 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleThumbnailClick = useCallback((imgUrl, index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setMainImage(imgUrl);
    setCurrentThumbnailIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  const handleThumbnailSlide = useCallback((direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const totalImages = thumbnailImages.length;
    const newIndex = direction === 'next'
      ? (currentThumbnailIndex + 1) % totalImages
      : (currentThumbnailIndex - 1 + totalImages) % totalImages;
    
    setCurrentThumbnailIndex(newIndex);
    setMainImage(thumbnailImages[newIndex].fileName);
    
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating, thumbnailImages, currentThumbnailIndex]);

  const handleSizeSelect = useCallback((size, count) => {
    if (count <= 0) {
      alert('품절된 상품입니다.');
      return;
    }
    setSelectedSize(size);
    setQuantity(1);
    setSelectedProduct({
      id: product.id,
      size: size,
      count: 1
    });
  }, [product]);

  const handleQuantityChange = useCallback((change) => {
    const selectedStock = stockInfo.find(stock => stock.size === selectedSize);
    if (!selectedStock) {
      alert('사이즈를 먼저 선택해주세요.');
      return;
    }

    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= selectedStock.count) {
      setQuantity(newQuantity);
    } else if (newQuantity > selectedStock.count) {
      alert('재고 수량을 초과할 수 없습니다.');
    }
  }, [selectedSize, quantity, stockInfo]);

  const handlePurchase = useCallback(() => {
    if(window.confirm("선택하신 상품을 구매하시겠습니까?")) {
      navigate('/payment', {
        state: {
          cartItems: [{
            productId: product.id,
            size: selectedProduct.size,
            count: quantity,
            price: product.price,
            name: product.name,
            img: product.img
          }],
          isCartItem: false
        }
      });
    }
  }, [navigate, product, selectedProduct, quantity]);

  const handleAddToWishlist = useCallback(async () => {
    try {
      await axiosInstance.get(`/api/user/wish/${product.id}`);
      alert('위시리스트에 추가되었습니다.');
    } catch (error) {
      console.error('위시리스트 추가 실패:', error);
      alert('위시리스트 추가에 실패했습니다.');
    }
  }, [product]);

  const handleAddToCart = useCallback(async () => {
    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }

    try {
      const url = `/api/user/cart/add/${product.id}?count=${quantity}&size=${selectedSize}`;
      const response = await axiosInstance.post(url);

      if (response.status === 200) {
        if(window.confirm('장바구니에 추가되었습니다.\n장바구니로 이동하시겠습니까?')) {
          navigate('/cart');
        }
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.ㅇㄴㅁㅇㅁ');
      } else {
        alert('장바구니 추가에 실패했습니다.');
      }
    }
  }, [product, selectedSize, quantity, navigate]);

  const fetchReviews = useCallback(async (productId) => {
    try {
      const response = await axiosInstance.get(`/api/store/${productId}/reviews`);
      setReviews(response.data.content);
    } catch (error) {
      console.error("리뷰 데이터 가져오기 실패:", error);
    }
  }, []);

  const isAllSizesSoldOut = useCallback(() => {
    return stocks.every(stock => stock.count <= 0);
  }, [stocks]);

  useEffect(() => {
    if (stocks && stocks.length > 0) {
      setStockInfo(stocks);
    }
  }, [stocks]);

  useEffect(() => {
    if (selectedSize) {
      const currentStock = stockInfo.find(stock => stock.size === selectedSize);
      console.log("선택된 사이즈:", selectedSize);
      console.log("선택된 사이즈의 재고:", currentStock?.count);
      console.log("현재 선택된 수량:", quantity);
    }
  }, [selectedSize, quantity, stockInfo]);

  const value = useMemo(() => ({
    product,
    mainImage,
    thumbnailImages,
    detailImages,
    selectedSize,
    stocks,
    selectedProduct,
    reviews,
    loading,
    error,
    quantity,
    activeTab,
    currentThumbnailIndex,
    isAnimating,
    stockInfo,
    setActiveTab,
    fetchProductDetail,
    handleThumbnailClick,
    handleThumbnailSlide,
    handleSizeSelect,
    handleQuantityChange,
    handlePurchase,
    handleAddToWishlist,
    handleAddToCart,
    fetchReviews,
    isAllSizesSoldOut,
    setError,
    setLoading
  }), [
    product, mainImage, thumbnailImages, detailImages, selectedSize, 
    stocks, selectedProduct, reviews, loading, error, quantity, 
    activeTab, currentThumbnailIndex, isAnimating, stockInfo,
    fetchProductDetail, handleThumbnailClick, handleThumbnailSlide,
    handleSizeSelect, handleQuantityChange, handlePurchase,
    handleAddToWishlist, handleAddToCart, fetchReviews, isAllSizesSoldOut
  ]);

  return (
    <ProDetailContext.Provider value={value}>
      {children}
    </ProDetailContext.Provider>
  );
};

ProDetailProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useProDetail = () => {
  const context = useContext(ProDetailContext);
  if (!context) {
    throw new Error('useProDetail must be used within a ProDetailProvider');
  }
  return context;
};
