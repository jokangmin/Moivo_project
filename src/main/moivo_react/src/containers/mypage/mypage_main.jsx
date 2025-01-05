// src/pages/MypageMain.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "../../assets/css/Mypage.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { useMypageContext } from "../../contexts/mypageCon/MypageContext";

const MypageMain = () => {
  const {
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
  } = useMypageContext();

  return (
    <div>
      <div className={styles.memberFrame}>
        <Banner />
        <div className={styles.title}>MY ACCOUNT</div>
        <div className={styles.membershipBox}>
          <div className={styles.membershipImage}>
            <img src="../image/level5.png" alt="Profile" />
          </div>
          <div>
            <div className={styles.membershipInfo}>
              {userInfo ? (
                <>
                  <p>{userInfo.name}님의 멤버십 등급은 <strong>[ {userInfo.grade} ]</strong>입니다.</p>
                  {userInfo.grade === "LV5" ? (
                    <p>축하합니다! 최고 등급입니다. 지금의 등급을 계속 유지하세요 :)</p>
                  ) : (
                    <p>
                      다음 등급까지 남은 구매금액은 
                      <strong> KRW {userInfo.nextLevelTarget.toLocaleString()}원</strong>입니다.
                    </p>
                  )}
                  <p>
                    키: <strong>{userInfo.height}cm</strong> &nbsp;
                    몸무게: <strong>{userInfo.weight}kg</strong>
                  </p>
                </>
              ) : (
                "사용자 정보를 불러오는 중입니다..."
              )}
            </div>
            <div className={styles.couponSection}>
              <div className={styles.coupon}>
                COUPON: &nbsp;
                {userInfo && userInfo.coupon ? (
                  <>
                    {/* 사용 불가 쿠폰 처리 */}
                    {userInfo.coupon.couponName === "이미 사용한 쿠폰입니다." ||
                    userInfo.coupon.couponName === "유효기간이 지난 쿠폰입니다." ? (
                      <strong>{userInfo.coupon.couponName}</strong>
                    ) : (
                      // 유효한 쿠폰 출력
                      <div 
                        className={styles.couponItem}
                        onMouseEnter={handleCouponMouseEnter}
                        onMouseLeave={handleCouponMouseLeave}
                      >
                        <strong>{userInfo.coupon.couponName}</strong>
                        {showCouponTooltip && (
                          <div className={styles.couponTooltip}>
                            유효기간:{" "}
                            {new Date(userInfo.coupon.startDate).toLocaleDateString()} ~{" "}
                            {new Date(userInfo.coupon.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  "쿠폰 정보를 불러오는 중입니다..."
                )}
              </div>
            </div>
          </div>
          <div className={styles.tooltipIcon} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <img src="../image/info.png" alt="Info Icon" />
            {showTooltip && (
              <div className={styles.tooltip}>
                <p>
                  LV 1 : 일반회원<br />
                  LV 2: 월 구매 10만원 이상<br />
                  LV 3: 월 구매 30만원 이상<br />
                  LV 4: 월 구매 50만원 이상<br />
                  LV 5: 월 구매 70만원 이상<br /><br/>
                  <strong>LV 2 혜택:</strong> LV2 전용 15% 할인 쿠폰<br />
                  <strong>LV 3 혜택:</strong> LV3 전용 20% 할인 쿠폰<br />
                  <strong>LV 4 혜택:</strong> LV4 전용 25% 할인 쿠폰<br />
                  <strong>LV 5 혜택:</strong> LV5 전용 30% 할인 쿠폰<br />
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.onlyForYouBox}>
            <div className={styles.onlyForYou}>ONLY FOR YOU</div>
            <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={handleLeftArrowClick}>
              <img src="../image/arrow.png" alt="Left Arrow" />
            </button>
            <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={handleRightArrowClick}>
              <img src="../image/arrow.png" alt="Right Arrow" />
            </button>

            <div className={styles.productList}>
              {productList.slice(startIndex, startIndex + 3).map((product, index) => (
                <div key={index} className={styles.product}>
                  <Link to={`/product-detail/${product.id}`} className={styles.orderLink}>
                    <div className={styles.productImage}>
                      <img src={product.img} alt={product.name} />
                    </div>
                  </Link>
                  <div className={styles.productText}>
                    {product.name} <br />
                    <span className={styles.price}>{product.price}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.bottomBar}></div>
          </div>

          <div className={styles.menuWrapper}>
            <div className={styles.crossLine}>
              <div className={styles.horizontal}></div>
              <div className={styles.vertical}></div>
            </div>
            <Link to="/mypage/profile" className={styles.menuItem}>
              <img src="../image/profile.png" alt="Profile" />
              PROFILE
            </Link>
            <Link to="/mypage/order" className={styles.menuItem}>
              <img src="../image/order.png" alt="Order" />
              ORDER
            </Link>
            <Link to="/mypage/board" className={styles.menuItem}>
              <img src="../image/board.png" alt="Board" />
              BOARD
            </Link>
            <Link to="/mypage/wish" className={styles.menuItem}>
              <img src="../image/wish.png" alt="Wishlist" />
              WISHLIST
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MypageMain;