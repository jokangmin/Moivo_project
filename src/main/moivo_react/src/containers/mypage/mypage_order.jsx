import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from "../../assets/css/Mypage_order.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { PATH } from '../../../scripts/path';
import axiosInstance from '../../utils/axiosConfig';

const Mypage_order = () => {
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

    return (
        <div>
            <div className={styles.memberFrame}>
                <Banner />
                <div className={styles.order}>ORDER</div>
                <div className={styles.instructions}>
                    주문번호를 클릭하시면 해당 주문에 대한 상세내역을 확인하실 수 있습니다.<br />
                    취소/교환/반품 신청은 어렵습니다. 신중히 주문해주세요.
                </div>
                <div className={styles.table}>
                    <div className={styles.row}>
                        <div className={styles.column2}>주문일자<br />[주문번호]</div>
                        <div className={styles.column2}>이미지</div>
                        <div className={styles.column2}>상품정보</div>
                        <div className={styles.column2}>총 수량</div>
                        <div className={styles.column2}>총 금액</div>
                        <div className={styles.column2}>주문처리상태</div>
                    </div>
                    {OrdersList.map((order, index) => {
                        const additionalCount = order.count - 1; // 추가 상품 개수
                        
                        // 총 금액 계산
                        const totalPrice = order.totalPrice;

                        // 총 수량 계산
                        const totalQuantity = order.count;

                        return (
                            <div className={styles.row} key={index}>
                                <div className={styles.column}>
                                    <Link to={'/mypage/orderDetails'} state={{ tosscode: order.tosscode }} className={styles.orderLink}>
                                        [{order.tosscode}]
                                    </Link>
                                </div>
                                <div className={styles.image}>
                                    {order?.productImg ? (
                                        <img src={order.productImg} alt={order.productName || "상품 이미지"} />
                                    ) : (
                                        <div>이미지가 없습니다</div>
                                    )}
                                </div>
                                <div className={styles.column3}>
                                    <div className={styles.productInfo}>
                                        <div className={styles.productName}>{order?.productName || "상품 정보 없음"}</div>
                                        {order.count > 1 && ` 외 ${order.count - 1}개`}
                                        <br />
                                    </div>
                                </div>
                                <div className={styles.column}>
                                    {totalQuantity}개
                                </div>
                                <div className={styles.column}>
                                    KRW {totalPrice.toLocaleString()}
                                </div>
                                <div className={styles.column}>
                                    {order.deliveryStatus === "CONFIRMED" ? (
                                        <div className={styles.confirmedText}>배송완료</div>
                                    ) : order.deliveryStatus === "PAYMENT_COMPLETED" ? (
                                        <>
                                            <div className={styles.statusText}>결제완료</div>
                                            <button
                                                className={styles.editReviewButton}
                                                onClick={() => handleOrderCancel(order)}
                                            >
                                                주문 취소
                                            </button>
                                        </>
                                    ) : order.deliveryStatus === "READY" ? (
                                        <>
                                            <div className={styles.statusText}>준비중</div>
                                            <button
                                                className={styles.editReviewButton}
                                                onClick={() => handleOrderCancel(order)}
                                            >
                                                주문 취소
                                            </button>
                                        </>
                                    ) : order.deliveryStatus === "DELIVERY" ? (
                                        <div className={styles.statusText}>배송중</div>
                                    ) : (
                                        order.deliveryStatus || "배송 상태 없음"
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 페이지네이션 */}
                <div className={styles.pagination}>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            className={`${styles.pageButton} ${i === currentPage ? styles.active : ""}`}
                            onClick={() => handlePageClick(i)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <div className={styles.bottomBar}></div>
                <Link to="/mypage" className={styles.backLink}>
                    Go Back to MyPage
                </Link>
            </div>
            <Footer />
        </div>
    );
};

export default Mypage_order;
