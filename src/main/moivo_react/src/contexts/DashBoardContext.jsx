import React, { createContext, useContext, useState, useEffect } from 'react';
import styles from "./../assets/css/product_board.module.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

const DashBoardContext = createContext();
export const useDashBoard = () => useContext(DashBoardContext);

const DashBoardProvider = ({ children }) => {
      const [startIndex, setStartIndex] = useState(0);
      const [maxIndex, setMaxIndex] = useState(0);
      const [startIndex_2, setStartIndex_2] = useState(0);
      const [maxIndex_2, setMaxIndex_2] = useState(0);
      const [startIndex_3, setStartIndex_3] = useState(0);
      const [maxIndex_3, setMaxIndex_3] = useState(0);
      const [weather, setWeather] = useState({
        temp: 0,
        temp_max: 0,
        temp_min: 0,
        humidity: 0,
        desc: '',
        icon: '',
        loading: true,
      });
      const navigate = useNavigate();
      const [productList, setProductList] = useState([]);
      const [WeatherCategory, setWeatherCategory] = useState(null);


      useEffect(() => {
        const fetchData = async () => {
          try {
            const WeatherCategoryResponse = await axiosInstance.get(`/api/store/weather`,{
              params: {
                sortby: WeatherCategory
              }
            });
            setProductList(WeatherCategoryResponse.data);
            
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
      
        fetchData();
      
      }, [WeatherCategory, weather]);

      useEffect(() => {
        const tempC = Math.round(weather.temp - 273.15);
      
        if (tempC < 5) {
          setWeatherCategory(1);
        } else if (tempC >= 5 && tempC <= 20) {
          setWeatherCategory(2);
        } else if (tempC > 20) {
          setWeatherCategory(3);
        }
      }, [weather]);
    
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
          console.log("WeatherCategory : " + WeatherCategory);
        } else if (tempC >= 5 && tempC <= 20) {
          tips.push("가벼운 또는 중간 두께의 아우터", "편안한 캐주얼", "따뜻한 양말");
          console.log("WeatherCategory : " + WeatherCategory);
        } else if (tempC > 20) {
          tips.push("시원한 반팔", "가벼운 셔츠", "가벼운 신발");
          console.log("WeatherCategory : " + WeatherCategory);
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


      const handleLeftArrowClick = () => {
        setStartIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : maxIndex));
      };
    
      const handleRightArrowClick = () => {
        setStartIndex((prevIndex) => (prevIndex < maxIndex ? prevIndex + 1 : 0));
        console.log("maxIndex : " + maxIndex);
      };

      const handleLeftArrowClick_2 = () => {
        setStartIndex_2((prevIndex_2) => (prevIndex_2 > 0 ? prevIndex_2 - 1 : maxIndex_2));
      };
    
      const handleRightArrowClick_2 = () => {
        setStartIndex_2((prevIndex_2) => (prevIndex_2 < maxIndex_2 ? prevIndex_2 + 1 : 0));
        console.log("maxIndex2 : " + maxIndex_2);
      };

      const handleLeftArrowClick_3 = () => {
        setStartIndex_3((prevIndex_3) => (prevIndex_3 > 0 ? prevIndex_3 - 1 : maxIndex_3));
      };
    
      const handleRightArrowClick_3 = () => {
        setStartIndex_3((prevIndex_3) => (prevIndex_3 < maxIndex_3 ? prevIndex_3 + 1 : 0));
        console.log("maxIndex3 : " + maxIndex_3);
      };

    return (
        <DashBoardContext.Provider
            value={{
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
            }}
        >
            {children}
        </DashBoardContext.Provider>
    );
};

export default DashBoardProvider;