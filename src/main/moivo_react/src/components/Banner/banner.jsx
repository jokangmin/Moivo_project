import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import styles from '../../assets/css/banner.module.css';
import mypageIcon from '../../assets/image/mypage.png'; 
import cartIcon from '../../assets/image/cart.png';


const Banner = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, tokenExpiration, isAdmin } = useContext(AuthContext);
  //2024-12-11 디버그 확인 장훈
  console.log('isAdmin:', isAdmin);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  useEffect(() => {
    console.log('현재 인증 상태:', isAuthenticated);
  }, [isAuthenticated]);

  const navLinks = [
    {
      title: 'SHOP', navigateTo : '/product-list',
      submenu: [
        { name: 'ALL', navigateTo: '/product-list' },
        { name: 'Dashboard', navigateTo: '/product-board' }
      ]
    },
    {
      title: 'COMMUNITY',
      submenu: [
        { name: '고객센터', navigateTo: '/qna_faqboard' },
        { name: '게시판', navigateTo: '/qna_board' },
      ]
    },
    ...(isAdmin ? [{
      title: 'ADMIN',
      submenu: [
        { name: 'DashBoard', navigateTo: '/admins_dashboard' },
      ]
    }] : [])
  ];

  const handleToggleMenu = (idx) => {
    setOpenMenuIndex(openMenuIndex === idx ? null : idx);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const formatExpiration = (expiration) => {
    if (!expiration) return '';
    return expiration.toLocaleString();
  };

  return (
    <>
      <header className={styles.banner}>
        <div className={styles.inner}>
          <h1 className={styles.logo}>
            <a className={styles.logoLink} onClick={() => navigate('/')}>
              Moivo
            </a>
          </h1>

          <nav className={styles.nav}>
            <ul className={styles.navList}>
              {navLinks.map((link, idx) => (
                <li key={idx} className={styles.navItem}>
                  <button className={styles.navLink} onClick={() => handleToggleMenu(idx)}>
                    {link.title}
                  </button>
                  {openMenuIndex === idx && (
                    <div className={styles.subMenu}>
                      {link.submenu.map((item, subIdx) => (
                        <a
                          key={subIdx}
                          className={styles.subLink}
                          onClick={() => navigate(item.navigateTo)}>
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.utility}>
            {isAuthenticated ? (
              <>
                <a 
                  onClick={(e) => {
                    e.preventDefault();  // 기본 동작 방지
                    navigate('/mypage');
                  }} 
                  className={styles.utilityLink}
                >
                  <span className={styles.text}>My Page</span>
                  <img src={mypageIcon} className={styles.iconImage} alt="mypage" />
                </a>
                <a 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/cart');
                  }} 
                  className={styles.utilityLink}
                >
                  <span className={styles.text}>Cart</span>
                  <img src={cartIcon} className={styles.iconImage} alt="cart" />
                </a>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <a 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/user');
                  }} 
                  className={styles.utilityLink2}
                >
                  Login
                </a>
                <a 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/user_signup');
                  }} 
                  className={styles.utilityLink2}
                >
                  Sign Up
                </a>
              </>
            )}

            <div className={styles.loginStatus}>
              <span>
                <span className={`${styles.status} ${isAuthenticated ? styles.on : styles.off}`}></span>
                {isAuthenticated ? 'ON' : 'OFF'}
              </span>
              {isAuthenticated && ( <span className={styles.expiration}>{formatExpiration(tokenExpiration)}</span> )}
            </div>

          </div>
        </div>
      </header>
    </>
  );
};

export default Banner;
