import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import DrinkDetail from './pages/DrinkDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import PaymentMock from './pages/PaymentMock.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminMenu from './pages/admin/AdminMenu.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';

export default function App() {
  return (
    <Routes>
      {/* Khu khách hàng */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="menu/:id" element={<DrinkDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders/:id" element={<OrderTracking />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Cổng thanh toán giả lập (không có header/footer của cửa hàng) */}
      <Route path="payment/mock" element={<PaymentMock />} />

      {/* Khu quản trị */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="menu" element={<AdminMenu />} />
      </Route>
    </Routes>
  );
}
