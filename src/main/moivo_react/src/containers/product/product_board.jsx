// src/containers/product/ProductBoard.jsx
import React, { useState, useEffect } from 'react';
import Slider from "../../components/Slider/Slider";
import styles from "../../assets/css/product_board.module.css";
import Footer from '../../components/Footer/Footer';
import Banner from '../../components/Banner/banner';
import { motion } from 'framer-motion';
import { useDashBoard } from '../../contexts/DashBoardContext';

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
    productList,
    startIndex,
  } = useDashBoard();

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
          {/* ONLY FOR YOU */}
          <div className={styles.today_styleBox}>
            <div className={styles.today_style}>Today Style</div>
            {/* 좌우 화살표 버튼 */}
            <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={handleLeftArrowClick}>
              <img src="../image/arrow.png" alt="Left Arrow" />
            </button>
            <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={handleRightArrowClick}>
              <img src="../image/arrow.png" alt="Right Arrow" />
            </button>

            <div className={styles.productList}>
              {productList.slice(startIndex, startIndex + 3).map((product, index) => (
                <div key={index} className={styles.product}>
                  <div className={styles.productImage}>
                    <img src={product.img} alt={product.name} />
                  </div>
                  <div className={styles.productText}>
                    {product.name} <br />
                    <span className={styles.price}>{product.price} 원</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 바 */}
            <div className={styles.bottomBar}></div>
            
          </div>
      <Footer />
    </div>
  );
};

export default ProductBoard;
