import React from 'react';
import styles from "../../assets/css/Mypage_orderDetails.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { useMypageOrderDetailContext } from '../../contexts/mypageCon/MypageOrderDetailContext';
import { useNavigate } from 'react-router-dom';

const MypageOrderDetails = () => {
    const {
        OrderDetailList,
        OrdersInfo,
        paymentId,
        userId,
        handleButtonClick,
    } = useMypageOrderDetailContext();

    const navigate = useNavigate();
    //*********************************************************************** */
    return (
        <div>
            <div className={styles.orderDetailsContainer}>
                <Banner/>
                {/* 헤더 섹션 */}
                <header className={styles.header}>
                    <h1>ORDER DETAILS</h1>
                </header>

                {/* 주문 및 배송 정보 */}
                <section className={styles.infoSection}>
                    <div className={styles.orderInfo}>
                        <p className={styles.label2} style={{ color: '#2F2E2C' }}>주문정보</p>
                        <hr className={styles.dottedLine} />
                        <div className={styles.rowInfo}>
                            <p className={styles.label}>주문번호:</p>
                            <p className={styles.value}>{OrdersInfo[0]?.tosscode}</p>
                        </div>
                        <hr className={styles.dottedLine} />
                        <div className={styles.rowInfo}>
                            <p className={styles.label}>주문일자:</p>
                            <p className={styles.value}>{OrdersInfo[0]?.paymentDate?.replace('T', ' ')}</p>
                        </div>
                        <hr className={styles.dottedLine} />
                        <div className={styles.rowInfo}>
                            <p className={styles.label}>주문자:</p>
                            <p className={styles.value} style={{ color: '#2F2E2C' }}>{OrdersInfo[0]?.name}</p>
                        </div>
                    </div>
                    <div className={styles.shippingInfo}>
                        <p className={styles.label2} style={{ color: '#2F2E2C' }}>배송지정보</p>
                        <hr className={styles.dottedLine} />
                        <div className={styles.rowInfo}>
                            <p className={styles.label}>우편번호:</p>
                            <p className={styles.value} style={{ color: '#2F2E2C' }}>{OrdersInfo[0]?.zipcode}</p>
                        </div>
                        <hr className={styles.dottedLine} />
                        <div className={styles.rowInfo}>
                            <p className={styles.label}>주소:</p>
                            <p className={styles.value} style={{ color: '#2F2E2C' }}>{OrdersInfo[0]?.addr1} {OrdersInfo[0]?.addr2}</p>
                        </div>
                        <hr className={styles.dottedLine} />
                        <div className={styles.rowInfo}>
                            <p className={styles.label}>휴대전화:</p>
                            <p className={styles.value} style={{ color: '#2F2E2C' }}>{OrdersInfo[0]?.tel}</p>
                        </div>
                    </div>
                </section>
                <hr className={styles.solidLine} />

                
                {/* 주문 상품 정보 */}
                <section className={styles.tableSection}>
                    <div className={styles.table}>
                    <div className={styles.row}>
                        <div className={styles.column2}>상품이미지</div>
                        <div className={styles.column2}>상품명</div>
                        <div className={styles.column2}>사이즈</div>
                        <div className={styles.column2}>수량</div>
                        <div className={styles.column2}>상품금액</div>
                        <div className={styles.column2}>주문상태</div>
                    </div>
                    {OrderDetailList.map((item, index) => (
                        <div className={styles.row} key={index}>
                            <div className={styles.image}>
                                <img src={item.productImg} alt={`order-${index}`} />
                            </div>
                            <div className={styles.column3}>{item.productName}</div>
                            <div className={styles.column}>{item.size}</div>
                            <div className={styles.column}>x {item.count}</div> {/* 수량 표시 */}
                            <div className={styles.column}>KRW {item.price}</div>
                            <div className={styles.column}>
                            {OrdersInfo[0]?.deliveryStatus === "CONFIRMED" ? (
                                item.writeReview === false ? (
                                    <>
                                        <div className={styles.confirmedText}>배송완료</div>
                                        <button 
                                            className={styles.reviewButton} 
                                            onClick={() => navigate('/review/write', { 
                                                state: { 
                                                    productId: item.productId,
                                                    productName: item.productName,
                                                    paymentDetailId: item.id,
                                                    size: item.size,
                                                    userId: userId,
                                                    userName: OrdersInfo[0]?.name,
                                                    orderDate: OrdersInfo[0]?.paymentDate
                                                } 
                                            })}
                                        >
                                            Review
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.reviewCompleteText}>리뷰작성완료</div>
                                        <button 
                                            className={styles.editReviewButton} 
                                            onClick={() => {
                                                if (!item.id || !item.productId || !item.productName) {
                                                    console.error('필요한 데이터가 없습니다:', item);
                                                    return;
                                                }
                                                navigate('/review/write', { 
                                                    state: { 
                                                        productId: item.productId,
                                                        productName: item.productName,
                                                        paymentDetailId: item.id,
                                                        size: item.size,
                                                        userId: userId,
                                                        userName: OrdersInfo[0]?.name,
                                                        orderDate: OrdersInfo[0]?.paymentDate,
                                                        isReviewComplete: true
                                                    } 
                                                });
                                            }}
                                        >
                                            리뷰 수정
                                        </button>
                                    </>
                                )
                            ) : OrdersInfo[0]?.deliveryStatus === "PAYMENT_COMPLETED" ? (
                                <div className={styles.statusText}>결제완료</div>
                            ) : OrdersInfo[0]?.deliveryStatus === "READY" ? (
                                <div className={styles.statusText}>준비중</div>
                            ) : OrdersInfo[0]?.deliveryStatus === "DELIVERY" ? (
                                <div className={styles.statusText}>배송중</div>
                            ) : (
                                OrdersInfo[0]?.deliveryStatus || "배송 상태 없음"
                            )}
                            </div>
                        </div>

                        ))}
                    </div>
                </section>

                <hr className={styles.solidLine} />

                {/* 결제 정보 */}
                <section className={styles.paymentSummary}>
                    <p className={styles.totalPrice}>합계: <span>KRW {OrdersInfo[0]?.totalPrice}</span></p>
                </section>


                {/* 주문 목록 버튼 */}
                <button className={styles.backToOrders} onClick={handleButtonClick}>
                    주문목록
                </button>
            </div>
            <Footer />
        </div>
    );
};

export default MypageOrderDetails;