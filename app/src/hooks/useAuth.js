import { useState } from 'react';
import { loginUser, getUserProfile, updateUserProfile } from '../services/api';

export function useAuth(apiBase, showToastMsg) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');

  const handleOpenProfile = () => {
    if (token) {
      setShowProfileModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLoginSuccess = async (newToken, userData) => {
    setToken(newToken);
    try {
      const profData = await getUserProfile(apiBase, newToken);
      if (profData.success) {
        setUser(profData.data);
      } else if (userData) {
        setUser(userData.user || userData);
      }
    } catch (e) {
      console.log('Error fetching user profile:', e);
      if (userData) {
        setUser(userData.user || userData);
      }
    }
  };

  const handleLogout = (resetCart, resetOrders, resetAddresses) => {
    setToken('');
    setUser(null);
    if (resetCart) resetCart();
    if (resetOrders) resetOrders();
    if (resetAddresses) resetAddresses();
    setShowProfileModal(false);
    setShowAuthModal(true);
    if (showToastMsg) showToastMsg('Logged out successfully');
  };

  const autoLogin = async () => {
    try {
      const data = await loginUser(apiBase, 'john@gmail.com', 'user123');
      if (data.success) {
        const authToken = data.data.token;
        setToken(authToken);
        const profData = await getUserProfile(apiBase, authToken);
        if (profData.success) {
          setUser(profData.data);
        }
      }
    } catch (err) {
      console.log(`Could not auto-login to backend (${apiBase}):`, err);
    }
  };

  const handleUpdateMobileProfile = async () => {
    if (!token) return;
    try {
      const data = await updateUserProfile(apiBase, token, { 
        name: nameInput, 
        email: emailInput, 
        mobile: mobileInput 
      });
      if (data.success) {
        setUser(data.data);
        if (showToastMsg) showToastMsg('Profile details updated!');
      } else {
        if (showToastMsg) showToastMsg(data.message || 'Failed to update profile');
      }
    } catch (err) {
      if (showToastMsg) showToastMsg('Error updating profile');
    }
  };

  return {
    token,
    setToken,
    user,
    setUser,
    showAuthModal,
    setShowAuthModal,
    showProfileModal,
    setShowProfileModal,
    activeTab,
    setActiveTab,
    nameInput,
    setNameInput,
    emailInput,
    setEmailInput,
    mobileInput,
    setMobileInput,
    handleOpenProfile,
    handleLoginSuccess,
    handleLogout,
    autoLogin,
    handleUpdateMobileProfile,
  };
}
