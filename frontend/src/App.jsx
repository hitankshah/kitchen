import React, { useState } from 'react'
import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Cart from './pages/Cart/Cart'
import LoginPopup from './components/LoginPopup/LoginPopup'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import Profile from './pages/Profile/Profile'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify'
import { AuthProvider } from './Context/AuthContext'

const App = () => {

  const [showLogin, setShowLogin] = useState(false);

  return (
    <AuthProvider>
      <>
        <ToastContainer />
        {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
        <div className='app'>
          <Navbar setShowLogin={setShowLogin} />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/order' element={<PlaceOrder />} />
            <Route path='/myorders' element={<MyOrders />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/verify' element={<Verify />} />
          </Routes>
        </div>
      </>
    </AuthProvider>
  )
}

export default App
