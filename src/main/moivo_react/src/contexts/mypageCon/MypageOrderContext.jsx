import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../scripts/path';
import axiosInstance from '../../utils/axiosConfig';

const MypageOrderContext = createContext();

export const useMypageOrderContext = () => useContext(MypageOrderContext);

const MypageOrderProvider = ({ children }) => {
    const [OrdersList, setOrdersList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [emailSent, setEmailSent] = useState(false);
    const [myEmail, setMyEmail] = useState(null);
    const navigate = useNavigate();

    //나의 이메일 얻어오는 부분 추가 - 12/20 11:22 강민
    useEffect(()=>{
        const id = localStorage.getItem("id");
        
        if (!id) {
            alert("로그인이 필요합니다.");
            navigate("/user");
            return;
        }

        const fetchGetEmail = async () => {
            try{
                const getEmailResponse = await axiosInstance.get(`/api/user/mypage/info/${id}`)
                const data = getEmailResponse.data
                setMyEmail(data.email);
            }catch (error){
                console.error("get email Error fetching data:", error);
            }
        }

        fetchGetEmail();
    },[]);

    //fetchordercancel 부분 추가 - 12/20 강민
    const handleOrderCancel = (order) => {
        if (!order.tosscode || !order.id) {
            console.error("필요한 데이터가 없습니다");
            return;
        }
        const Tosscode = order.tosscode;
        const orderCancelId = order.id;

        console.log("tosscode :" + Tosscode + "PK id :" + orderCancelId);

        const fetchOrderCancel = async () => {
            try {
                const ordersCancelResponse = await axiosInstance.delete(`/api/user/payment`, {
                    params: { Tosscode, orderCancelId }, 
                });
                console.log("Order cancel response:", ordersCancelResponse.data);
                alert("주문이 성공적으로 취소되었습니다.");

                //주문 취소 성공 시 보내는 이메일 12/20 추가 - 강민
                if (!emailSent) {
                    if (!myEmail) {
                        console.error("이메일 정보가 없습니다");
                    }
                    const sendEmail = async () => {
                      try {
                        const response = await fetch(`${PATH.SERVER}/api/mail/cancel`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            toAddress: myEmail, // 받는 사람 이메일
                            orderId: order.tosscode, // 주문번호
                            customerName: order.name, // 결제자
                            orderName: order?.productName, // 상품 이름
                            amount: order.totalPrice, // 결제 금액
                          }),
                        });
              
                        if (response.ok) {
                          console.log("이메일 발송 성공");
                          setEmailSent(true); // 이메일 전송 성공 시 상태 업데이트
                        } else {
                          console.error("이메일 발송 실패");
                        }
                      } catch (error) {
                        console.error("이메일 발송 중 오류 발생", error);
                      }
                    };
              
                    sendEmail();
                }

            } catch (error) {
                console.error("OrderCancel Error fetching data:", error);
                alert("주문 취소 중 문제가 발생했습니다. 다시 시도해주세요.");
            }
        }

        fetchOrderCancel();
    };


    // fetchOrders 함수 정의
    const fetchOrders = async (page = 0, size = 4) => {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/user");
            return;
        }

        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        const id = decodedPayload.id;

        try {
            const ordersResponse = await axiosInstance.get(`/api/user/mypage/orders/${id}`, {
                params: { page, size, sort: 'id,desc' },
            });

            if (ordersResponse.data && ordersResponse.data.content && Array.isArray(ordersResponse.data.content)) {
                setOrdersList(ordersResponse.data.content);
                setTotalPages(ordersResponse.data.totalPages);
                setCurrentPage(page);
            } else {
                console.warn("Unexpected response data format:", ordersResponse.data);
                setOrdersList([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);

            if (error.response) {
                console.error("Server response error:", error.response.status, error.response.data);
                alert("구매목록이 없습니다.");
            } else if (error.request) {
                console.error("No response received from server:", error.request);
                alert("서버에서 응답이 없습니다. 네트워크 상태를 확인해주세요.");
            } else {
                console.error("Error setting up request:", error.message);
                alert("알 수 없는 에러가 발생했습니다.");
            }

            setOrdersList([]);
        }
    }

    // 페이지네이션 버튼 클릭 시 fetchOrders 호출
    const handlePageClick = (page) => {
        fetchOrders(page);
    };

    useEffect(() => {
        fetchOrders();
    }, [navigate]);

    //확인용
    useEffect(() => {
        if (myEmail !== null) {
            console.log("email : " + myEmail); 
        }
    }, [myEmail]);

    const value = {
        OrdersList,
        currentPage,
        totalPages,
        emailSent,
        myEmail,
        handleOrderCancel,
        fetchOrders,
        handlePageClick,
      };

    return (
        <MypageOrderContext.Provider value={value}>
            {children}
        </MypageOrderContext.Provider>
    );
};

export default MypageOrderProvider;