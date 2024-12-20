import React from 'react';
import { Link } from 'react-router-dom';
import admin_sidebar from '../../assets/css/admin_side.module.css';

const admins_side = () => {
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
                  <span className={admin_sidebar.navText}>Reviews</span>
                </Link>
              </li>
            </ul>
    
            {/* home */}
            <ul className={admin_sidebar.logout}>
              <li>
                <Link to="/">
                  <i className="fa fa-home fa-2x"></i>
                  <span className={admin_sidebar.navText}>home</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      );
    };
    

export default admins_side;