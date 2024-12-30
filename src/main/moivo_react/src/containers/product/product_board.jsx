// src/containers/product/ProductBoard.jsx
import React, { useState, useEffect } from 'react';
import Slider from "../../components/Slider/Slider";
import styles from "../../assets/css/product_board.module.css";
import Footer from '../../components/Footer/Footer';
import Banner from '../../components/Banner/banner';
import { motion } from 'framer-motion';
import { useDashBoard } from '../../contexts/DashBoardContext';
import { Link } from 'react-router-dom';

const ProductBoard = () => {
  const {
    weather,
    fadeInUp,
    imgSrc,
    weatherTips,
    getWeatherBackground,
    getWeatherDescription,  
    handleLeftArrowClick,
    handleRightArrowClick,
    handleLeftArrowClick_2,
    handleRightArrowClick_2,
    handleLeftArrowClick_3,
    handleRightArrowClick_3,
    productList,
    startIndex,
    setMaxIndex,
    startIndex_2,
    setMaxIndex_2,
    startIndex_3,
    setMaxIndex_3,
    maxIndex,
    maxIndex_2,
    maxIndex_3,
  } = useDashBoard();

  const productListArray = Object.values(productList);
  console.log(productListArray);

  useEffect(() => {
    if (productListArray[0]) {
      setMaxIndex(productListArray[0].length - 3);
      console.log("maxIndex : " + maxIndex);
    }
  }, [productListArray, setMaxIndex]);

  useEffect(() => {
    if (productListArray[2]) {
      setMaxIndex_2(productListArray[2].length - 3);
      console.log("maxIndex2 : " + maxIndex_2);
    }
  }, [productListArray, setMaxIndex_2]);

  useEffect(() => {
    if (productListArray[1]) {
      setMaxIndex_3(productListArray[1].length - 3);
      console.log("maxIndex3 : " + maxIndex_3);
    }
  }, [productListArray, setMaxIndex_3]);

  return (
    <div className={styles.productBoardContainer}>
      <Banner />

      {/* 트렌딩 섹션 */}
      <motion.div 
        className={styles.contentWrapper1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* 트렌딩 섹션 개선 */}
        <motion.section 
          className={styles.trendingSection}
          {...fadeInUp}
        >
          <h2 className={styles.sectionTitle}>Trending Now</h2>
          <Slider />
        </motion.section>

        {/* 날씨 패션 섹션 */}
        <motion.section
          className={`${styles.weatherFashionSection} ${styles.animatedSection}`}
          style={{
            backgroundImage: getWeatherBackground(weather.desc),
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          {...fadeInUp}
        >
          <h2 className={styles.sectionTitle}>Today's Weather Fashion</h2>
          {weather.loading ? (
            <p>Loading...</p>
          ) : (
            <div className={styles.weatherDetails}>
              <div className={styles.weatherInfo}>
                <img src={imgSrc} alt={weather.desc} className={styles.weatherIcon} />
                <div>
                  <p className={styles.weatherstate}>서울특별시</p>
                  <p className={styles.weatherDesc}>{getWeatherDescription(weather.desc)}</p>
                </div>
                <p>현재 온도: <span>{Math.round(weather.temp - 273.15)}°C</span></p>
                <p>최고: <span>{Math.round(weather.temp_max - 273.15)}°C</span></p>
                <p>최저: <span>{Math.round(weather.temp_min - 273.15)}°C</span></p>
                <p>습도: <span>{weather.humidity}%</span></p>
              </div>
              <div className={styles.weatherFashionTips}>
                <p>오늘의 패션 추천:</p>
                <ul>
                  {weatherTips()}
                </ul>
              </div>
            </div>
          )}
        </motion.section>
        {/* 날씨에 따른 오늘의 옷 추천  */}
        
      </motion.div>
          {/* Today Style */}
          <div className={styles.today_styleBox}>
            <div className={styles.today_style}>Today Weather - Top</div>
            {/* 좌우 화살표 버튼 */}
            <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={handleLeftArrowClick}>
              <img src="../image/arrow.png" alt="Left Arrow" />
            </button>
            <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={handleRightArrowClick}>
              <img src="../image/arrow.png" alt="Right Arrow" />
            </button>

            <div className={styles.productList}>
              {productListArray[0]?.slice(startIndex, startIndex + 3).map((product, index) => (
                <div key={index} className={styles.product}>
                  <Link to={`/product-detail/${product.id}`} className={styles.detailLink}>
                    <div className={styles.productImage}>
                      <img src={product.img} alt={product.name} />
                    </div>
                  </Link>
                  <div className={styles.productText}>
                    {product.name} <br />
                    <span className={styles.price}>{product.price?.toLocaleString()} 원</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 바 */}
            <div className={styles.bottomBar}></div>
          </div>

          <div className={styles.today_styleBox2}>
            <div className={styles.today_style2}>Today Weather - Outer</div>
            <button className={`${styles.arrow2} ${styles.arrowLeft2}`} onClick={handleLeftArrowClick_2}>
              <img src="../image/arrow.png" alt="Left Arrow2" />
            </button>
            <button className={`${styles.arrow2} ${styles.arrowRight2}`} onClick={handleRightArrowClick_2}>
              <img src="../image/arrow.png" alt="Right Arrow2" />
            </button>

            <div className={styles.productList}>
              {productListArray[2]?.slice(startIndex_2, startIndex_2 + 3).map((product, index) => (
                <div key={index} className={styles.product}>
                  <Link to={`/product-detail/${product.id}`} className={styles.detailLink}>
                    <div className={styles.productImage}>
                      <img src={product.img} alt={product.name} />
                    </div>
                  </Link>
                  <div className={styles.productText}>
                    {product.name} <br />
                    <span className={styles.price}>{product.price?.toLocaleString()} 원</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.bottomBar2}></div>
          </div>
            
          <div className={styles.today_styleBox3}>
            <div className={styles.today_style3}>Today Weather - Bottom</div>
            <button className={`${styles.arrow3} ${styles.arrowLeft3}`} onClick={handleLeftArrowClick_3}>
              <img src="../image/arrow.png" alt="Left Arrow3" />
            </button>
            <button className={`${styles.arrow3} ${styles.arrowRight3}`} onClick={handleRightArrowClick_3}>
              <img src="../image/arrow.png" alt="Right Arrow3" />
            </button>

            <div className={styles.productList}>
              {productListArray[1]?.slice(startIndex_3, startIndex_3 + 3).map((product, index) => (
                <div key={index} className={styles.product}>
                  <Link to={`/product-detail/${product.id}`} className={styles.detailLink}>
                    <div className={styles.productImage}>
                      <img src={product.img} alt={product.name} />
                    </div>
                  </Link>
                  <div className={styles.productText}>
                    {product.name} <br />
                    <span className={styles.price}>{product.price?.toLocaleString()} 원</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.bottomBar3}></div>
            
          </div>
      <Footer />
    </div>
  );
};

export default ProductBoard;
