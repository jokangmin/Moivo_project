import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Main_index from './components/Main_index';
import MainProvider from './contexts/MainContext';
import User_login from './containers/user/user_login';
import User_signup from './containers/user/user_signup';
import ProductBoard from './containers/product/product_board'; 
import ProductList from './containers/product/product_list';
import ProductDetail from './containers/product/product_detail';
import Qna_faqboard from './containers/qna/qna_faqboard';
import Qna_board from './containers/qna/qna_board';
import Qna_boardlist from './containers/qna/qna_boardlist';
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
import PaymentMethod from './containers/pay/payment-method';
import SuccessPage from './containers/pay/payment-success';
import FailPage from './containers/pay/payment-fail';
import Dashboard from './containers/admin/admins_dashboard';
import Admins_qna from './containers/admin/admins_qnaboard';
import Admins_productAdd from './containers/admin/admins_productadd';
import Admins_productUpdate from './containers/admin/admins_productupdate';
import ProductTrash from './containers/admin/admin_productTrash';
import KakaoCallback from './components/kakao/KakaoCallback';
import Admins_FAQ from './containers/admin/admins_FAQ';
import Admins_ProductList from './containers/admin/admin_productList';
import ReviewWrite from './containers/review/review_write';



const routeConfig = [
  { path: "/", element: <Main_index /> },
  { path: "/user", element: <User_login /> },
  { path: "/user_signup", element: <User_signup /> },
  { path: "/product-board", element: <ProductBoard /> },
  { path: "/product-list", element: <ProductList /> },
  { path: "/product-detail/:productId", element: <ProductDetail /> },
  { path: "/review/write", element: <ReviewWrite /> },
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
  { path: "/payment-method", element: <PaymentMethod /> },
  { path: "/payment-success", element: <SuccessPage /> },
  { path: "/payment-fail", element: <FailPage /> },
  { path : "/admins_dashboard", element: <Dashboard/>},
  { path: "/api/oauth/kakao/callback", element: <KakaoCallback /> },
  { path : "/admins_qnaboard", element: <Admins_qna/>},
  { path : "/admins_productadd", element: <Admins_productAdd/>},
  { path : "/admins_productupdate/:productId", element: <Admins_productUpdate/>},
  { path : "/admin/admin_productTrash", element: <ProductTrash/>},
  { path : "/admin/admin_productList", element: <Admins_ProductList/>},
  { path: "/oauth2/callback/kakao", element: <KakaoCallback /> },
  { path: "/admins_FAQ", element: <Admins_FAQ /> }

];

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <MainProvider>
          <Routes>
            {routeConfig.map(({ path, element }, index) => (
              <Route key={index} path={path} element={element} />
            ))}
          </Routes>
        </MainProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
