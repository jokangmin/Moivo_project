import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../assets/css/Payment.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { PATH } from "../../../scripts/path";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const cartItems = location.state?.cartItems || [];
  const isCartItem = location.state?.isCartItem;
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.count,
    0
  );

  // 결제 정보
  const [paymentData, setPaymentData] = useState({ 
    userId: 0, // 사용자 id
    name: '', // 사용자 이름
    email: '', // 사용자 이메일
    tel: '', // 사용자 전화번호
    addr1: '', // 사용자 주소
    addr2: '',
    zipcode: '',
    totalPrice: 0, // 총 결제 금액
    discount: 0, // 할인 금액
    tosscode: '' // 토스 결제 번호
  });

  // 사용자 정보
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tel: "",
    zipcode: "",
    addr1: "",
    addr2: "",
    coupon: "",
  });
  const [coupons, setCoupons] = useState([]); // 쿠폰 리스트 상태 추가
  const [loading, setLoading] = useState(true);
  
  console.log(location.state);
  console.log(isCartItem);
  console.log(coupons);

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("accessToken");
    const id = localStorage.getItem("id");

    if (!token || !id) {
      alert("로그인이 필요합니다.");
      navigate("/user");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${PATH.SERVER}/api/user/mypage/info/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          // 서버에 받은 데이터 저장
          setFormData({
            name: data.name || "",
            email: data.email || "",
            tel: data.tel || "",
            zipcode: data.zipcode || "",
            addr1: data.addr1 || "",
            addr2: data.addr2 || "",
            coupon: "",
          });

          setCoupons(data.coupons || []); // 쿠폰 정보 설정
        }
        console.log(data);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      alert("사용자 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key, value) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

    const loadDaumPostcodeScript = () => {
      return new Promise((resolve) => {
          if (document.getElementById("daum-postcode-script")) {
              resolve();
              return;
          }

          const script = document.createElement("script");
          script.id = "daum-postcode-script";
          script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
          script.onload = resolve;
          document.body.appendChild(script);
      });
  };

  const handleFindPostalCode = async () => {
      try {
          await loadDaumPostcodeScript();

          new window.daum.Postcode({
              oncomplete: function (data) {
                  updateFormData("zipcode", data.zonecode);
                  updateFormData("addr1", data.roadAddress);
              },
          }).open();
      } catch (error) {
          console.error("우편번호 찾기 스크립트 로드 실패:", error);
          alert("우편번호 찾기 기능을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.");
      }
  };

// 결제 금액 계산 함수 (할인 반영)
const getDiscountedTotal = () => {
  if (!formData.coupon) return totalPrice;

  const selectedCoupon = coupons.find(coupon => coupon.couponName === formData.coupon);
  if (selectedCoupon) {
    const minOrderPrice = selectedCoupon.minOrderPrice || 0;

    // 총 결제 금액이 최소 금액 이상이어야 쿠폰 적용 가능
    if (totalPrice < minOrderPrice) {
      alert(`이 쿠폰은 최소 결제 금액인 ${minOrderPrice.toLocaleString()}원을 초과해야 사용 가능합니다.`);
      return totalPrice; // 할인 없이 원래 금액 반환
    }

    const discountAmount = (totalPrice * selectedCoupon.discountValue) / 100;
    return totalPrice - discountAmount;
  }
  return totalPrice;
};

  // 쿠폰 목록을 렌더링할 때 최소 주문 금액 표시 및 비활성화
  const renderCouponOptions = () => {
    return coupons.map((coupon) => {
      const minOrderPrice = coupon.minOrderPrice || 0;
      const isDisabled = totalPrice < minOrderPrice;

      return (
        <option key={coupon.id} value={coupon.couponName} disabled={isDisabled}>
          {coupon.couponName} ({coupon.discountValue}% 할인)
          {minOrderPrice > 0 && ` - 최소 주문 금액: KRW ${minOrderPrice.toLocaleString()}`}
        </option>
      );
    });
  };

// 상품별 할인된 가격 계산
const calculateDiscountedPrice = (price) => {
  if (!formData.coupon) return price; // 쿠폰 선택 안 된 경우 원래 가격 반환

  const selectedCoupon = coupons.find(coupon => coupon.couponName === formData.coupon);
  if (selectedCoupon) {
    const minOrderPrice = selectedCoupon.minOrderPrice || 0;

    // 총 결제 금액이 최소 금액 이상이어야 쿠폰 적용 가능
    if (totalPrice < minOrderPrice) {
      return price; // 할인 없이 원래 가격 반환
    }

    const discountValue = selectedCoupon.discountValue; // 할인율
    return price - (price * discountValue) / 100;
  }
  return price;
};

  useEffect(() => {
      console.log("Updated paymentData:", paymentData);
  }, [paymentData]);

  // 쿠폰 변경 시 결제 정보를 업데이트 - uj
  useEffect(() => {
    if (!formData.coupon) {
      setPaymentData((prevData) => ({
        ...prevData,
        discount: 0,
      }));
      return;
    }

    const selectedCoupon = coupons.find(coupon => coupon.couponName === formData.couponName);
    if (selectedCoupon) {
      const discountAmount = (totalPrice * selectedCoupon.discountValue) / 100;
      setPaymentData((prevData) => ({
        ...prevData,
        discount: discountAmount,
      }));
    }
  }, [formData.coupon, coupons, totalPrice]);


  // 결제 정보 전송
  const handlePayment = () => {
    if (!formData.name || !formData.tel || !formData.zipcode || !formData.addr1) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
  
    // 결제 데이터 업데이트
    const updatedPaymentData = {
      ...paymentData,
      name: formData.name,
      email: formData.email,
      tel: formData.tel,
      addr1: formData.addr1,
      addr2: formData.addr2,
      zipcode: formData.zipcode,
      totalPrice: getDiscountedTotal(), // 총 결제 금액 (할인 적용된 가격)
      discount: getDiscountedTotal() < totalPrice ? totalPrice - getDiscountedTotal() : 0, // 할인 금액 계산
    };
  
    // 각 상품에 대해 할인된 가격을 포함하여 새로운 배열을 만듭니다.
    const updatedCartItems = cartItems.map(item => {
      const discount = calculateDiscountedPrice(item.price);
      console.log(discount);
      return {
        ...item,
        discountedPrice: discount, // 할인된 가격 추가
      };
    });
  
    setPaymentData(updatedPaymentData);
    console.log(updatedPaymentData);
  
    // 결제 정보와 카트 정보를 state로 전달하면서 payment-method로 이동
    navigate("/payment-method", {
      state: {
        paymentData: updatedPaymentData, // 결제자 정보
        paymentDetailList: updatedCartItems, // 할인된 가격 포함된 상품 정보
        isCartItem: isCartItem,
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    console.log(isCartItem);
    
    fetchUserInfo();
  }, []);

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
                  {renderCouponOptions()}
                </select>
              </div>
            </form>
            {cartItems.length > 0 ? (
              <>
                <div className={styles.productList}>
                  {cartItems.map((item) => {
                    const discountedPrice = calculateDiscountedPrice(item.price);
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
