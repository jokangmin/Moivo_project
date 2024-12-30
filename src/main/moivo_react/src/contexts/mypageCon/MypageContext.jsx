import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from "../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";

const MypageContext = createContext();

export const useMypageContext = () => useContext(MypageContext);

const MypageProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 저장
  const [productList, setProductList] = useState([]); // 상품 목록 저장
  const [startIndex, setStartIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCouponTooltip, setShowCouponTooltip] = useState(false);

  const navigate = useNavigate();

  // 데이터 fetch 함수
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/user");
      return;
    }

    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    const id = decodedPayload.id;

    const fetchData = async () => {
      try {
        const userResponse = await axiosInstance.get(`/api/user/mypage/info/${id}`);
        setUserInfo(userResponse.data);

        const productsResponse = await axiosInstance.get(`/api/user/mypage/products/${id}`);
        setProductList(productsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [navigate]);

  const maxIndex = productList.length - 3; // 화면에 3개씩 표시

  const handleLeftArrowClick = () => {
    setStartIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : maxIndex));
  };

  const handleRightArrowClick = () => {
    setStartIndex((prevIndex) => (prevIndex < maxIndex ? prevIndex + 1 : 0));
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleCouponMouseEnter = () => {
    setShowCouponTooltip(true);
  };

  const handleCouponMouseLeave = () => {
    setShowCouponTooltip(false);
  };

  // 자동 슬라이드 기능
  useEffect(() => {
    const interval = setInterval(() => {
      handleRightArrowClick(); // 일정 시간마다 오른쪽 화살표 클릭 함수 실행
    }, 3000); // 3초마다 자동으로 슬라이드

    // 컴포넌트 언마운트 시 interval 정리
    return () => clearInterval(interval);
  }, [handleRightArrowClick]);

  const value = {
    userInfo,
    productList,
    startIndex,
    showTooltip,
    showCouponTooltip,
    handleLeftArrowClick,
    handleRightArrowClick,
    handleMouseEnter,
    handleMouseLeave,
    handleCouponMouseEnter,
    handleCouponMouseLeave,
  };

  return (
    <MypageContext.Provider value={value}>
      {children}
    </MypageContext.Provider>
  );
};

export default MypageProvider;
