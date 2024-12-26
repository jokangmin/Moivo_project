import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../../assets/css/Payment.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { usePayment } from "../../contexts/payment/PaymentContext";

const Payment = () => {
  const {
    formData,
    setFormData,
    handleFindPostalCode,
    handleChange,
    handlePayment,
    renderCouponOption,
    calculateDiscountedPrice,
    getDiscountedTotal,
    loading,
    coupon,
    cartItems,
    totalPrice,
    isCartItem,
  } = usePayment();

  return (
    <div>
      <Banner />
      <div className={styles.paymentFrame}>
        <div className={styles.title}>Your Payment</div>
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
            <form className={styles.userForm2}>
              <div className={styles.formRow2}>
                <label>이름</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formRow2}>
                <label>전화번호</label>
                <input
                  type="text"
                  name="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formRow2}>
                <label>우편번호</label>
                <div className={styles.addressRow2}>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" onClick={handleFindPostalCode}>우편번호 찾기</button>
                </div>
              </div>
              <div className={styles.formRow2}>
                <label>주소</label>
                <input
                  type="text"
                  name="addr1"
                  value={formData.addr1}
                  onChange={handleChange}
                  placeholder="기본 주소"
                  required
                />
                <input
                  type="text"
                  name="addr2"
                  value={formData.addr2}
                  onChange={handleChange}
                  placeholder="상세 주소"
                />
              </div>
              <div className={styles.formRow2}>
                <label>쿠폰</label>
                <select
                  name="coupon"
                  value={formData.coupon}
                  onChange={handleChange}
                >
                  <option value="">쿠폰을 선택하세요</option>
                  {renderCouponOption()}
                </select>
              </div>
            </form>
            {cartItems.length > 0 ? (
              <>
                <div className={styles.productList}>
                  {cartItems.map((item) => {
                    const discountedPrice = coupon ? calculateDiscountedPrice(item.price) : item.price; // 쿠폰이 선택된 경우에만 할인된 가격 적용
                    return (
                      <div key={item.usercartId} className={styles.productItem}>
                        <img
                          src={item.img || "../image/default.jpg"}
                          alt={item.name}
                          className={styles.productImage}
                        />
                        <div className={styles.productDetails}>
                          <div className={styles.productName}>{item.name}</div>
                          {item.size && (
                            <div className={styles.productSize}>
                              <span>Size: {item.size}</span>
                            </div>
                          )}
                          <div className={styles.productPrice}>
                            {discountedPrice !== item.price ? (
                              <>
                                <span className={styles.originalPrice}>
                                  KRW {item.price.toLocaleString()}
                                </span>
                                <span className={styles.itemCount}> x {item.count}</span>
                                <br />
                                <span className={styles.discountedPrice}>
                                  KRW {discountedPrice.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className={styles.finalPrice}>
                                  KRW {item.price.toLocaleString()}
                                </span>
                                <span className={styles.itemCount}> x {item.count}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.paymentContainer}>
                  <div className={styles.paymentSummary}>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>총 결제 금액:</span>
                      <span className={styles.summaryValue}>
                        KRW {getDiscountedTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button className={styles.payButton} onClick={handlePayment}>
                    결제하기
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.emptyPayment}>선택된 상품이 없습니다.</div>
            )}
          </>
        )}
        <div className={styles.bottomBar}></div>
        <Link to="/cart" className={styles.backLink}>
          Go Back to Cart
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
