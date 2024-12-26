import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProListProvider } from './contexts/productCon/ProListContext';
import { ProDetailProvider } from './contexts/productCon/ProDetailContext';
import { ReviewProvider } from './contexts/reviewCon/ReviewContext';
import { MypageProvider } from './contexts/mypageCon/MypageContext';
import { MypageProfileProvider } from './contexts/mypageCon/MypageProfileContext';
import { MypageWishProvider } from './contexts/mypageCon/MypageWishContext';
import { MypageBoardProvider } from './contexts/mypageCon/MypageBoardContext';
import { MypageOrderProvider } from './contexts/mypageCon/MypageOrderContext';
import { MypageOrderDetailProvider } from './contexts/mypageCon/MypageOrderDetailContext';
import { CartProvider } from './contexts/cartCon/CartContext';
import DashBoardProvider from './contexts/DashBoardContext';
import PaymentProvider from './contexts/payment/PaymentContext';
import MainProvider from './contexts/MainContext';

const Main_index = React.lazy(() => import('./components/Main_index'));
const User_login = React.lazy(() => import('./containers/user/user_login'));
const User_signup = React.lazy(() => import('./containers/user/user_signup'));
const MypageMain = React.lazy(() => import('./containers/mypage/mypage_main'));
const MypageProfile = React.lazy(() => import('./containers/mypage/mypage_profile'));
const ProductBoard = React.lazy(() => import('./containers/product/product_board'));
const ProductList = React.lazy(() => import('./containers/product/product_list'));
const ProductDetail = React.lazy(() => import('./containers/product/product_detail'));
const Cart = React.lazy(() => import('./containers/cart/cart'));
const Payment = React.lazy(() => import('./containers/pay/payment'));

const PrivateRoute = ({ element }) => {
  const { currentUser } = useAuth();
  return currentUser ? element : <Navigate to="/user" />;
};

const routeConfig = [
  { path: '/', element: <Main_index /> },
  { path: '/user', element: <User_login /> },
  { path: '/user_signup', element: <User_signup /> },
  { path: '/mypage', element: <PrivateRoute element={<MypageMain />} /> },
  { path: '/mypage/profile', element: <PrivateRoute element={<MypageProfile />} /> },
  { path: '/product-board', element: <ProductBoard /> },
  { path: '/product-list', element: <ProductList /> },
  { path: '/product-detail/:productId', element: <ProductDetail /> },
  { path: '/cart', element: <Cart /> },
  { path: '/payment', element: <Payment /> },
];

const MainRoutes = () => (
  <Routes>
    {routeConfig.map(({ path, element }, index) => (
      <Route key={index} path={path} element={element} />
    ))}
  </Routes>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route
              path="/*"
              element={
                <MainProvider>
                  <DashBoardProvider>
                    <PaymentProvider>
                      <ProListProvider>
                        <ProDetailProvider>
                          <ReviewProvider>
                            <CartProvider>
                              <MypageProvider>
                                <MypageProfileProvider>
                                  <MypageWishProvider>
                                    <MypageBoardProvider>
                                      <MypageOrderProvider>
                                        <MypageOrderDetailProvider>
                                          <MainRoutes />
                                        </MypageOrderDetailProvider>
                                      </MypageOrderProvider>
                                    </MypageBoardProvider>
                                  </MypageWishProvider>
                                </MypageProfileProvider>
                              </MypageProvider>
                            </CartProvider>
                          </ReviewProvider>
                        </ProDetailProvider>
                      </ProListProvider>
                    </PaymentProvider>
                  </DashBoardProvider>
                </MainProvider>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
