"use client"

import { useState, FC } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, KeyRound, AlertTriangle } from 'lucide-react';

// A reusable and enhanced Password Input component (Light Theme)
const PasswordInput: FC<any> = ({ id, value, onChange, label }) => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={isVisible ? 'text' : 'password'}
        id={id}
        value={value}
        onChange={onChange}
        className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-gray-900 placeholder-gray-400"
        required
        minLength={8}
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-500 hover:text-violet-600"
        aria-label="Toggle password visibility"
      >
        {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};


export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account deletion state
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to change password');

      toast.success('Password changed successfully ✨');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const sendDeleteOtp = async () => {
    try {
      if (!session?.user?.email) {
        throw new Error('No email found in session');
      }
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

      toast.success('OTP sent to your email');
      setShowOtpInput(true);
      setIsDeletingAccount(false); // Close the modal
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    }
  };

  const handleAccountDeletion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setIsConfirmingDelete(true);
    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete account');
      
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
            <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center ring-2 ring-violet-200">
              <span className="text-violet-600 font-medium text-lg">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          <hr className="border-gray-200" />

          {/* Change Password Section */}
          <div className="my-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <KeyRound className="text-blue-600" size={22} /> Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <PasswordInput
                id="oldPassword"
                label="Current Password"
                value={passwordData.oldPassword}
                onChange={(e: any) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              />
              <PasswordInput
                id="newPassword"
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e: any) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <PasswordInput
                id="confirmPassword"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e: any) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isChangingPassword && <Loader2 className="animate-spin" size={20} />}
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          <hr className="border-gray-200" />

          {/* Delete Account Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={22} /> Delete Account
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              This action is irreversible. Please proceed with caution.
            </p>

            {!showOtpInput ? (
              <div>
                <button
                  onClick={() => setIsDeletingAccount(true)}
                  className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                >
                  Delete Account
                </button>

                {isDeletingAccount && (
                  <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Are you absolutely sure?</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        This action cannot be undone. All your data will be permanently removed.
                      </p>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setIsDeletingAccount(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={sendDeleteOtp}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleAccountDeletion} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP sent to {session?.user?.email}
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all text-gray-900 placeholder-gray-400 tracking-widest text-center"
                    required
                    placeholder="______"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => { setShowOtpInput(false); setOtp(''); }}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isConfirmingDelete}
                    className="flex-1 flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {isConfirmingDelete && <Loader2 className="animate-spin" size={20} />}
                    {isConfirmingDelete ? 'Deleting...' : 'Confirm Deletion'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}