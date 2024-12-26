import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

const MypageOrderDetailContext = createContext();

export const useMypageOrderDetailContext = () => useContext(MypageOrderDetailContext);

const MypageOrderDetailProvider = ({ children }) => {
    const location = useLocation();
    const [OrderDetailList, setOrderDetailList] = useState([]);
    const [OrdersInfo, setOrdersInfo] = useState({});
    const [paymentId, setPaymentId] = useState(undefined);
    const { tosscode } = location.state || {};
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);

    //주문 목록으로 다시 이동하는 부분
    const handleButtonClick = () => {
      navigate('/mypage/order'); // 이동할 경로 설정
    };

    //디테일 가지고 오기 - 12/17 강민
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
            alert("로그인이 필요합니��.");
            navigate("/user");
            return;
        }

        // 토큰 디코딩 (jwt-decode 없이)
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        setUserId(decodedPayload.id);
        console.log("User ID:", decodedPayload.id);

        //구매한 payment info 정보 가지고 오기, 구매한 상세 목록 가지고 오기 - 12/17 강민
        const fetchOrdersInfo = async () => {
            try {
                const orderInfoResponse = await axiosInstance.get(`/api/user/mypage/orders/info/${tosscode}`);
                setOrdersInfo(orderInfoResponse.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchOrdersInfo();

      }, [navigate, tosscode]);

      useEffect(() => {
        if (OrdersInfo.length > 0) {
            const paymentId = OrdersInfo[0]?.id;
            console.log("paymentId :", paymentId);
    
            // 2단계: OrderDetailList 가져오기
            const fetchOrderDetails = async () => {
                try {
                    const orderDetailsResponse = await axiosInstance.get(`/api/user/mypage/orders/details/${paymentId}`);
                    setOrderDetailList(orderDetailsResponse.data);

                    // OrdersInfo가 로드된 후 paymentId 설정
                    if (OrdersInfo[0]) {
                        setPaymentId(OrdersInfo[0].id); // OrdersInfo[0]가 있을 경우에만 설정
                    }
                } catch (error) {
                    console.error("Error fetching order details:", error);
                }
            };
    
            fetchOrderDetails();
        }
    }, [OrdersInfo]);

      //값 확인하기
      useEffect(() => {
        console.log("Updated OrdersInfo:", OrdersInfo);
        console.log("OrdersInfo as JSON:", JSON.stringify(OrdersInfo, null, 2)); // JSON 형태로 보기
      }, [OrdersInfo]);

      useEffect(() => {
        console.log("OrderDetailList:", OrderDetailList);
      }, [OrderDetailList]);


    const value = {
        OrderDetailList,
        OrdersInfo,
        paymentId,
        userId,
        handleButtonClick,
    };

    return (
        <MypageOrderDetailContext.Provider value={value}>
            {children}
        </MypageOrderDetailContext.Provider>
    );
};

export default MypageOrderDetailProvider;