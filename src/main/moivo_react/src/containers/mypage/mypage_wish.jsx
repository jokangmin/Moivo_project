import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import styles from "../../assets/css/Mypage_wish.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { PATH } from '../../../scripts/path';

const MypageWish = () => {
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
  
  return (
    <div>
      <div className={styles.wishlistPage}>
        <Banner />
        <div className={styles.title}>WISHLIST</div>
        <div className={styles.container}>
        {wishlistItems.length > 0 ? (
            <div className={styles.wishlistContainer}>
              {wishlistItems.map((item) => (
                <div key={item.id} className={styles.wishlistItem}>
                  <div className={styles.itemImage}>
                    <img src={item.img} alt={item.name} />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemPrice}>{item.price}원</div>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyMessage}>Your wishlist is empty.</div>
          )}
          <div className={styles.bottomBar}></div>
            <Link to="/mypage" className={styles.backLink}>
              Go Back to MyPage
            </Link>
          </div>

      </div>
      <Footer />
    </div>
  );
};

export default MypageWish;