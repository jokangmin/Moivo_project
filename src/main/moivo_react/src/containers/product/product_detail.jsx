import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShoppingCart, FaMinus, FaPlus, FaTruck, FaExchangeAlt, FaCreditCard } from 'react-icons/fa';
import styles from '../../assets/css/product_detail.module.css';
import Banner from '../../components/Banner/banner';
import Footer from '../../components/Footer/Footer';
import LoadingModal from './LoadingModal';
import axiosInstance from '../../utils/axiosConfig';

const ProductDetail = () => {
  const { productId } = useParams(); // 받아온 상품 ID
  const token = localStorage.getItem('accessToken');
  const [product, setProduct] = useState(null); // 상품 정보
  const [mainImage, setMainImage] = useState(''); // 메인 이미지
  const [thumbnailImages, setThumbnailImages] = useState([]); // 썸네일 이미지
  const [detailImages, setDetailImages] = useState([]); // 상세 이미지
  const [selectedSize, setSelectedSize] = useState(''); // 선택한 사이즈
  const [stocks, setStocks] = useState([]); // 재고 정보
  const [selectedProduct, setSelectedProduct] = useState(null); // 선택한 상품
  const [reviews, setReviews] = useState([]); // 리뷰 정보
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [quantity, setQuantity] = useState(1); // 수량
  const [activeTab, setActiveTab] = useState('details'); // 활성화된 탭
  const navigate = useNavigate();
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [stockInfo, setStockInfo] = useState([]); // 재고 정보 상태 추가

  // 재고 정보와 사이즈 정보를 가져오는 useEffect!!
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      setStockInfo(stocks);
      console.log("현재 재고 정보:", stocks);
    }
  }, [stocks]);

  // 선택된 사이즈와 수량 변경 감지하는 useEffect
  useEffect(() => {
    if (selectedSize) {
      const currentStock = stockInfo.find(stock => stock.size === selectedSize);
      console.log("선택된 사이즈:", selectedSize);
      console.log("선택된 사이즈의 재고:", currentStock?.count);
      console.log("현재 선택된 수량:", quantity);
    }
  }, [selectedSize, quantity, stockInfo]);

  const fetchProductDetail = async () => { //상품 상세정보 불러오기
    setLoading(true);
    setError(null);
  
    try {
      const response = await axiosInstance.get(`/api/store/${productId}`);
      const { product: productData, imgList, stockList, reviewList } = response.data;
      
      // 상품 정보 설정
      setProduct(productData);
      
      // 메인 이미지 설정
      const mainImg = imgList.find(img => img.layer === 1);
      const mainImgUrl = mainImg ? mainImg.fileName : productData.img;
      setMainImage(mainImgUrl);
      
      // 썸네일 이미지 설정 (메인 이미지를 첫 번째로 포함)
      const thumbnails = imgList.filter(img => img.layer === 2);
      setThumbnailImages([{ id: 'main', fileName: mainImgUrl }, ...thumbnails]);
      
      // 상세 이미지 설정
      const details = imgList.filter(img => img.layer === 3);
      setDetailImages(details);
      
      // 재고 정보 설정
      setStocks(stockList);
      
      // 리뷰 정보 설정
      setReviews(reviewList);
  
    } catch (error) {
      console.error('Error fetching product detail:', error);
      setError(error.message || '상품 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        navigate("/user");
        return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchProductDetail();
  }, [productId, token]);

  const handleThumbnailClick = (imgUrl, index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setMainImage(imgUrl);
    setCurrentThumbnailIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleThumbnailSlide = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const totalImages = thumbnailImages.length;
    const newIndex = direction === 'next'
      ? (currentThumbnailIndex + 1) % totalImages
      : (currentThumbnailIndex - 1 + totalImages) % totalImages;
    
    setCurrentThumbnailIndex(newIndex);
    setMainImage(thumbnailImages[newIndex].fileName);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSizeSelect = (size, count) => { // 사이즈 선택 시 선택한 상품 정보 설정
    if (count <= 0) {
      alert('품절된 상품입니다.');
      return;
    }
    setSelectedSize(size);
    setQuantity(1); // 사이즈 변경시 수량 1로 초기화
    setSelectedProduct({
      id: product.id,
      size: size,
      count: 1
    });
  };

  const handleQuantityChange = (change) => { // 수량 변경 시 수량 업데이트
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
  };

  const handlePurchase = () => {
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
          isCartItem : false
        }
      });
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await axiosInstance.get(`/api/user/wish/${productId}`);
      alert('위시리스트에 추가되었습니다.');
    } catch (error) {
      console.error('위시리스트 추가 실패:', error);
      alert('위시리스트 추가에 실패했습니다.');
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
        alert('사이즈를 선택해주세요.');
        return;
    }

    try {
        const url = `/api/user/cart/add/${productId}?count=${quantity}&size=${selectedSize}`;
        
        const response = await axiosInstance.post(url);
        console.log('장바구니 응답:', response);

        if (response.status === 200) {
            if(window.confirm('장바구니에 추가되었습니다.\n장바구니로 이동하시겠습니까?')) {
                navigate('/cart');
            }
        }
    } catch (error) {
        console.error('장바구니 추가 실패:', error.response || error);
        if (error.response?.status === 401) {
            alert('로그인이 필요합니다.');
        } else {
            alert(error.response?.data?.message || '장바구니 추가에 실패했습니다.');
        }
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
        try {
            // axios 대신 axiosInstance 사용
            const response = await axiosInstance.get(`/api/store/${productId}/reviews`);
            setReviews(response.data.content);
        } catch (error) {
            console.error("리뷰 데이터 가져오기 실패:", error);
        }
    };

    if (productId && activeTab === 'reviews') {
      fetchReviews();
    }
  }, [productId, activeTab]);

  // 모든 사이즈가 품절인지 확인하는 함수 추가
  const isAllSizesSoldOut = () => {
    return stocks.every(stock => stock.count <= 0);
  };

  if (loading) { // 로딩 중일 때 로딩 모달 표시
    return <LoadingModal isOpen={true} />;
  }

  if (error) { // 에러 발생 시 에러 메시지 표시
    return (
      <div className={styles.errorWrapper}>
        <div className={styles.errorMessage}>{error}</div>
        <button 
          className={styles.retryButton}
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchProductDetail();
          }}
        >
          재시도
        </button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className={styles.productDetailRoot}>
      <div className={styles.container}>
        <Banner />
        <motion.div 
          className={styles.productContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.imageSection}>
            <motion.div 
              className={styles.mainImageContainer}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.img 
                src={mainImage} 
                alt={product.name} 
                className={styles.mainImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleThumbnailSlide('next')}
              />
            </motion.div>
            <div className={styles.thumbnailSliderContainer}>
              <motion.button
                className={`${styles.sliderButton} ${styles.prevButton}`}
                onClick={() => handleThumbnailSlide('prev')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                &#8249;
              </motion.button>
              <motion.div 
                className={styles.thumbnailContainer}
                initial={false}
              >
                {thumbnailImages.map((img, index) => (
                  <motion.img
                    key={img.id}
                    src={img.fileName}
                    alt={`${product.name} 이미지 ${index + 1}`}
                    className={`${styles.thumbnail} ${mainImage === img.fileName ? styles.active : ''}`}
                    onClick={() => handleThumbnailClick(img.fileName, index)}
                    whileHover={{ scale: 1.05 }}
                    animate={mainImage === img.fileName ? { 
                      scale: 1.05,
                      borderColor: 'var(--accent-color)',
                      transition: { duration: 0.3 }
                    } : { 
                      scale: 1,
                      borderColor: 'transparent',
                      transition: { duration: 0.3 }
                    }}
                  />
                ))}
              </motion.div>
              <motion.button
                className={`${styles.sliderButton} ${styles.nextButton}`}
                onClick={() => handleThumbnailSlide('next')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                &#8250;
              </motion.button>
            </div>
          </div>

          <div className={styles.infoSection}>
            <motion.h1 
              className={styles.productName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {product?.name || "상품명 정보가 없습니다."}
            </motion.h1>
            
            <motion.div className={styles.productMeta}>
              <span className={styles.productCode}>상품코드: {product?.id}</span>
            </motion.div>
            
            <motion.p 
              className={styles.price}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {product?.price?.toLocaleString()}원
            </motion.p>

            <div className={styles.productInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>배송 정보</span>
                <span className={styles.infoValue}>
                  <span className={styles.highlight}>무료배송</span>
                  <span className={styles.subInfo}>Moivo통운 | 3일 이내 출고</span>
                </span>
              </div>
            </div>
            
            <div className={styles.productFeatures}>
              <div className={styles.featureItem}>
                <FaTruck className={styles.featureIcon} />
                <span>무료배송</span>
              </div>
              <div className={styles.featureItem}>
                <FaExchangeAlt className={styles.featureIcon} />
                <span>14일 이내 교환/반품</span>
              </div>
              <div className={styles.featureItem}>
                <FaCreditCard className={styles.featureIcon} />
                <span>카드 무이자</span>
              </div>
            </div>

            <div className={styles.productTags}>
              <span className={styles.tag}>#겨울아우터</span>
              <span className={styles.tag}>#데일룩</span>
              <span className={styles.tag}>#트렌디</span>
            </div>

            <div className={styles.deliveryInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoTitle}>배송방법</span>
                <span className={styles.infoContent}>Moivo 직접배송</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoTitle}>결제방법</span>
                <div className={styles.paymentMethods}>
                  <span className={styles.paymentMethod}>신용카드</span>
                  <span className={styles.paymentMethod}>무통장입금</span>
                  <span className={styles.paymentMethod}>카카오페이</span>
                </div>
              </div>
            </div>

            <motion.div 
              className={styles.sizeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className={styles.sizeHeading}>사이즈 선택</h3>
              <div className={styles.sizeGrid}>
                {stocks.map((stock) => (
                  <motion.button
                    key={stock.id}
                    className={`${styles.sizeButton} ${
                      selectedSize === stock.size ? styles.selected : ''
                    } ${stock.count <= 0 ? styles.soldOut : ''}`}
                    onClick={() => handleSizeSelect(stock.size, stock.count)}
                    disabled={stock.count <= 0}
                    whileHover={{ scale: stock.count > 0 ? 1.05 : 1 }}
                    whileTap={{ scale: stock.count > 0 ? 0.95 : 1 }}
                  >
                    {stock.size}
                    <span className={styles.stock}>
                      {stock.count <= 0 ? (
                        <span className={styles.soldOutText}>품절</span>
                      ) : (
                        `(${stock.count})`
                      )}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {selectedProduct && (
              <motion.div 
                className={styles.selectedInfo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className={styles.selectedProductName}>선택된 상품: {product?.name}</p>
                <p className={styles.selectedSize}>사이즈: {selectedProduct.size}</p>
                <div className={styles.quantityControl}>
                  <motion.button 
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={!selectedSize || quantity <= 1}
                  >
                    <FaMinus />
                  </motion.button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <motion.button 
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(1)}
                    disabled={!selectedSize || quantity >= (stockInfo.find(s => s.size === selectedSize)?.count || 0)}
                  >
                    <FaPlus />
                  </motion.button>
                </div>
                <p className={styles.totalPrice}>총 가격: {(product?.price * quantity).toLocaleString()}원</p>
              </motion.div>
            )}

            <motion.div 
              className={styles.actionButtonsVertical}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.button
                className={`${styles.actionButton} ${styles.purchaseButton}`}
                onClick={handlePurchase}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!selectedProduct || isAllSizesSoldOut()}
                style={{ 
                  opacity: (!selectedProduct || isAllSizesSoldOut()) ? 0.5 : 1,
                  cursor: (!selectedProduct || isAllSizesSoldOut()) ? 'not-allowed' : 'pointer'
                }}
              >
                <FaCreditCard /> 바로 구매하기
              </motion.button>
              <motion.button
                className={`${styles.actionButton} ${styles.cartButton}`}
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaShoppingCart /> 장바구니 담기
              </motion.button>
              <motion.button
                className={`${styles.actionButton} ${styles.wishlistButton}`}
                onClick={handleAddToWishlist}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaHeart /> 위시리스트 추가
              </motion.button>
            </motion.div>       
          </div>
        </motion.div>

        <div className={styles.tabSection}>
          <div className={styles.tabButtons}>
            <motion.button
              className={`${styles.tabButton} ${activeTab === 'details' ? styles.active : ''}`}
              onClick={() => setActiveTab('details')}
              whileHover={{ scale: 1.05 }}
            >
              상품 상세정보
            </motion.button>
            <motion.button
              className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
              onClick={() => setActiveTab('reviews')}
              whileHover={{ scale: 1.05 }}
            >
              리뷰
            </motion.button>
            <motion.button
              className={`${styles.tabButton} ${activeTab === 'qna' ? styles.active : ''}`}
              onClick={() => setActiveTab('qna')}
              whileHover={{ scale: 1.05 }}
            >
              QNA
            </motion.button>
            <motion.button
              className={`${styles.tabButton} ${activeTab === 'policy' ? styles.active : ''}`}
              onClick={() => setActiveTab('policy')}
              whileHover={{ scale: 1.05 }}
            >
              환불/교환정책
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              className={styles.tabContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'details' && (
                <div className={styles.detailSection}>
                  <div className={styles.detailContent}>
                    <p>{product.content}</p>
                  </div>
                  <div className={styles.detailImages}>
                    {detailImages.map((img) => (
                      <motion.img
                        key={img.id}
                        src={img.fileName}
                        alt="상품 상세 이미지"
                        className={styles.detailImage}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className={styles.reviewSection}>
                  <h2 className={styles.reviewHeading}>상품 리뷰</h2>
                  {reviews && reviews.length > 0 ? (
                    <div className={styles.reviewList}> 
                      {reviews.map((review) => (
                        <motion.div 
                          key={review.id} 
                          className={styles.review}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                        >
                          <div className={styles.reviewHeader}>
                            <div className={styles.reviewInfo}>
                              <span className={styles.rating}>
                                {[...Array(review.rating)].map((_, i) => (
                                  <span key={i}>★</span>
                                ))}
                              </span>
                              <span className={styles.reviewAuthor}>{review.userName}</span>
                              <span className={styles.reviewDate}>
                                {new Date(review.reviewDate).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={styles.purchaseInfo}>
                              구매 사이즈: {review.size}
                            </span>
                          </div>
                          <p className={styles.reviewContent}>{review.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noReviewContainer}>
                      <p className={styles.noReview}>리뷰가 존재하지 않습니다.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'qna' && (
                <div className={styles.qnaSection}>
                  <h2 className={styles.sectionHeading}>상품 QNA</h2>
                  <div className={styles.qnaList}>
                    <div className={styles.qnaItem}>
                      <div className={styles.question}>
                        <span className={styles.qnaLabel}>Q.</span>
                        <p>사이즈가 평소 사이즈보다 작나요?</p>
                        <span className={styles.qnaAuthor}>- 구매예정자</span>
                      </div>
                      <div className={styles.answer}>
                        <span className={styles.qnaLabel}>A.</span>
                        <p>정사이즈로 제작되었습니다. 평소 신으시는 사이즈로 주문해주시면 됩니다.</p>
                        <span className={styles.qnaAuthor}>- 판매자</span>
                      </div>
                    </div>
                    <div className={styles.qnaItem}>
                      <div className={styles.question}>
                        <span className={styles.qnaLabel}>Q.</span>
                        <p>배송은 보통 얼마나 걸리나요?</p>
                        <span className={styles.qnaAuthor}>- 구매희망</span>
                      </div>
                      <div className={styles.answer}>
                        <span className={styles.qnaLabel}>A.</span>
                        <p>주문 후 1-2일 내에 출고되며, 출고 후 1-2일 내 수령 가능합니다.</p>
                        <span className={styles.qnaAuthor}>- 판매자</span>
                      </div>
                    </div>
                    <div className={styles.qnaItem}>
                      <div className={styles.question}>
                        <span className={styles.qnaLabel}>Q.</span>
                        <p>상품 교환 및 환불이 가능한가요?</p>
                        <span className={styles.qnaAuthor}>- 구매자</span>
                      </div>
                      <div className={styles.answer}>
                        <span className={styles.qnaLabel}>A.</span>
                        <p>죄송하지만, 우리 사이트는 상품 교환, 환불, 반품이 불가능합니다.</p>
                        <span className={styles.qnaAuthor}>- 판매자</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'policy' && (
                <div className={styles.policySection}>
                  <h2 className={styles.sectionHeading}>환불/교환 정책</h2>
                  <br/>
                  <div className={styles.policyContent}>
                    <h3>교환/반품 안내</h3>
                    <ul>
                      <li>상품 수령 후 교환/반품이 불가능합니다.</li>
                      <li>고객의 단순 변심으로 인한 교환/반품의 경우 배송비는 고객 부담입니다.</li>
                    </ul>
                    
                    <h3>교환/반품이 불가능한 경우</h3>
                    <ul>
                      <li>상품 수령한 경우</li>
                      <li>착용 흔적이 있거나 상품이 훼손된 경우</li>
                      <li>상품의 택이나 라벨이 제거된 경우</li>
                      <li>고객의 부주의로 인해 상품이 훼손된 경우</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetail;