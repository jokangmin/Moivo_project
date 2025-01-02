import React from 'react';
import { Link } from 'react-router-dom';
import admin_sidebar from '../../assets/css/admin_side.module.css';
import { useAuth } from '../../contexts/AuthContext';

const admins_side = () => {
  
  const { logout } = useAuth();  // AuthContext에서 제공하는 logout 함수

    // 로그아웃 함수
    const handleLogout = async () => {
      await logout();  // 로그아웃 처리 (내부에서 리디렉션 처리)
  };

    return (
        <div className={`${admin_sidebar.area}`}>
          <nav className={admin_sidebar.mainMenu}>
            <ul>
              {/* Dashboard */}
              <li>
                <Link to="/admins_dashboard">
                  <i className="fa fa-tachometer-alt fa-2x"></i>
                  <span className={admin_sidebar.navText}>Dashboard</span>
                </Link>
              </li>
    
              {/* Products */}
              <li className={admin_sidebar.hasSubnav}>
                <Link to="/admin/admin_productList">
                  <i className="fa fa-cube fa-2x"></i>
                  <span className={admin_sidebar.navText}>Products</span>
                </Link>
              </li>
    
              {/* Customers
              <li className={admin_sidebar.hasSubnav}>
                <a href="#">
                  <i className="fa fa-users fa-2x"></i>
                  <span className={admin_sidebar.navText}>Customers</span>
                </a>
              </li> */}
    
              {/* User Roles
              <li className={admin_sidebar.hasSubnav}>
                <a href="#">
                  <i className="fa fa-user fa-2x"></i>
                  <span className={admin_sidebar.navText}>User Roles</span>
                </a>
              </li> */}
    
              {/* FAQ */}
              <li>
                <Link to="/admins_FAQ">
                  <i className="fa fa-bullhorn fa-2x"></i>
                  <span className={admin_sidebar.navText}>FAQ</span>
                </Link>
              </li>
    
              {/* Reviews */}
              <li>
                <Link to="/admins_qnaboard">
                  <i className="fa fa-star fa-2x"></i>
                  <span className={admin_sidebar.navText}>QnA</span>
                </Link>
              </li>
            </ul>

            {/* logout */}
            <ul className={admin_sidebar.logout}>
              <li>
                <Link to="/" onClick={(e) => {
                    e.preventDefault();  // Link의 기본 동작을 막고
                    handleLogout();      // 로그아웃 함수 호출
                  }}
                  className={admin_sidebar.logoutItem}
                >
                  <i className="fa fa-sign-out-alt fa-2x"></i>
                  <span className={admin_sidebar.navText}>Logout</span>
                </Link>
              </li>
            </ul>      
          </nav>
        </div>
      );
    };
    

export default admins_side;