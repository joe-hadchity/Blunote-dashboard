"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Trash2, HardDrive, Video, Clock, Key } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    document.title = "Profile | Bluenote - AI-Powered Meeting Assistant";
    
    // Fetch full user details from API
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserDetails(data.user);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();

    // Fetch user stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast.success('Account deleted successfully. Goodbye! 👋');
        await logout();
        // Add a small delay so the user can see the success message
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete account');
        setIsDeleting(false);
        setShowDeleteModal(false);
        setDeleteConfirmText('');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText('');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Validate password length
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    // Validate password strength requirements
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(passwordForm.newPassword)) {
      toast.error('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(passwordForm.newPassword)) {
      toast.error('Password must contain at least one number');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.newPassword)) {
      toast.error('Password must contain at least one special character');
      return;
    }

    // Validate current password is provided
    if (!passwordForm.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password updated successfully! 🔒');
        setShowPasswordReset(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Profile" />
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-dark">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = userDetails?.name || user?.name || 'User';
  const displayEmail = userDetails?.email || user?.email || '';
  const createdAt = userDetails?.created_at ? new Date(userDetails.created_at) : null;
  
  // Check if user signed in with OAuth provider (Google, etc.)
  // Debug logging
  console.log('User details for OAuth check:', {
    app_metadata: userDetails?.app_metadata,
    providers: userDetails?.app_metadata?.providers,
    provider: userDetails?.app_metadata?.provider
  });
  
  const isOAuthUser = userDetails?.app_metadata?.providers?.includes('google') || 
                       userDetails?.app_metadata?.provider === 'google' ||
                       (Array.isArray(userDetails?.app_metadata?.providers) && 
                        userDetails?.app_metadata?.providers.length > 0 &&
                        !userDetails?.app_metadata?.providers.includes('email'));
  
  console.log('Is OAuth user:', isOAuthUser);
  
  // Stats with defaults
  const totalRecordings = stats?.totalRecordings || 0;
  const totalHours = stats?.totalHours || 0;
  const storageUsedMB = stats?.storageUsedMB || 0; // in MB
  const storageLimitMB = 500; // 500 MB limit (fixed, don't rely on API)
  const storagePercentage = (storageUsedMB / storageLimitMB) * 100;
  
  // Format hours
  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours.toFixed(1)} hrs`;
  };
  
  // Format storage
  const formatStorage = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)} KB`;
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <>
    <div>
      <PageBreadcrumb pageTitle="Profile" />
        
        {/* Profile Card - Single Clean Card */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-dark overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
            <div className="flex items-center gap-4">
              {/* Avatar with Initials */}
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-semibold">
                {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {displayName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Usage Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Total Recordings */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recordings
                  </p>
                </div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {totalRecordings}
                </p>
              </div>

              {/* Total Hours */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Time
                  </p>
                </div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatHours(totalHours)}
                </p>
              </div>
            </div>

            {/* Storage Usage */}
            <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Storage Used
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatStorage(storageUsedMB)} / {storageLimitMB} MB
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    storagePercentage > 90 ? 'bg-red-500' : 
                    storagePercentage > 70 ? 'bg-yellow-500' : 
                    'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {Math.max(0, (100 - storagePercentage)).toFixed(0)}% available ({formatStorage(Math.max(0, storageLimitMB - storageUsedMB))} remaining)
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
            {/* Member Since */}
            {createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Member since {createdAt.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Security & Actions */}
          <div className="p-6 space-y-3">
            {/* Password Reset - Disabled for OAuth users */}
            <button
              onClick={() => !isOAuthUser && setShowPasswordReset(true)}
              disabled={isOAuthUser}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                isOAuthUser 
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed' 
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title={isOAuthUser ? 'Password change not available for Google sign-in users' : ''}
            >
              <div className="flex items-center gap-3">
                <Key className={`w-5 h-5 ${isOAuthUser ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${isOAuthUser ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    Change Password
                    {isOAuthUser && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        Google Sign-In
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isOAuthUser ? 'Managed by your Google account' : 'Update your account password'}
                  </p>
                </div>
              </div>
            </button>

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-red-900 dark:text-red-400">
                    Delete Account
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Permanently delete your account and data
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
                Change Password
              </h3>
              
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                Enter your current password and choose a strong new one
              </p>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  
                  {/* Password Requirements */}
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Password must contain:</p>
                    <ul className="space-y-1 text-xs">
                      <li className={`flex items-center gap-2 ${passwordForm.newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <span>{passwordForm.newPassword.length >= 8 ? '✓' : '○'}</span>
                        At least 8 characters
                      </li>
                      <li className={`flex items-center gap-2 ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <span>{/[A-Z]/.test(passwordForm.newPassword) ? '✓' : '○'}</span>
                        One uppercase letter (A-Z)
                      </li>
                      <li className={`flex items-center gap-2 ${/[a-z]/.test(passwordForm.newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <span>{/[a-z]/.test(passwordForm.newPassword) ? '✓' : '○'}</span>
                        One lowercase letter (a-z)
                      </li>
                      <li className={`flex items-center gap-2 ${/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <span>{/[0-9]/.test(passwordForm.newPassword) ? '✓' : '○'}</span>
                        One number (0-9)
                      </li>
                      <li className={`flex items-center gap-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.newPassword) ? '✓' : '○'}</span>
                        One special character (!@#$%...)
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Re-enter new password"
                  />
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
                  )}
                  {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">✓ Passwords match</p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordReset(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    disabled={isUpdatingPassword}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700">
            <div className="p-8">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-full bg-red-100 dark:bg-red-900/20">
                <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-3">
                Delete account?
              </h3>
              
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                This will permanently delete your account, all recordings, transcripts, and meetings. This action cannot be undone.
              </p>

              {/* Type to Confirm */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                  Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  disabled={isDeleting}
                  className="w-full px-4 py-2.5 text-center text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus
                />
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
                
                <button
                  onClick={handleCloseDeleteModal}
                  disabled={isDeleting}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
