import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../../assets/css/Cart.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../utils/axiosConfig";
import { PATH } from "../../../scripts/path";

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userid, setUserid] = useState(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axiosInstance.get(`/api/user/cart/list`);
        
        console.log("전체 응답:", response);
        console.log("응답 데이터:", response.data);
        console.log("장바구니 아이템:", response.data.cartItems);
        
        if (!response.data.cartItems) {
          console.log("장바구니 아이템이 없거나 형식이 잘못되었습니다.");
          setCartItems([]);
          return;
        }
        
        const mappedItems = response.data.cartItems.map(item => ({
          usercartId: item.id,
          productId: item.productDTO.id,
          name: item.productDTO.name,
          price: item.productDTO.price,
          img: item.productDTO.img,
          content: item.productDTO.content,
          size: item.size,
          count: item.count,
          stockCount: item.stockCount,
          soldOut: item.soldOut
        }));
        
        console.log("매핑된 아이템:", mappedItems);
        setCartItems(mappedItems);
      } catch (error) {
        console.error("장바구니 조회 에러:", error);
        console.error("에러 상세:", error.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [isAuthenticated, navigate]);

  // 상품 제거
  const handleRemoveItem = async (id) => {
    if (!userid) return;
    const token = getAccessToken(); // 토큰을 가져옵니다.
    console.log(id);
    if (!token) {
      alert("인증되지 않았습니다. 로그인 후 다시 시도해주세요.");
      return;
    }

    try {
      await axiosInstance.delete(`${PATH.SERVER}/api/user/cart/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { userid },
      });

      
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
      console.log(`${id} 상품 삭제 성공`);
      // 상품 삭제 후 상태 업데이트 (필터링된 항목으로 상태 변경)
      setCartItems((prevItems) => prevItems.filter((item) => item.usercartId !== id));
      // 선택된 항목 리스트에서 제거
      setSelectedItems((prevSelected) => prevSelected.filter((selectedId) => selectedId !== id));

    } catch (error) {
      console.error("Error removing item:", error);
      if (error.response?.status === 401) {
        alert("인증이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
      } else {
        alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  // 상품 업데이트
  const handleUpdateItem = async (id, newCount, newSize) => {
    if (!userid) return;
    const item = cartItems.find((item) => item.usercartId === id);
    if (newCount > item.stockCount) {
      alert("재고를 초과할 수 없습니다.");
      return;
    }
    try {
      await axiosInstance.put(`${PATH.SERVER}/api/user/cart/update/${id}`, {
        count: newCount,
        size: newSize || item.size,
        userid
      });
      
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.usercartId === id
            ? { ...item, count: newCount, size: newSize || item.size }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating item:", error);
      alert("상품 업데이트에 실패했습니다.");
    }
  };

  // 선택된 상품의 총 가격 계산
  const totalPrice = cartItems
    .filter((item) => selectedItems.includes(item.usercartId))
    .reduce((total, item) => total + item.price * item.count, 0);

  // 결제 페이지로 이동
  const handleNavigateToPayment = () => {
    if (selectedItems.length === 0) {
      alert("상품을 선택해주세요.");
      return; // 아무것도 선택되지 않으면 함수 종료
    }

    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(item.usercartId)
    );
    navigate("/payment", { state: { cartItems: selectedCartItems, isCartItem: true } });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Banner />
      <div className={styles.cartFrame}>
        <div className={styles.title}>CART</div>
        {cartItems.length > 0 ? (
          <div className={styles.cartContainer}>
            {cartItems.map((item) => (
              <div key={item.usercartId} className={styles.cartItem}>
                {/* 품절 상품 체크 불가 */}
                <input
                  type="checkbox"
                  id={`${item.usercartId}`}
                  checked={selectedItems.includes(item.usercartId)}
                  disabled={item.soldOut} // 품절 상태일 때 체크박스를 비활성화
                  onChange={() =>
                    setSelectedItems((prev) =>
                      prev.includes(item.usercartId)
                        ? prev.filter((id) => id !== item.usercartId)
                        : [...prev, item.usercartId]
                    )
                  }
                />
                <label htmlFor={`${item.usercartId}`}></label>
                <div className={styles.productImage}>
                  <img src={item.img || "../image/default.jpg"} alt={item.name} />
                </div>
                <div className={styles.productDetails}>
                  <div className={styles.productName}>{item.name}</div>
                  <div className={styles.productContent}>{item.content}</div>
                  <div className={styles.productPrice}>
                    KRW {item.price.toLocaleString()}
                  </div>
                  {item.soldOut && (
                    <div className={styles.soldOutMessage}>품절된 상품입니다.</div>
                  )}
                  {!item.soldOut ? (
                    <div className={styles.sizeSelector}>
                      <select
                        id={`size-select-${item.usercartId}`}
                        value={item.size}
                        onChange={(e) =>
                          handleUpdateItem(item.usercartId, item.count, e.target.value)
                        }
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                      </select>
                      <button
                        onClick={() => {
                          if (item.count > 1) handleUpdateItem(item.usercartId, item.count - 1, null);
                        }}
                      >
                        -
                      </button>
                      <span>{item.count}</span>
                      <button
                        onClick={() => {
                          if (item.count < item.stockCount) {
                            handleUpdateItem(item.usercartId, item.count + 1, null);
                          } else {
                            alert("재고를 초과할 수 없습니다.");
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div>변경할 수 없습니다.</div>
                  )}
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveItem(item.usercartId)}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))}
            <div className={styles.totalSection}>
              <div className={styles.totalText}>
                Selected Total: KRW {totalPrice.toLocaleString()}
              </div>
              <button
                className={styles.checkoutButton}
                onClick={handleNavigateToPayment}
              >
                BUY NOW
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyCart}>Your cart is empty.</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;