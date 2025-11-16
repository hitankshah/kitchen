import React, { useContext, useEffect, useState } from 'react';
import './Profile.css';
import { StoreContext } from '../../Context/StoreContext';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Profile = () => {
  const { url, token } = useContext(StoreContext);
  const { user, userProfile, fetchProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || ''
      });
    }
  }, [userProfile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${url}/api/user/update-profile`,
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // Refetch the profile to get updated data
        if (user?.id) {
          fetchProfile(user.id);
        }
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <div className='profile-page'>
      <div className='profile-container'>
        <div className='profile-header'>
          <div className='profile-avatar'>
            {formData.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className='profile-header-info'>
            <h1>{formData.full_name || 'User'}</h1>
            <p>{formData.email}</p>
          </div>
        </div>

        <div className='profile-content'>
          <div className='profile-section'>
            <div className='section-header'>
              <h2>Personal Information</h2>
              {!isEditing ? (
                <button className='edit-btn' onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <div className='edit-actions'>
                  <button className='cancel-btn' onClick={handleCancel}>
                    Cancel
                  </button>
                  <button 
                    className='save-btn' 
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <form className='profile-form' onSubmit={handleSubmit}>
              <div className='form-row'>
                <div className='form-group'>
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type='text'
                      name='full_name'
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder='Enter your full name'
                      required
                    />
                  ) : (
                    <div className='form-value'>{formData.full_name || 'Not provided'}</div>
                  )}
                </div>

                <div className='form-group'>
                  <label>Email Address</label>
                  <div className='form-value'>{formData.email}</div>
                  <span className='form-note'>Email cannot be changed</span>
                </div>
              </div>

              <div className='form-row'>
                <div className='form-group'>
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type='tel'
                      name='phone'
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder='Enter your phone number'
                    />
                  ) : (
                    <div className='form-value'>{formData.phone || 'Not provided'}</div>
                  )}
                </div>

                <div className='form-group'>
                  <label>Member Since</label>
                  <div className='form-value'>
                    {userProfile?.created_at 
                      ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </div>
                </div>
              </div>

              <div className='form-group full-width'>
                <label>Delivery Address</label>
                {isEditing ? (
                  <textarea
                    name='address'
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder='Enter your delivery address'
                    rows='3'
                  />
                ) : (
                  <div className='form-value'>{formData.address || 'Not provided'}</div>
                )}
              </div>
            </form>
          </div>

          <div className='profile-stats'>
            <div className='stat-card'>
              <div className='stat-icon'>📦</div>
              <div className='stat-content'>
                <h3>Total Orders</h3>
                <p className='stat-value'>{userProfile?.total_orders || 0}</p>
              </div>
            </div>

            <div className='stat-card'>
              <div className='stat-icon'>💰</div>
              <div className='stat-content'>
                <h3>Total Spent</h3>
                <p className='stat-value'>₹{userProfile?.total_spent || 0}</p>
              </div>
            </div>

            <div className='stat-card'>
              <div className='stat-icon'>⭐</div>
              <div className='stat-content'>
                <h3>Member Status</h3>
                <p className='stat-value'>
                  {userProfile?.role === 'premium' ? 'Premium' : 'Regular'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
