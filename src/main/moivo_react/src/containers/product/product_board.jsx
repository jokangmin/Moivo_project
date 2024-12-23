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
    getWeatherDescription
  } = useDashBoard();

  return (
    <div className={styles.productBoardContainer}>
      <Banner />

      {/* 트렌딩 섹션 */}
      <motion.div 
        className={styles.contentWrapper}
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
        {/* 시즌 컬렉션 쇼케이스 */}
        <motion.section 
          className={styles.seasonShowcase}
          {...fadeInUp}
        >
          <h2 className={styles.sectionTitle}>Season Collection</h2>
          <div className={styles.seasonGrid}>
            {[
              { 
                season: 'Spring', 
                desc: '봄의 새로움을 담은 컬렉션', 
                image: 'https://images.unsplash.com/photo-1522682078546-47888fe04e81',
                items: ['플로럴 원피스', '라이트 데님', '트렌치코트'] 
              },
              { 
                season: 'Summer', 
                desc: '여름의 청량감을 담은 컬렉션', 
                image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
                items: ['린넨 셔츠', '와이드 팬츠', '스트로 햇'] 
              },
              { 
                season: 'Fall', 
                desc: '가을의 따스함을 담은 컬렉션', 
                image: 'https://images.unsplash.com/photo-1511401139252-f158d3209c17',
                items: ['니트 카디건', '울 코트', '앵클부츠'] 
              },
              { 
                season: 'Winter', 
                desc: '겨울의 포근함을 담은 컬렉션', 
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
                items: ['캐시미어 코트', '터틀넥', '울 스카프'] 
              }
            ].map((item) => (
              <motion.div 
                key={item.season}
                className={styles.seasonCard}
                whileHover={{ scale: 1.05 }}
              >
                <div className={styles.seasonImage} style={{backgroundImage: `url(${item.image})`}}>
                  <div className={styles.seasonOverlay}>
                    <h3>{item.season}</h3>
                  </div>
                </div>
                <div className={styles.seasonContent}>
                  <h4>{item.desc}</h4>
                  <ul>
                    {item.items.map((i, idx) => (
                      <li key={idx} className={styles.seasonItem}>{i}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>

      <Footer />
    </div>
  );
};

export default ProductBoard;
