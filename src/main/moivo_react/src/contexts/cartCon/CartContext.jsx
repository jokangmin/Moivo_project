import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const CartContext = createContext();

export const useCartContext = () => useContext(CartContext);

const CartProvider = ({ children }) => {
    const navigate = useNavigate();
    const { isAuthenticated, getAccessToken } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userid, setUserid] = useState(null);
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    useEffect(() => {
      const fetchCartItems = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인이 필요합니다.");
          navigate("/user");
          return;
        }
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
  
    // 전체 선택 처리
    const handleSelectAll = () => {
      if (selectAllChecked) {
        setSelectedItems([]);
      } else {
        const allItemIds = cartItems.map(item => item.usercartId);
        setSelectedItems(allItemIds);
      }
      setSelectAllChecked(!selectAllChecked);
    };

    // selectAllChecked 상태를 selectedItems에 맞게 동기화
    useEffect(() => {
      if (cartItems.length > 0) {
        setSelectAllChecked(selectedItems.length === cartItems.length);
      }
    }, [selectedItems, cartItems.length]);

    // 상품 제거
    const handleRemoveItem = async (id) => {
      const token = getAccessToken(); // 토큰을 가져옵니다.
      console.log(id);
      if (!token) {
        alert("인증되지 않았습니다. 로그인 후 다시 시도해주세요.");
        return;
      }
  
      try {
        await axiosInstance.delete(`/api/user/cart/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        console.log("dddd");
        console.log(id);
        console.log(newCount);
        console.log(newSize);

      const item = cartItems.find((item) => item.usercartId === id);
      if (newCount > item.stockCount) {
        alert("재고를 초과할 수 없습니다.");
        return;
      }
      try {
        console.log("fdf");
        await axiosInstance.put(`/api/user/cart/update/${id}`, {
          count: newCount,
          size: newSize || item.size,
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

    const value = {
        cartItems,
        selectedItems,
        totalPrice,
        handleRemoveItem,
        handleUpdateItem,
        handleNavigateToPayment,
        setSelectedItems,
        setCartItems,
        selectAllChecked,
        handleSelectAll,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;
