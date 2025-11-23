import React, { useContext, useEffect, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import { useAuth } from '../../Context/AuthContext'

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const [localToken, setLocalToken] = useState(localStorage.getItem("token") || "");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  // Watch for token changes in both StoreContext and localStorage
  useEffect(() => {
    // Update local token when StoreContext token changes
    if (token) {
      setLocalToken(token);
    } else {
      // Check localStorage in case token was set there but not yet in context
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setLocalToken(storedToken);
        setToken(storedToken);
      } else {
        setLocalToken("");
      }
    }
  }, [token, setToken]);

  // Also check for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      if (newToken && newToken !== localToken) {
        setLocalToken(newToken);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [localToken]);

  const logout = async () => {
    try {
      await signOut();
      localStorage.removeItem("token");
      localStorage.removeItem("supabase_authenticated");
      setToken("");
      navigate('/')
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <div className='navbar'>
      <Link to='/' className='logo-text'>Bhojanalay Cloud Kitchen</Link>
      <ul className="navbar-menu">
        <li><Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link></li>
        <li><a href='#food-display' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>Menu</a></li>
      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />
        <Link to='/cart' className='navbar-search-icon'>
          <img src={assets.basket_icon} alt="" />
          <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
        </Link>
        {!token && !user && !localToken ? <button onClick={() => setShowLogin(true)}>sign in</button>
          : <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" />
            <ul className='navbar-profile-dropdown'>
              <li className='user-info-header'>
                <p style={{ margin: 0, fontWeight: "600" }}>{userProfile?.full_name || user?.email || 'User'}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{userProfile?.email || user?.email}</p>
              </li>
              <hr />
              <li onClick={()=>navigate('/profile')}> <img src={assets.profile_icon} alt="" /> <p>Profile</p></li>
              <hr />
              <li onClick={()=>navigate('/myorders')}> <img src={assets.bag_icon} alt="" /> <p>Orders</p></li>
              <hr />
              <li onClick={logout}> <img src={assets.logout_icon} alt="" /> <p>Logout</p></li> 
            </ul>
          </div>
        }

      </div>
    </div>
  )
}

export default Navbar
