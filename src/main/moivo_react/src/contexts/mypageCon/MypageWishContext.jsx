import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from "../../utils/axiosConfig";
import { PATH } from '../../../scripts/path';

const MypageWishContext = createContext();

export const useMypageWishContext = () => useContext(MypageWishContext);

const MypageWishProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]); // 상태로 찜 목록 관리
    const [userid, setUserid] = useState(null);
    console.log(userid);
  
    // 찜 목록 가져오기
    useEffect(() => {
      const token = localStorage.getItem("accessToken");
      const storedUserid = localStorage.getItem("id"); // localStorage에서 가져옴
      console.log(storedUserid);
      setUserid(storedUserid); // 상태로 설정
  
      const fetchWishlist = async () => {
        if (!storedUserid) return;
        try {
          const response = await axiosInstance.get(`${PATH.SERVER}/api/user/wish/list`, {
            headers: {
              Authorization: `Bearer ${token}`, // Bearer 토큰 포함
            },
            params: { userid },
          });
          const wishlist = response.data.wishlist || []; //서버에서 받은 데이터 저장
          
          // wishlist 안에서 product 정보를 추출하여 상태에 저장
          const formattedWishlist = wishlist.map(item => item.product);
          setWishlistItems(formattedWishlist);
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
        }
      };
      fetchWishlist();
    }, [userid]); 
    console.log(wishlistItems);
  
  
     // 찜 목록에서 삭제
     const handleRemove = async (productId) => {
      if (!userid) return;
      console.log("productId = " + productId);
      console.log("userId = " + userid);
  
      try {
        await axiosInstance.delete(`${PATH.SERVER}/api/user/wish/delete/${productId}`, {
          params: { userid }, //userid는 쿼리 파라미터로 전달
        });
        // 삭제 성공 시 상태 업데이트하기
        setWishlistItems((prevItems) =>
          // filter 메서드 이용해서 productId가 일치하는 항목 제거하기
          prevItems.filter((item) => item.id !== productId)
        );
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    };

    const value = {
        wishlistItems,
        handleRemove,
      };

    return (
        <MypageWishContext.Provider value={value}>
            {children}
        </MypageWishContext.Provider>
    );
};

export default MypageWishProvider;