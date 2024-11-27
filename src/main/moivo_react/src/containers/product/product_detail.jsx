import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "../../assets/css/product_detail.module.css";
import { motion } from "framer-motion";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import axios from "axios";

const ProductDetail = () => {
  const { isLoggedIn, token } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.productData || null);
  const [mainImg, setMainImg] = useState("");
  const [selectedSize, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slidesPerView = 3;
  const [activeTab, setActiveTab] = useState('상품정보');

  const nextSlide = () => {
    if (currentSlide < product?.productimg.length - slidesPerView) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (!product) {
      const fetchProductData = async () => {
        try {
          const response = await axios.get(`/api/user/store/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data) {
            setProduct(response.data);
            setMainImg(response.data.productimg.find(img => img.layer === 1)?.filename);
          }
        } catch (error) {
          console.error('상품 정보를 불러오는데 실패했습니다:', error);
          if (error.response?.status === 401) {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            navigate('/user');
          }
        }
      };
      fetchProductData();
    } else {
      setMainImg(product.productimg.find(img => img.layer === 1)?.filename);
    }
  }, [id, token, product]);

  // 리뷰 및 재고 데이터 가져오기
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const reviewsResponse = await axios.get(`/api/reviews/${id}`);
        const stockResponse = await axios.get(`/api/stock/${id}`);
        
        setReviews(reviewsResponse.data);
        setStockData(stockResponse.data);
      } catch (error) {
        console.error('리뷰 또는 재고 정보를 불러오는데 실패했습니다:', error);
      }
    };

    if (product) {
      fetchAdditionalData();
    }
  }, [product]);

  // 사이즈 선택 핸들러
  const handleSizeChange = (e) => {
    const size = e.target.value;
    setSize(size);
    const stock = stockData.find(item => item.size === size);
    setSelectedStock(stock);
    setQuantity(1);
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (newQuantity) => {
    if (selectedStock && newQuantity >= 1 && newQuantity <= selectedStock.count) {
      setQuantity(newQuantity);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // 위시리스트 핸들러 추가
  const handleWishlist = () => {
    if (!isLoggedIn) {
      navigate('/user');
    } else {
      navigate(`/mypage/wish?productId=${id}`);
    }
  };

  // 구매 핸들러 추가
  const handlePurchase = () => {
    if (!isLoggedIn) {
      navigate('/user');
    } else {
      console.log('구매 기능 준비 중');
    }
  };

  /* ===== TAB CONTENT RENDERER ===== */
  const renderTabContent = () => {
    switch (activeTab) {
      case '상품정보':
        return (
          <div className={styles.detailImages}>
            {product?.productimg.map((img) => (
              <img
                key={img.id}
                src={img.fileurl}
                alt={`${product.name} 상세이미지`}
                className={styles.detailImage}
              />
            ))}
          </div>
        );
      case '리뷰':
        return (
          <div className={styles.reviewSection}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewUser}>{review.username}</span>
                  <span className={styles.reviewDate}>{review.date}</span>
                </div>
                <div className={styles.reviewRating}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                </div>
                <p className={styles.reviewContent}>{review.content}</p>
              </div>
            ))}
          </div>
        );
      case 'Q&A':
        return (
          <div className={styles.qnaSection}>
            <div className={styles.qnaHeader}>
              <h3>상품 Q&A</h3>
              <button className={styles.writeButton}>문의하기</button>
            </div>
            <p className={styles.qnaGuide}>
              - 상품에 대한 문의사항을 남겨주세요.
              <br />
              - 배송/교환/반품 문의는 고객센터를 이용해주세요.
            </p>
            {/* Q&A 목록이 있다면 여기에 추가 */}
          </div>
        );
      case '배송/교환/반품':
        return (
          <div className={styles.shippingSection}>
            <div className={styles.shippingInfo}>
              <h3>배송 안내</h3>
              <ul>
                <li>배송방법: 택배</li>
                <li>배송지역: 전국</li>
                <li>배송비용: 3,000원 (30,000원 이상 구매 시 무료배송)</li>
                <li>배송기간: 2-3일 소요 (주말/공휴일 제외)</li>
              </ul>
            </div>
            <div className={styles.exchangeInfo}>
              <h3>교환/반품 안내</h3>
              <ul>
                <li>교환/반품 기간: 상품 수령 후 7일 이내</li>
                <li>교환/반품 배송비: 6,000원 (왕복)</li>
                <li>교환/반품 불가사유: 착용 흔적, 오염, 택 제거 등</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  /* ===== ERROR HANDLING ===== */
  if (!product) {
    return (
      <div>
        <h1>Product Not Found</h1>
        <p>해당 상품이 존재하지 않습니다.</p>
      </div>
    );
  }

  /* ===== RENDER ===== */
  return (
    <div className={styles.container}>
      {/* 헤더 영역 */}
      <Banner />
      
      <div className={styles.productDetailWrapper}>
        {/* 상단 섹션: 이미지와 구매 정보 */}
        <div className={styles.topSection}>
          {/* 왼쪽: 메인 이미지 섹션 */}
          <div className={styles.mainImageSection}>
            {/* 메인 이미지 */}
            <div className={styles.mainImageWrapper}>
              <img
                src={mainImg || "/placeholder.jpg"}
                alt={product?.name}
                className={styles.mainImage}
              />
            </div>
            
            {/* 섬네일 캐러셀 */}
            <div className={styles.thumbnailSection}>
              <button 
                className={`${styles.carouselButton} ${styles.prevButton}`}
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                ‹
              </button>
              
              <div className={styles.thumbnailWrapper}>
                {product?.productimg.slice(currentSlide, currentSlide + slidesPerView).map((img) => (
                  <div 
                    key={img.id || img.fileurl}
                    className={`${styles.thumbnailItem} ${mainImg === img.fileurl ? styles.activeThumbnail : ''}`}
                    onClick={() => setMainImg(img.fileurl)}
                  >
                    <img 
                      src={img.fileurl} 
                      alt={product.name} 
                      className={styles.thumbnail}
                    />
                  </div>
                ))}
              </div>

              <button 
                className={`${styles.carouselButton} ${styles.nextButton}`}
                onClick={nextSlide}
                disabled={currentSlide >= product?.productimg.length - slidesPerView}
              >
                ›
              </button>
            </div>
          </div>

          {/* 오른쪽: 구매 정보 섹션 */}
          <div className={styles.productInfo}>
            <h1 className={styles.productName}>{product.name}</h1>
            <p className={styles.productPrice}>{product.price.toLocaleString()}원</p>
            <div className={styles.description}>
              <p>{product.content}</p>
            </div>
            
            {/* 구매 옵션 */}
            <div className={styles.purchaseOptions}>
              <div className={styles.optionRow}>
                <span className={styles.optionLabel}>사이즈</span>
                <div className={styles.optionContent}>
                  <select
                    value={selectedSize}
                    onChange={handleSizeChange}
                    className={styles.sizeSelect}
                  >
                    <option value="">선택해주세요</option>
                    {stockData.map(stock => (
                      <option 
                        key={stock.id} 
                        value={stock.size}
                        disabled={stock.count === 0}
                      >
                        {stock.size} {stock.count === 0 ? '(품절)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedStock && (
                <div className={styles.optionRow}>
                  <span className={styles.optionLabel}>수량</span>
                  <div className={styles.optionContent}>
                    <div className={styles.quantityWrapper}>
                      <button 
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedStock.count}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                        readOnly
                      />
                      <button 
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= selectedStock.count}
                      >
                        +
                      </button>
                    </div>
                    <span className={styles.stockInfo}>
                      (재고: {selectedStock.count}개)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className={styles.actionButtons}>
              <motion.button 
                className={`${styles.actionBtn} ${styles.purchaseButton}`}
                onClick={handlePurchase}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaShoppingCart /> 구매하기
              </motion.button>
              <motion.button 
                className={`${styles.actionBtn} ${styles.wishlistButton}`}
                onClick={handleWishlist}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaHeart /> 위시리스트
              </motion.button>
            </div>
          </div>
        </div>

        {/* 하단 섹션: 상세 정보 탭 */}
        <div className={styles.bottomSection}>
          {/* 탭 메뉴 */}
          <div className={styles.detailTabs}>
            {['상품정보', '리뷰', 'Q&A', '배송/교환/반품'].map((tab) => (
              <button
                key={tab}
                className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab} {tab === '리뷰' && `(${reviews.length})`}
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          <div className={styles.detailContent}>
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* 푸터 영역 */}
      <Footer />
    </div>
  );
};

export default ProductDetail;