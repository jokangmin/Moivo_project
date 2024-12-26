import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PATH } from "../../../scripts/path";

const PaymentContext = createContext();
export const usePayment = () => useContext(PaymentContext);

const PaymentProvider = ({children}) => {
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
    const [coupon, setCoupon] = useState(null); // 단일 쿠폰
    const [loading, setLoading] = useState(true);
    
    console.log(location.state);
    console.log(isCartItem);
    console.log(coupon);

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

            setCoupon(data.coupon || null); // 단일 쿠폰 정보 설정
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
        // 쿠폰이 없거나 총 결제 금액이 0일 때 기본 가격 반환
        if (!coupon || totalPrice === 0 || !formData.coupon) {
            return totalPrice;
        }

        const minOrderPrice = coupon.minOrderPrice || 0;

        if (totalPrice < minOrderPrice) {
            alert(`이 쿠폰은 최소 결제 금액인 ${minOrderPrice.toLocaleString()}원을 초과해야 사용 가능합니다.`);
            return totalPrice;
        }

        const discountAmount = (totalPrice * coupon.discountValue) / 100;
        return totalPrice - discountAmount;
    };

    // 쿠폰 렌더링할 때 최소 주문 금액 표시 및 비활성화
    const renderCouponOption = () => {
        if (!coupon) return null; // 쿠폰 데이터가 없으면 렌더링하지 않음
    
        const minOrderPrice = coupon.minOrderPrice || 0;
        const isDisabled = totalPrice < minOrderPrice;
    
        // 이미 사용한 쿠폰인지, 유효기간이 지난 쿠폰인지 체크
        const isUsedOrExpired = coupon.couponName === "이미 사용한 쿠폰입니다." || coupon.couponName === "유효기간이 지난 쿠폰입니다.";
    
        // 쿠폰이 이미 사용되었거나 유효기간이 지난 경우 비활성화
        const disabled = isDisabled || isUsedOrExpired;
    
        return (
            <option value={coupon.couponName} disabled={disabled}>
                {coupon.couponName} ({coupon.discountValue}% 할인)
                {minOrderPrice > 0 && ` - 최소 주문 금액: KRW ${minOrderPrice.toLocaleString()}`}
            </option>
        );
    };


    // 상품별 할인된 가격 계산
    const calculateDiscountedPrice = (price) => {
        // 쿠폰이 없거나 총 결제 금액이 0일 때 기본 가격 반환
        if (!coupon || totalPrice === 0 || !formData.coupon) {
            return price; 
        }
        
        const minOrderPrice = coupon.minOrderPrice || 0;

        if (totalPrice < minOrderPrice) {
            return price; // 최소 주문 금액 미만일 경우 할인 적용 안 함
        }

        return price - (price * coupon.discountValue) / 100;
    };


    // 쿠폰 변경 시 결제 정보를 업데이트
    useEffect(() => {
        if (!formData.coupon) {
            setPaymentData((prevData) => ({
                ...prevData,
                discount: 0,
            }));
            return;
        }

        // 쿠폰 정보 사용
        const selectedCoupon = coupon; // formData.coupon이 아니라 coupon 상태 사용
        if (selectedCoupon) {
            const discountAmount = (totalPrice * selectedCoupon.discountValue) / 100;
            setPaymentData((prevData) => ({
                ...prevData,
                discount: discountAmount,
            }));
        }
    }, [formData.coupon, totalPrice, coupon]); 


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
            totalPrice: getDiscountedTotal(), // 할인된 총 결제 금액
            discount: getDiscountedTotal() < totalPrice ? totalPrice - getDiscountedTotal() : 0, // 할인 금액 계산
        };
    
        // 각 상품에 대해 할인된 가격을 포함하여 새로운 배열을 만듭니다.
        const updatedCartItems = cartItems.map(item => {
            const discount = calculateDiscountedPrice(item.price);
            return {
                ...item,
                discountedPrice: discount, // 할인된 가격 추가
            };
        });
    
        setPaymentData(updatedPaymentData);
    
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
    
        if (name === "coupon") {
            // 선택된 쿠폰 이름을 formData에 저장
            setFormData({ ...formData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    useEffect(() => {
        console.log(isCartItem);
        
        fetchUserInfo();
    }, []);

    return (
        <PaymentContext.Provider
            value={{
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
            }}
        >
            {children}
        </PaymentContext.Provider>
    );
};

export default PaymentProvider;