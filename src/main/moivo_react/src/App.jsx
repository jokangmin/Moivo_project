import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Main_index from './components/Main_index';
import User_login from './containers/user/user_login';
import User_signup from './containers/user/user_signup';
import ProductBoard from './containers/product/product_board'; 
import ProductList from './containers/product/product_list';
import ProductDetail from './containers/product/product_detail';
import ProductOrder from './containers/product/product_order';
import SuccessPage from './containers/product/product_order_success';
import FailPage from './containers/product/product_order_fail';
import Qna_faqboard from './containers/qna/qna_faqboard';
import Qna_board from './containers/qna/qna_board';
import Qna_boardlist from './containers/qna/qna_bardlist';
import MainProvider from './contexts/MainContext';
import Upload from './containers/test/upload';
import Update from './containers/test/update';
import MypageMain from './containers/mypage/mypage_main';
import MypageWish from './containers/mypage/mypage_wish';
import MypageBoard from './containers/mypage/mypage_board';
import MypageOrder from './containers/mypage/mypage_order';
import MypageOrderDetails from './containers/mypage/mypage_orderDetails';
import MypageProfile from './containers/mypage/mypage_profile';
import Cart from './containers/cart/cart';
import Payment from './containers/pay/payment';
import Dashboard from './containers/admin/admins_dashboard';

const routeConfig = [
  { path: "/", element: <Main_index /> },
  { path: "/user", element: <User_login /> },
  { path: "/user_signup", element: <User_signup /> },
  { path: "/product-board", element: <ProductBoard /> },
  { path: "/product-list", element: <ProductList /> },
  { path: "/product-detail/:productId", element: <ProductDetail /> },
  { path: "/product-order", element: <ProductOrder /> },
  { path: "/product-order-success", element: <SuccessPage /> },
  { path: "/product-order-fail", element: <FailPage /> },
  { path: "/upload", element: <Upload /> },
  { path: "/update", element: <Update /> },
  { path: "/mypage", element: <MypageMain /> },
  { path: "/mypage/profile", element: <MypageProfile /> },
  { path: "/mypage/wish", element: <MypageWish /> },
  { path: "/mypage/board", element: <MypageBoard /> },
  { path: "/mypage/order", element: <MypageOrder /> },
  { path: "/mypage/orderDetails", element: <MypageOrderDetails /> },
  { path: "/qna_faqboard", element: <Qna_faqboard /> },
  { path: "/qna_board", element: <Qna_board /> },
  { path: "/qna_boardlist", element: <Qna_boardlist /> },
  { path: "/cart", element: <Cart /> },
  { path: "/payment", element: <Payment /> },
  { path : "/admins_dashboard", element: <Dashboard/>}
];

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {routeConfig.map(({ path, element }, index) => (
            <Route key={index} path={path} element={element} />
          ))}
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
