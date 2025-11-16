import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Navbar = () => {
  const { user, signOut, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className='navbar'>
      <div className='navbar-left'>
        <h1 className='logo-text'>Bhojanalay Cloud Kitchen</h1>
        <h2 className='navbar-title'>Admin Panel</h2>
      </div>
      <div className='navbar-right'>
        {user && (
          <>
            <div className='user-info'>
              <span className='user-email'>{userProfile?.email || user.email}</span>
              <span className='user-role'>{userProfile?.role || 'Admin'}</span>
            </div>
            <button className='logout-btn' onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar
