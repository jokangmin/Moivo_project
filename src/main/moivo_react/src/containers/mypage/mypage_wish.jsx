import React from "react";
import { Link } from "react-router-dom";
import styles from "../../assets/css/Mypage_wish.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { useMypageWishContext } from "../../contexts/mypageCon/MypageWishContext";

const MypageWish = () => {
  const {
    wishlistItems,
    handleRemove,
  } = useMypageWishContext();
  
  return (
    <div className={styles.wishlistMain}>
      <div className={styles.wishlistPage}>
        <Banner />
        <div className={styles.title}>WISHLIST</div>
        <div className={styles.container}>
        {wishlistItems.length > 0 ? (
            <div className={styles.wishlistContainer}>
              {wishlistItems.map((item) => (
                <div key={item.id} className={styles.wishlistItem}>
                  <Link to={`/product-detail/${item.id}`} className={styles.orderLink}>
                    <div className={styles.itemImage}>
                      <img src={item.img} alt={item.name} />
                    </div>
                  </Link>
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