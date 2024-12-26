import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import styles from "../../assets/css/Mypage_wish.module.css"; 
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";

const AdminProductTrash = () => {
  const [deletedProducts, setDeletedProducts] = useState([]); // 삭제된 상품 목록 상태 관리
  const [userid, setUserid] = useState(null); // 관리자의 사용자 ID

  useEffect(() => {
    const storedUserid = localStorage.getItem("id");
    setUserid(storedUserid);

    const fetchDeletedProducts = async () => {
      if (!storedUserid) return;
      try {
        const response = await axiosInstance.get(`${PATH.SERVER}/api/admin/store/trash`, {
          params: { userid },
        });
        console.log(response.data);  // 응답 데이터 확인
        if (Array.isArray(response.data)) {
          setDeletedProducts(response.data);
        } else {
          console.error("응답 데이터가 배열이 아닙니다.");
        }
      } catch (error) {
        console.error("삭제된 상품을 가져오는 데 실패했습니다:", error);
      }
    };

    fetchDeletedProducts();
  }, [userid]);

  // 상품 복구 처리
  const handleRestore = async (productId) => {
    if (!userid) return;
    try {
      await axiosInstance.post(`${PATH.SERVER}/api/admin/store/restore/${productId}`, {
        params: { userid },
      });
      setDeletedProducts((prevItems) =>
        prevItems.filter((item) => item.id !== productId)
      );
    } catch (error) {
      console.error("Failed to restore product:", error);
    }
  };

  return (
    <div className={styles.wishlistPage}>
      <Banner />
      <div className={styles.title}>TRASH</div>
      <div className={styles.container}>
        {deletedProducts.length > 0 ? (
          <div className={styles.wishlistContainer}>
            {deletedProducts.map((item) => (
              <div key={item.id} className={styles.wishlistItem}>
                <div className={styles.itemImage}>
                  <img src={item.img} alt={item.name} />
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemPrice}>{item.price}원</div>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRestore(item.id)}
                  >
                    복구
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyMessage}>복구할 상품이 없습니다.</div>
        )}
        <div className={styles.bottomBar}></div>
        <Link to="/admin/dashboard" className={styles.backLink}>
          Back to dashboard
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default AdminProductTrash;
