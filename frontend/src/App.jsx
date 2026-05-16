import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Customer pages
import MenuPage from './pages/customer/MenuPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import OrderStatusPage from './pages/customer/OrderStatusPage'
import PaymentPage from './pages/customer/PaymentPage'

// Staff pages
import LoginPage from './pages/staff/LoginPage'
import DashboardPage from './pages/staff/DashboardPage'
import OrdersPage from './pages/staff/OrdersPage'
import MenuManagementPage from './pages/staff/MenuManagementPage'
import IngredientsPage from './pages/staff/IngredientsPage'
import RecipesPage from './pages/staff/RecipesPage'
import ReportsPage from './pages/staff/ReportsPage'
import QRPage from './pages/staff/QRPage'

// Layout
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#ffffff',
            color: '#1a1a1a',
            border: '1px solid #f0f0f0',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
          },
        }}
      />
      <Routes>
        {/* Root redirects to Login for staff */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Customer routes - accessible via QR */}
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/order/:orderId" element={<OrderStatusPage />} />

        {/* Staff routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="ingredients" element={<IngredientsPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="qr" element={<QRPage />} />
        </Route>

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}
