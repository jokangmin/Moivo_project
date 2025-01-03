/* eslint-disable no-unused-vars */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProListProvider } from './contexts/productCon/ProListContext';
import { ProDetailProvider } from './contexts/productCon/ProDetailContext';
import { ReviewProvider } from './contexts/reviewCon/ReviewContext';
import QnaBoardProvider from './contexts/qna/QnaBoardContext';
import QnaFaqBoardProvider from './contexts/qna/QnaFaqBoardContext';
import QnaBoardListProvider from './contexts/qna/QnaBoardListContext';
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
import KakaoCallback from './components/kakao/KakaoCallback.jsx';
import Admins_FAQ from './containers/admin/admins_FAQ';
import Admins_ProductList from './containers/admin/admin_productList';
import ReviewWrite from './containers/review/review_write';
import DashBoardProvider from './contexts/DashBoardContext';
import PaymentProvider from './contexts/payment/PaymentContext';
import MypageProvider from './contexts/mypageCon/MypageContext';
import MypageProfileProvider from './contexts/mypageCon/MypageProfileContext';
import MypageWishProvider from './contexts/mypageCon/MypageWishContext';
import MypageBoardProvider from './contexts/mypageCon/MypageBoardContext';
import MypageOrderProvider from './contexts/mypageCon/MypageOrderContext';
import MypageOrderDetailProvider from './contexts/mypageCon/MypageOrderDetailContext';
import CartProvider from './contexts/cartCon/CartContext';
import AdminsBoardProvider from './contexts/adminsCon/AdminsBoardContext';



const routeConfig = [
  { path: "/", element: <Main_index /> },
  { path: "/user", element: <User_login /> },
  { path: "/user_signup", element: <User_signup /> },
  { 
    path: "/product-board", 
    element: (
      <DashBoardProvider>
        <ProductBoard />
      </DashBoardProvider>
    ),
  },
  { 
    path: "/product-list", 
    element: (
      <ProListProvider>
        <ProductList />
      </ProListProvider>
    ),
  },
  { 
    path: "/product-detail/:productId", 
    element: (
      <ProDetailProvider>
        <ProductDetail />
      </ProDetailProvider>
    ),
  },
  { 
    path: "/review/write", 
    element: (
      <ReviewProvider>
        <ReviewWrite />
      </ReviewProvider>
    ),
  },
  { path: "/upload", element: <Upload /> },
  { path: "/update", element: <Update /> },
  { path: "/mypage", element: (<MypageProvider><MypageMain /></MypageProvider>) },
  { path: "/mypage/profile", element: (<MypageProfileProvider><MypageProfile /></MypageProfileProvider>) },
  { path: "/mypage/wish", element: (<MypageWishProvider><MypageWish /></MypageWishProvider>) },
  { path: "/mypage/board", element: (<MypageBoardProvider><MypageBoard /></MypageBoardProvider>) },
  { path: "/mypage/order", element: (<MypageOrderProvider><MypageOrder /></MypageOrderProvider>) },
  { path: "/mypage/orderDetails", element: (<MypageOrderDetailProvider><MypageOrderDetails /></MypageOrderDetailProvider>) },
  { path: '/qna_faqboard', element: (<QnaFaqBoardProvider><Qna_faqboard /></QnaFaqBoardProvider>) },
  { path: '/qna_board', element: (<QnaBoardProvider><Qna_board /></QnaBoardProvider>) },
  { path: '/qna_boardlist', element: (<QnaBoardListProvider><Qna_boardlist /></QnaBoardListProvider>) },
  { path: "/cart", element: (<CartProvider><Cart /></CartProvider>) },
  { path: "/payment", element: ( <PaymentProvider> <Payment /> </PaymentProvider> ),},
  { path: "/payment-method", element: ( <PaymentProvider> <PaymentMethod /> </PaymentProvider> ),},
  { path: "/payment-success", element: ( <PaymentProvider> <SuccessPage /> </PaymentProvider> ),},
  { path: "/payment-fail", element: ( <PaymentProvider> <FailPage /> </PaymentProvider> ),},
  { path: "/admins_dashboard", element: ( <DashBoardProvider> <Dashboard/> </DashBoardProvider> )},
  { path: "/api/oauth/kakao/callback", element: <KakaoCallback /> },
  { path: "/admins_qnaboard", element: (
    <AdminsBoardProvider>
      <Admins_qna />
    </AdminsBoardProvider>
  ) },
  { path: "/admins_productadd", element: <Admins_productAdd /> },
  { path: "/admins_productupdate/:productId", element: <Admins_productUpdate /> },
  { path: "/admin/admin_productTrash", element: <ProductTrash /> },
  { path: "/admin/admin_productList", element: <Admins_ProductList /> },
  { path: "/oauth2/callback/kakao", element: <KakaoCallback /> },
  { path: "/admins_FAQ", element: <Admins_FAQ /> },

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