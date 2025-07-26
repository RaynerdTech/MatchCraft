'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSession } from 'next-auth/react';

// --- TYPE DEFINITIONS ---
interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  phone?: string | null;
  position?: string | null;
  skillLevel?: string | null;
  role?: string | null;
}

// Constants defined outside the component
const POSITIONS = ['goalkeeper', 'defender', 'midfielder', 'forward'];
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];
const NIGERIAN_PHONE_REGEX = /^((\+234)|0)[789][01]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    position: '',
    skillLevel: '',
    imageBase64: '',
  });

  const [emailState, setEmailState] = useState({
    step: 'form' as 'form' | 'otp',
    newEmail: '',
    otp: '',
  });

  const [uiState, setUiState] = useState({
    loading: {
      fetch: true,
      profile: false,
      emailInitiate: false,
      emailVerify: false,
    },
    errors: {
      phone: '',
      newEmail: '',
    },
    message: {
      type: '' as 'success' | 'error' | '',
      text: '',
    },
    isEditing: false, // Changed to control edit mode
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const session = await getSession();
        if (!session?.user?._id) {
          throw new Error('User not authenticated');
        }
        
        const res = await fetch(`/api/users/${session.user._id}/id`);
        if (!res.ok) throw new Error('Failed to fetch profile data.');
        
        const data: UserProfile = await res.json();
        setProfile(data);
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          position: data.position || '',
          skillLevel: data.skillLevel || '',
          imageBase64: data.image || '',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        showMessage('error', `Could not load profile: ${errorMessage}`);
      } finally {
        setUiState(prev => ({ ...prev, loading: { ...prev.loading, fetch: false } }));
      }
    };

    fetchUserProfile();
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'phone') {
      if (value && !NIGERIAN_PHONE_REGEX.test(value)) {
        setUiState(prev => ({
          ...prev,
          errors: { ...prev.errors, phone: 'Please enter a valid Nigerian phone number.' },
        }));
      } else {
        setUiState(prev => ({ ...prev, errors: { ...prev.errors, phone: '' } }));
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailState(prev => ({ ...prev, [name]: value }));

    if (name === 'newEmail') {
      if (value && !EMAIL_REGEX.test(value)) {
        setUiState(prev => ({
          ...prev,
          errors: { ...prev.errors, newEmail: 'Please enter a valid email address.' },
        }));
      } else {
        setUiState(prev => ({ ...prev, errors: { ...prev.errors, newEmail: '' } }));
      }
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, imageBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setUiState(prev => ({ ...prev, message: { type, text } }));
    setTimeout(() => setUiState(prev => ({ ...prev, message: { type: '', text: '' } })), 5000);
  };

  const updateProfile = async () => {
    if (uiState.errors.phone) {
      showMessage('error', 'Please fix the errors before submitting.');
      return;
    }

    setUiState(prev => ({ ...prev, loading: { ...prev.loading, profile: true } }));
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      showMessage(res.ok ? 'success' : 'error', data.message || data.error);
      
      if (res.ok) {
        // Refresh profile data after update
        const session = await getSession();
        if (session?.user?._id) {
          const res = await fetch(`/api/users/${session.user._id}/id`);
          if (res.ok) {
            const updatedData: UserProfile = await res.json();
            setProfile(updatedData);
          }
        }
        setUiState(prev => ({ ...prev, isEditing: false })); // Switch back to view mode
      }
    } catch (error) {
      showMessage('error', 'An unexpected error occurred.');
    } finally {
      setUiState(prev => ({ ...prev, loading: { ...prev.loading, profile: false } }));
    }
  };

  const initiateEmailChange = async () => {
    if (uiState.errors.newEmail) {
      showMessage('error', 'Please fix the email errors before submitting.');
      return;
    }

    setUiState(prev => ({ ...prev, loading: { ...prev.loading, emailInitiate: true } }));
    try {
      const res = await fetch('/api/profile/email-change/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: emailState.newEmail }),
      });
      const data = await res.json();
      showMessage(res.ok ? 'success' : 'error', data.message || data.error);
      
      if (res.ok) {
        setEmailState(prev => ({ ...prev, step: 'otp' }));
      }
    } catch (error) {
      showMessage('error', 'An unexpected error occurred while initiating email change.');
    } finally {
      setUiState(prev => ({ ...prev, loading: { ...prev.loading, emailInitiate: false } }));
    }
  };

  const verifyEmailChange = async () => {
    if (!emailState.otp) {
      showMessage('error', 'Please enter the verification code.');
      return;
    }

    setUiState(prev => ({ ...prev, loading: { ...prev.loading, emailVerify: true } }));
    try {
      const res = await fetch('/api/profile/email-change/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailState.newEmail,
          otp: emailState.otp 
        }),
      });
      const data = await res.json();
      showMessage(res.ok ? 'success' : 'error', data.message || data.error);
      
      if (res.ok) {
        // Refresh profile data after successful email update
        const session = await getSession();
        if (session?.user?._id) {
          const res = await fetch(`/api/users/${session.user._id}/id`);
          if (res.ok) {
            const updatedData: UserProfile = await res.json();
            setProfile(updatedData);
          }
        }
        setEmailState(prev => ({ ...prev, step: 'form', newEmail: '', otp: '' }));
      }
    } catch (error) {
      showMessage('error', 'An unexpected error occurred while verifying email change.');
    } finally {
      setUiState(prev => ({ ...prev, loading: { ...prev.loading, emailVerify: false } }));
    }
  };

  const isEmailSendDisabled = useMemo(() => {
    return !emailState.newEmail || !!uiState.errors.newEmail || uiState.loading.emailInitiate;
  }, [emailState.newEmail, uiState.errors.newEmail, uiState.loading.emailInitiate]);

  const isProfileUpdateDisabled = useMemo(() => {
    return !!uiState.errors.phone || uiState.loading.profile;
  }, [uiState.errors.phone, uiState.loading.profile]);

  if (uiState.loading.fetch) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Loading Profile...</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Profile</h1>
        <p className="text-red-500">{uiState.message.text || "Could not load user profile."}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 border-b pb-4">
          Your Profile
        </h1>
        {!uiState.isEditing && (
          <button 
            onClick={() => setUiState(prev => ({ ...prev, isEditing: true }))}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
          >
            Edit Profile
          </button>
        )}
      </div>

      {uiState.message.text && (
        <div className={`p-3 rounded-md mb-4 text-sm ${
          uiState.message.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {uiState.message.text}
        </div>
      )}

      {!uiState.isEditing ? (
        // VIEW MODE (default)
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={profile.image || '/default-avatar.png'}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500">Phone</h3>
              <p className="text-gray-800">{profile.phone || 'Not provided'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500">Position</h3>
              <p className="text-gray-800 capitalize">{profile.position || 'Not provided'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500">Skill Level</h3>
              <p className="text-gray-800 capitalize">{profile.skillLevel || 'Not provided'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500">Role</h3>
              <p className="text-gray-800 capitalize">{profile.role || 'Not provided'}</p>
            </div>
          </div>

          {/* Email Update Section (always visible) */}
          <div className="pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Update Email</h2>
            
            {emailState.step === 'form' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">New Email</label>
                  <input 
                    id="newEmail" 
                    name="newEmail" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={emailState.newEmail} 
                    onChange={handleEmailChange} 
                    className={`mt-1 block border px-3 py-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${uiState.errors.newEmail ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {uiState.errors.newEmail && <p className="text-xs text-red-600 mt-1">{uiState.errors.newEmail}</p>}
                </div>
                <button 
                  onClick={initiateEmailChange} 
                  disabled={isEmailSendDisabled} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md w-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center justify-center"
                >
                  {uiState.loading.emailInitiate ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  A verification code has been sent to <strong>{emailState.newEmail}</strong>. Please enter it below.
                </p>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Verification Code (OTP)</label>
                  <input 
                    id="otp" 
                    name="otp" 
                    type="text" 
                    placeholder="Enter OTP" 
                    value={emailState.otp} 
                    onChange={handleEmailChange} 
                    className="mt-1 block border px-3 py-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setEmailState(prev => ({ ...prev, step: 'form' }))} 
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md w-full hover:bg-gray-300 transition duration-150 ease-in-out"
                  >
                    Change Email
                  </button>
                  <button 
                    onClick={verifyEmailChange} 
                    disabled={uiState.loading.emailVerify} 
                    className="bg-green-600 text-white px-4 py-2 rounded-md w-full hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center justify-center"
                  >
                    {uiState.loading.emailVerify ? 'Verifying...' : 'Verify and Update Email'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // EDIT MODE
        <>
          {/* Profile Image Input */}
          <div className="mb-4">
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture
            </label>
            <input 
              id="image-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleImage} 
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
          </div>

          {/* Profile Information Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                placeholder="Full Name" 
                value={form.name} 
                onChange={handleFormChange} 
                className="mt-1 block border px-3 py-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input 
                id="phone" 
                name="phone" 
                type="tel" 
                placeholder="08012345678" 
                value={form.phone} 
                onChange={handleFormChange} 
                className={`mt-1 block border px-3 py-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${uiState.errors.phone ? 'border-red-500' : 'border-gray-300'}`} 
              />
              {uiState.errors.phone && <p className="text-xs text-red-600 mt-1">{uiState.errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
              <select 
                id="position" 
                name="position" 
                value={form.position} 
                onChange={handleFormChange} 
                className="mt-1 block border px-3 py-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Position</option>
                {POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos.charAt(0).toUpperCase() + pos.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">Skill Level</label>
              <select 
                id="skillLevel" 
                name="skillLevel" 
                value={form.skillLevel} 
                onChange={handleFormChange} 
                className="mt-1 block border px-3 py-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Skill Level</option>
                {SKILL_LEVELS.map(level => (
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setUiState(prev => ({ ...prev, isEditing: false }))}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md w-full hover:bg-gray-300 transition duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button 
              onClick={updateProfile} 
              disabled={isProfileUpdateDisabled} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md w-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center justify-center"
            >
              {uiState.loading.profile ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}