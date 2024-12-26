import { Link} from 'react-router-dom';
import styles from "../../assets/css/Mypage_order.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { useMypageOrderContext } from '../../contexts/mypageCon/MypageOrderContext';

const Mypage_order = () => {
    const {
        OrdersList,
        currentPage,
        totalPages,
        emailSent,
        myEmail,
        handleOrderCancel,
        fetchOrders,
        handlePageClick,
    } = useMypageOrderContext();

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
