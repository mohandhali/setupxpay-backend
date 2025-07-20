import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaUser, FaEnvelope, FaWallet, FaShieldAlt, FaCog, FaSignOutAlt, FaCopy, FaBell, FaEye, FaTimes } from "react-icons/fa";
import AvatarSelector from "./AvatarSelector";

const Profile = ({ user, onClose }) => {
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState("");
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "default");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(user?.biometricEnabled || false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications || true);
  const [pushNotifications, setPushNotifications] = useState(user?.pushNotifications || true);
  const [transactionAlerts, setTransactionAlerts] = useState(user?.transactionAlerts || true);
  const [securityAlerts, setSecurityAlerts] = useState(user?.securityAlerts || true);
  const [marketingEmails, setMarketingEmails] = useState(user?.marketingEmails || false);
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(user?.profileVisibility || "public");
  const [showBalance, setShowBalance] = useState(user?.showBalance || true);
  const [allowFriendRequests, setAllowFriendRequests] = useState(user?.allowFriendRequests || true);
  const [dataSharing, setDataSharing] = useState(user?.dataSharing || false);

  // Avatar helper functions
  const getAvatarSvg = (avatarId) => {
    const avatarOptions = {
      default: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#3B82F6"/>
          <path d="M18 9C20.7614 9 23 11.2386 23 14C23 16.7614 20.7614 19 18 19C15.2386 19 13 16.7614 13 14C13 11.2386 15.2386 9 18 9Z" fill="white"/>
          <path d="M18 21C22.4183 21 26 24.5817 26 29H10C10 24.5817 13.5817 21 18 21Z" fill="white"/>
        </svg>
      ),
      rocket: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#EF4444"/>
          <path d="M18 8L20 12L18 16L16 12L18 8Z" fill="white"/>
          <path d="M18 16L18 28L14 24L18 16Z" fill="white"/>
          <path d="M18 16L18 28L22 24L18 16Z" fill="white"/>
          <circle cx="18" cy="12" r="2" fill="#EF4444"/>
        </svg>
      ),
      star: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#F59E0B"/>
          <path d="M18 6L22 14L30 15L24 21L26 29L18 25L10 29L12 21L6 15L14 14L18 6Z" fill="white"/>
        </svg>
      ),
      diamond: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#8B5CF6"/>
          <path d="M18 8L24 18L18 28L12 18L18 8Z" fill="white"/>
          <path d="M18 8L18 28" stroke="#8B5CF6" strokeWidth="2"/>
          <path d="M12 18L24 18" stroke="#8B5CF6" strokeWidth="2"/>
        </svg>
      ),
      shield: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#10B981"/>
          <path d="M18 8L24 12V18C24 22 21 26 18 28C15 26 12 22 12 18V12L18 8Z" fill="white"/>
          <path d="M16 18L18 20L22 16" stroke="#10B981" strokeWidth="2" fill="none"/>
        </svg>
      ),
      crown: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#F97316"/>
          <path d="M8 20L12 14L18 16L24 14L28 20L26 26H10L8 20Z" fill="white"/>
          <path d="M12 14L14 8L18 10L22 8L24 14" stroke="#F97316" strokeWidth="1" fill="none"/>
        </svg>
      ),
      lightning: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#EAB308"/>
          <path d="M18 8L12 18H16L14 28L24 18H20L18 8Z" fill="white"/>
        </svg>
      ),
      heart: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#EC4899"/>
          <path d="M18 12C18 12 20 10 22 10C24 10 26 12 26 14C26 18 18 24 18 24C18 24 10 18 10 14C10 12 12 10 14 10C16 10 18 12 18 12Z" fill="white"/>
        </svg>
      ),
      moon: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#6366F1"/>
          <path d="M18 8C22 8 26 12 26 18C26 24 22 28 18 28C14 28 10 24 10 18C10 12 14 8 18 8Z" fill="white"/>
          <path d="M18 8C22 8 26 12 26 18C26 24 22 28 18 28C14 28 10 24 10 18C10 12 14 8 18 8Z" fill="#6366F1"/>
          <circle cx="22" cy="14" r="3" fill="#6366F1"/>
        </svg>
      ),
      fire: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#DC2626"/>
          <path d="M18 8C18 8 20 12 20 16C20 20 18 24 18 24C18 24 16 20 16 16C16 12 18 8 18 8Z" fill="white"/>
          <path d="M18 12C18 12 19 14 19 16C19 18 18 20 18 20C18 20 17 18 17 16C17 14 18 12 18 12Z" fill="#DC2626"/>
        </svg>
      )
    };
    return avatarOptions[avatarId] || avatarOptions.default;
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
    setHasChanges(true);
    setShowAvatarSelector(false);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Update user object in localStorage
      const updatedUser = { 
        ...user, 
        avatar: selectedAvatar,
        biometricEnabled: biometricEnabled,
        twoFactorEnabled: twoFactorEnabled,
        emailNotifications: emailNotifications,
        pushNotifications: pushNotifications,
        transactionAlerts: transactionAlerts,
        securityAlerts: securityAlerts,
        marketingEmails: marketingEmails,
        profileVisibility: profileVisibility,
        showBalance: showBalance,
        allowFriendRequests: allowFriendRequests,
        dataSharing: dataSharing
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Here you can also save to backend if needed
      // await fetch('/api/update-profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     avatar: selectedAvatar,
      //     biometricEnabled: biometricEnabled,
      //     twoFactorEnabled: twoFactorEnabled
      //   })
      // });
      
      setHasChanges(false);
      // Force page reload to update all components
      window.location.reload();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBiometricToggle = async () => {
    try {
      if (!biometricEnabled) {
        // Check if biometric authentication is available
        if (navigator.credentials && window.PublicKeyCredential) {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (available) {
            // Simulate biometric authentication
            const confirmed = window.confirm("Enable biometric authentication? You'll need to use fingerprint or face ID to access your account.");
            if (confirmed) {
              setBiometricEnabled(true);
              setHasChanges(true);
            }
          } else {
            alert("Biometric authentication is not available on this device.");
          }
        } else {
          alert("Biometric authentication is not supported in this browser.");
        }
      } else {
        const confirmed = window.confirm("Disable biometric authentication?");
        if (confirmed) {
          setBiometricEnabled(false);
          setHasChanges(true);
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      alert("Failed to configure biometric authentication.");
    }
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      setShowTwoFactorSetup(true);
    } else {
      const confirmed = window.confirm("Disable two-factor authentication? This will make your account less secure.");
      if (confirmed) {
        setTwoFactorEnabled(false);
        setHasChanges(true);
      }
    }
  };

  const handleTwoFactorSetup = () => {
    // Generate a random 6-digit code for demo
    const secretCode = Math.floor(100000 + Math.random() * 900000);
    alert(`Your 2FA setup code is: ${secretCode}\n\nPlease save this code securely. You'll need it to access your account.`);
    setTwoFactorEnabled(true);
    setShowTwoFactorSetup(false);
    setHasChanges(true);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    
    if (newPassword.length < 8) {
      alert("New password must be at least 8 characters long.");
      return;
    }
    
    // Simulate password change
    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowChangePassword(false);
  };

  const handleNotificationToggle = (type) => {
    switch (type) {
      case 'email':
        setEmailNotifications(!emailNotifications);
        break;
      case 'push':
        setPushNotifications(!pushNotifications);
        break;
      case 'transaction':
        setTransactionAlerts(!transactionAlerts);
        break;
      case 'security':
        setSecurityAlerts(!securityAlerts);
        break;
      case 'marketing':
        setMarketingEmails(!marketingEmails);
        break;
      default:
        break;
    }
    setHasChanges(true);
  };

  const handlePrivacyToggle = (type) => {
    switch (type) {
      case 'balance':
        setShowBalance(!showBalance);
        break;
      case 'friendRequests':
        setAllowFriendRequests(!allowFriendRequests);
        break;
      case 'dataSharing':
        setDataSharing(!dataSharing);
        break;
      default:
        break;
    }
    setHasChanges(true);
  };



  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        </div>
        {hasChanges && (
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Picture & Name */}
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="relative mx-auto mb-4">
              <div 
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setShowAvatarSelector(true)}
              >
                {getAvatarSvg(selectedAvatar)}
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{user?.name || "User"}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <button 
              onClick={() => setShowAvatarSelector(true)}
              className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-800"
            >
              Change Avatar
            </button>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Account Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <div className="text-gray-800 font-medium">{user?.name || "Not provided"}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email Address</label>
                <div className="text-gray-800 font-medium">{user?.email}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Member Since</label>
                <div className="text-gray-800 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Information */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaWallet className="text-blue-600" />
              Wallet Addresses
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">TRC20 Address</label>
                <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div className="text-xs font-mono text-gray-700 truncate flex-1">
                    {user?.walletAddress || "Not available"}
                  </div>
                  {user?.walletAddress && (
                    <button
                      onClick={() => copyToClipboard(user.walletAddress, "trc20")}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                    >
                      <FaCopy className="text-sm" />
                    </button>
                  )}
                </div>
                {copiedField === "trc20" && (
                  <p className="text-xs text-green-600 mt-1">Copied!</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">BEP20 Address</label>
                <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div className="text-xs font-mono text-gray-700 truncate flex-1">
                    {user?.bep20Address || "Not available"}
                  </div>
                  {user?.bep20Address && (
                    <button
                      onClick={() => copyToClipboard(user.bep20Address, "bep20")}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                    >
                      <FaCopy className="text-sm" />
                    </button>
                  )}
                </div>
                {copiedField === "bep20" && (
                  <p className="text-xs text-green-600 mt-1">Copied!</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-blue-600" />
              Security
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Biometric Authentication</div>
                  <div className="text-sm text-gray-500">Use fingerprint or face ID</div>
                </div>
                <button 
                  onClick={handleBiometricToggle}
                  className={`w-12 h-6 rounded-full ${biometricEnabled ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${biometricEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-500">Add extra security layer</div>
                </div>
                <button 
                  onClick={handleTwoFactorToggle}
                  className={`w-12 h-6 rounded-full ${twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${twoFactorEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Change Password</div>
                  <div className="text-sm text-gray-500">Update your account password</div>
                </div>
                <button 
                  onClick={() => setShowChangePassword(true)}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBell className="text-blue-600" />
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Email Notifications</div>
                  <div className="text-sm text-gray-500">Receive updates via email</div>
                </div>
                <button 
                  onClick={() => handleNotificationToggle('email')}
                  className={`w-12 h-6 rounded-full ${emailNotifications ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${emailNotifications ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Push Notifications</div>
                  <div className="text-sm text-gray-500">Get instant app notifications</div>
                </div>
                <button 
                  onClick={() => handleNotificationToggle('push')}
                  className={`w-12 h-6 rounded-full ${pushNotifications ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${pushNotifications ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Transaction Alerts</div>
                  <div className="text-sm text-gray-500">Notify on transactions</div>
                </div>
                <button 
                  onClick={() => handleNotificationToggle('transaction')}
                  className={`w-12 h-6 rounded-full ${transactionAlerts ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${transactionAlerts ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Security Alerts</div>
                  <div className="text-sm text-gray-500">Important security updates</div>
                </div>
                <button 
                  onClick={() => handleNotificationToggle('security')}
                  className={`w-12 h-6 rounded-full ${securityAlerts ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${securityAlerts ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Marketing Emails</div>
                  <div className="text-sm text-gray-500">Promotional content</div>
                </div>
                <button 
                  onClick={() => handleNotificationToggle('marketing')}
                  className={`w-12 h-6 rounded-full ${marketingEmails ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${marketingEmails ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaEye className="text-blue-600" />
              Privacy
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Profile Visibility</div>
                  <div className="text-sm text-gray-500">Who can see your profile</div>
                </div>
                <select 
                  value={profileVisibility}
                  onChange={(e) => {
                    setProfileVisibility(e.target.value);
                    setHasChanges(true);
                  }}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Show Balance</div>
                  <div className="text-sm text-gray-500">Display wallet balance</div>
                </div>
                <button 
                  onClick={() => handlePrivacyToggle('balance')}
                  className={`w-12 h-6 rounded-full ${showBalance ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${showBalance ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Friend Requests</div>
                  <div className="text-sm text-gray-500">Allow friend requests</div>
                </div>
                <button 
                  onClick={() => handlePrivacyToggle('friendRequests')}
                  className={`w-12 h-6 rounded-full ${allowFriendRequests ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${allowFriendRequests ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Data Sharing</div>
                  <div className="text-sm text-gray-500">Share data for improvements</div>
                </div>
                <button 
                  onClick={() => handlePrivacyToggle('dataSharing')}
                  className={`w-12 h-6 rounded-full ${dataSharing ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${dataSharing ? 'right-0.5' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>
          </div>



          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Choose Your Avatar</h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>
            <div className="mb-6">
              <AvatarSelector 
                selectedAvatar={selectedAvatar}
                onSelect={handleAvatarSelect}
              />
            </div>
            <button
              onClick={() => setShowAvatarSelector(false)}
              className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Setup Modal */}
      {showTwoFactorSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Two-Factor Authentication</h3>
              <button
                onClick={() => setShowTwoFactorSetup(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaShieldAlt className="text-blue-600 text-2xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Enable 2FA</h4>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account. You'll need a verification code to access your account.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Security Benefits:</div>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Protection against unauthorized access</li>
                  <li>• Secure login even if password is compromised</li>
                  <li>• Industry-standard security practice</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTwoFactorSetup(false)}
                className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTwoFactorSetup}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm text-blue-800 font-medium mb-1">Password Requirements:</div>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include numbers and special characters</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChangePassword(false)}
                className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Profile; 