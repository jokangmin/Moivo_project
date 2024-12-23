import styles from "../../assets/css/Cart.module.css";
import Banner from "../../components/Banner/banner";
import Footer from "../../components/Footer/Footer";
import { useCartContext } from "../../contexts/cartCon/CartContext";

const Cart = () => {
  const {
    cartItems,
    selectedItems,
    totalPrice,
    handleRemoveItem,
    handleUpdateItem,
    handleNavigateToPayment,
    setSelectedItems,
    setCartItems,
  } = useCartContext();

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