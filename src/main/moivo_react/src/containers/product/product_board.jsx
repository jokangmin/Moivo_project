// src/containers/product/ProductBoard.jsx
import React, { useState, useEffect } from 'react';
import Slider from "../../components/Slider/Slider";
import styles from "../../assets/css/product_board.module.css";
import Footer from '../../components/Footer/Footer';
import Banner from '../../components/Banner/banner';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ProductBoard = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [trendingItems, setTrendingItems] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [weather, setWeather] = useState({
    temp: 0,
    temp_max: 0,
    temp_min: 0,
    humidity: 0,
    desc: '',
    icon: '',
    loading: true,
  });
  const [weatherFashion, setWeatherFashion] = useState([]);

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 날씨 정보 초기 로드
  useEffect(() => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${import.meta.env.VITE_WEATHER_API_KEY}`;
    axios
      .get(url)
      .then((response) => {
        const data = response.data;
        setWeather({
          temp: data.main.temp,
          temp_max: data.main.temp_max,
          temp_min: data.main.temp_min,
          humidity: data.main.humidity,
          desc: data.weather[0].description,
          icon: data.weather[0].icon,
          loading: false,
        });
      })
      .catch((error) => console.log(error));
  }, []);

  const imgSrc = `https://openweathermap.org/img/w/${weather.icon}.png`;

  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  

  const weatherTips = () => {
    const tempC = Math.round(weather.temp - 273.15);
    let tips = [];
  
    if (tempC < 5) {
      tips.push("따뜻한 아우터", "따뜻한 니트", "따뜻한 장갑");
    } else if (tempC >= 5 && tempC <= 20) {
      tips.push("가벼운 또는 중간 두께의 아우터", "편안한 캐주얼", "따뜻한 양말");
    } else if (tempC > 20) {
      tips.push("시원한 반팔", "가벼운 셔츠", "가벼운 신발");
    }
  
    if (["light rain", "moderate rain", "heavy rain", "thunderstorm"].includes(weather.desc)) {
      tips.push("방수 재킷", "비에 강한 신발", "우산 또는 비옷");
    }
  
    if (["light snow", "moderate snow", "heavy snow", "sleet"].includes(weather.desc)) {
      tips.push("따뜻한 점퍼", "따뜻한 니트", "따뜻한 장갑");
    }
  
    // 추가적인 날씨 상황에 대한 패션 추천
    switch (weather.desc) {
      case "mist":
        tips.push("따뜻한 후드", "비옷 또는 방수 재킷", "워커 부츠");
        break;
      case "fog":
        tips.push("따뜻한 후드티", "방수 재킷", "안개에 강한 부츠");
        break;
      case "dust":
      case "sand":
      case "sand dust":
        tips.push("마스크", "긴 소매 셔츠", "신발덮개");
        break;
      case "haze":
        tips.push("편안한 트레이닝복", "가벼운 스니커즈", "썬글라스");
        break;
      case "smoke":
      case "volcanic ash":
        tips.push("마스크", "긴 소매 의류", "방독면");
        break;
      case "squalls":
      case "tornado":
        tips.push("튼튼한 아우터", "안전한 신발", "헬멧");
        break;
      default:
        break;
    }
  
    return tips.map((tip, index) => <li key={index} className={styles.fashionTip}>{tip}</li>);
  };

  const getWeatherDescription = (desc) => {
    switch (desc) {
      case "clear sky": return "맑은 하늘";
      case "few clouds": return "약간의 구름";
      case "scattered clouds": return "분산된 구름";
      case "broken clouds": return "흐린 구름";
      case "overcast clouds": return "완전한 구름 덮인 하늘";
      case "light rain": return "가벼운 비";
      case "moderate rain": return "중간 강도의 비";
      case "heavy intensity rain": return "강한 강도의 비";
      case "very heavy rain": return "매우 강한 비";
      case "drizzle": return "이슬비";
      case "light snow": return "가벼운 눈";
      case "moderate snow": return "중간 강도의 눈";
      case "heavy snow": return "강한 눈";
      case "sleet": return "진눈깨비";
      case "light shower sleet": return "가벼운 진눈깨비";
      case "shower sleet": return "진눈깨비 소나기";
      case "light rain and snow": return "가벼운 비와 눈";
      case "rain and snow": return "비와 눈";
      case "light shower rain": return "가벼운 소나기 비";
      case "shower rain": return "소나기 비";
      case "thunderstorm": return "천둥 번개";
      case "thunderstorm with light rain": return "천둥번개와 가벼운 비";
      case "thunderstorm with rain": return "천둥번개와 비";
      case "thunderstorm with heavy rain": return "천둥번개와 강한 비";
      case "mist": return "안개";
      case "smoke": return "연기";
      case "haze": return "박무";
      case "dust": return "먼지";
      case "sand": return "모래";
      case "fog": return "안개";
      case "sand dust": return "모래 먼지";
      case "volcanic ash": return "화산재";
      case "squalls": return "돌풍";
      case "tornado": return "토네이도";
      default: return desc;
    }
  };

  const getWeatherBackground = (desc) => {
    if (["clear sky", "few clouds"].includes(desc)) {
      return "url('https://images.unsplash.com/photo-1648787984772-458ce678bdf3?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";
    } else if (["scattered clouds", "broken clouds", "overcast clouds"].includes(desc)) {
      return "url('https://images.unsplash.com/photo-1706178182179-c008245a1255?q=80&w=2662&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";
    } else if (["light rain", "moderate rain", "heavy intensity rain", "very heavy rain", "drizzle", "light rain and snow", "light shower rain", "rain and snow"].includes(desc)) {
      return "url('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";
    } else if (["light snow", "moderate snow", "heavy snow", "sleet", "light shower sleet", "shower sleet"].includes(desc)) {
      return "url('https://images.unsplash.com/photo-1547754980-3df97fed72a8?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";
    } else if (["thunderstorm", "thunderstorm with light rain", "thunderstorm with rain", "thunderstorm with heavy rain"].includes(desc)) {
      return "url('https://images.unsplash.com/photo-1548996206-122c521b2d39?q=80&w=2667&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";
    } else if (["squalls", "tornado"].includes(desc)) {
      return "url('https://images.unsplash.com/photo-1695605117745-ae4e67fcaa56?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')";
    } else {
      return "default background url here"; // 기본 배경 URL 설정
    }
  };

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
