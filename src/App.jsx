import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar        from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Pets            from './pages/Pets';
import PetDetails      from './pages/PetDetails';
import MyRequests      from './pages/MyRequests';
import ShelterRequests from './pages/ShelterRequests';
import AddPet          from './pages/AddPet';
import MyDogs          from './pages/MyDogs';
import Chat            from './pages/Chat';
import Subscribe       from './pages/Subscribe';
import AuthCallback    from './pages/AuthCallback';
import AdminDashboard  from './pages/AdminDashboard';
import AdminDetail     from './pages/AdminDetail';
import Shop            from './pages/Shop';
import AddProduct      from './pages/AddProduct';
import Cart            from './pages/Cart';
import Orders          from './pages/Orders';
import { CartProvider } from './context/CartContext';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.2 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/"  element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/pets" element={<Pets mode="ngo" />} />
          <Route path="/marketplace" element={<Pets mode="marketplace" />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/admin/add-product" element={<ProtectedRoute role="ADMIN"><AddProduct /></ProtectedRoute>} />
          <Route path="/pets/:id" element={<ProtectedRoute><PetDetails /></ProtectedRoute>} />
          <Route path="/my-requests" element={<ProtectedRoute role="NORMAL_USER"><MyRequests /></ProtectedRoute>} />
          <Route path="/shelter-requests" element={<ProtectedRoute role="NGO_SHELTER"><ShelterRequests /></ProtectedRoute>} />
          <Route path="/add-pet" element={<ProtectedRoute role="NGO_SHELTER"><AddPet /></ProtectedRoute>} />
          <Route path="/my-dogs" element={<ProtectedRoute role="NGO_SHELTER"><MyDogs /></ProtectedRoute>} />
          <Route path="/seller/add-pet" element={<ProtectedRoute role="SELLER"><AddPet /></ProtectedRoute>} />
          <Route path="/seller/my-pets" element={<ProtectedRoute role="SELLER"><MyDogs /></ProtectedRoute>} />
          <Route path="/seller/requests" element={<ProtectedRoute role="SELLER"><ShelterRequests /></ProtectedRoute>} />
          <Route path="/chat/:requestId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/subscribe" element={<ProtectedRoute><Subscribe /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/detail/:metric" element={<ProtectedRoute role="ADMIN"><AdminDetail /></ProtectedRoute>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <AnimatedRoutes />
      </BrowserRouter>
    </CartProvider>
  );
}
