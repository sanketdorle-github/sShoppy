import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUserRole,
} from "./Redux/slices/userSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import UserLayout from "./layout/UserLayout";
import AdminLayout from "./layout/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected User Pages
import UserDashboard from "./pages/user/UserDashboard";
// import UserProfile from "./pages/user/UserProfile";
// import UserOrders from "./pages/user/UserOrders";

// Protected Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
// import AdminUsers from "./pages/admin/AdminUsers";
// import AdminOrders from "./pages/admin/AdminOrders";
// import AdminAnalytics from "./pages/admin/AdminAnalytics";
// import AdminSettings from "./pages/admin/AdminSettings";

// Protected Route Components
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ChatBox from "./components/ChatBox";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/user/Cart";
import CheckoutSuccess from "./pages/CheckoutSuccess";

const App = () => {
  return (
    <>
      <Routes>
        {/* Public Routes with User Layout */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="product/:productId" element={<ProductDetails />} />{" "}
        </Route>

        {/* Protected User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout/success" element={<CheckoutSuccess />} />{" "}
          {/* Optional */}
          {/* <Route path="profile" element={<UserProfile />} />
          <Route path="orders" element={<UserOrders />} /> */}
        </Route>

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          {/* <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} /> */}
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        // You can customize these props as needed
      />
      {/* ChatBox component */}
      <ChatBox />
    </>
  );
};

export default App;
