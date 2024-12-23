import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import styles from '../../assets/css/banner.module.css';
import mypageIcon from '../../assets/image/mypage.png'; 
import cartIcon from '../../assets/image/cart.png';

const Banner = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, tokenExpiration, isAdmin } = useContext(AuthContext);

  // 메뉴 상태 관리
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // 서브메뉴 열기/닫기 상태
  const [navOpen, setNavOpen] = useState(false); // 햄버거 메뉴 상태

  // 햄버거 메뉴 토글
  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  // 인증 상태 디버그
  useEffect(() => {
    console.log('현재 인증 상태:', isAuthenticated);
  }, [isAuthenticated]);

  // 네비게이션 링크 데이터
  const navLinks = [
    {
      title: 'SHOP',
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
    ...(isAdmin ? [
      {
        title: 'ADMIN',
        submenu: [
          { name: 'DashBoard', navigateTo: '/admins_dashboard' },
        ]
      }
    ] : [])
  ];

  // 서브메뉴 토글
  const handleToggleMenu = (idx) => {
    setOpenMenuIndex(openMenuIndex === idx ? null : idx);
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 토큰 만료 시간 포맷
  const formatExpiration = (expiration) => {
    if (!expiration) return '';
    return expiration.toLocaleString();
  };

  return (
    <header className={styles.banner}>
      <div className={styles.inner}>
        {/* 로고 */}
        <h1 className={styles.logo}>
          <a className={styles.logoLink} onClick={() => navigate('/')}>
            Moivo
          </a>
        </h1>

        {/* 햄버거 메뉴 버튼 (모바일) */}
        <div className={styles.hamburger} onClick={toggleNav}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* 네비게이션 */}
        <nav className={`${styles.nav} ${navOpen ? styles.active : ''}`}>
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
                        onClick={() => navigate(item.navigateTo)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* 유틸리티 링크 */}
        <div className={styles.utility}>
          {isAuthenticated ? (
            <>
              <a 
                onClick={(e) => {
                  e.preventDefault();
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
          {/* 로그인 상태 */}
          <div className={styles.loginStatus}>
            <span>
              <span className={`${styles.status} ${isAuthenticated ? styles.on : styles.off}`}></span>
              {isAuthenticated ? 'ON' : 'OFF'}
            </span>
            {isAuthenticated && (
              <span className={styles.expiration}>
                {formatExpiration(tokenExpiration)}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Banner;
