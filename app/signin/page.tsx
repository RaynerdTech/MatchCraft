'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: { opacity: 0, y: -20 },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};


function AuthPageContent() {

  
  const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedFields, setFocusedFields] = useState({
    email: false,
    password: false,
    name: false,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  useEffect(() => {
    setIsMounted(true);
  }, []);

useEffect(() => {
  let timer: NodeJS.Timeout;
  if (resendDisabled && resendTimer > 0) {
    timer = setTimeout(() => {
      setResendTimer(resendTimer - 1);
    }, 1000);
  } else if (resendTimer === 0) {
    setResendDisabled(false);
    setResendTimer(60); // Reset the timer for next use
  }
  return () => {
    if (timer) clearTimeout(timer);
  };
}, [resendDisabled, resendTimer]); 

  // Handle OTP resend timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      setResendTimer(60);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendDisabled, resendTimer]);

  useEffect(() => {
    if (!isMounted) return;
    
    const errorParam = searchParams.get('error');
    switch(errorParam) {
      case 'OAuthAccountNotLinked':
        setError('Please use the original sign-in method for this email');
        break;
      case 'ManualAccountExists':
        setError('An account already exists with this email. Please sign in with email and password.');
        break;
      case 'CredentialsSignin':
        setError('Invalid email or password');
        break;
      case 'GoogleAccountExists':
        setError('This email is registered with Google. Please sign in with Google.');
        break;
      case 'ProviderConflict':
        setError('Account already exists with different login method.');
        break;
      default:
        if (errorParam) {
          setError('Sign-in failed. Please try again.');
        }
    }
  }, [searchParams, isMounted]);

  useEffect(() => {
    if (mode === 'signup' && form.password) {
      const strength = Math.min(100, form.password.length * 8);
      setPasswordStrength(strength);
    }
  }, [form.password, mode]);

  const handleFocus = (field: keyof typeof focusedFields) => {
    setFocusedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof typeof focusedFields) => {
    if (!form[field]) {
      setFocusedFields(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setIsAnimating(true);

    await signOut({ redirect: false });
    const result = await signIn('google', {
      redirect: false,
      callbackUrl: '/onboarding',
    });

    if (result?.error) {
      try {
        const errorUrl = new URL(result.error);
        const errorType = errorUrl.searchParams.get('error');
        if (errorType === 'ManualAccountExists') {
          setError('An account already exists with this email. Please sign in with email and password.');
        } else {
          setError('Failed to sign in with Google. Please try again.');
        }
      } catch {
        setError('An error occurred during sign in.');
      }
      setIsAnimating(false);
    } else if (result?.ok) {
      // await new Promise(resolve => setTimeout(resolve, 800));
      router.replace('/onboarding');
    }

    setLoading(false);
  };

const handleSendOtp = async () => {
  if (!form.email) {
    setError('Please enter your email first');
    return;
  }

  if (!validateEmail(form.email)) {
    setError('Please enter a valid email address');
    return;
  }

  setOtpLoading(true);
  setOtpError('');

  try {
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    setOtpSent(true);
    setResendDisabled(true);
    setResendTimer(60);
  } catch (err) {
    setOtpError(err instanceof Error ? err.message : 'Failed to send OTP');
  } finally {
    setOtpLoading(false);
  }
};

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all fields are filled
    if (newOtp.every(val => val) && newOtp.join('').length === 6) {
      handleVerifyOtp();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setOtpError('Please enter a 6-digit code');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: form.email,
          otp: otpCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      setEmailVerified(true);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (mode === 'signup' && !emailVerified) {
    setError('Please verify your email first');
    return;
  }

  setLoading(true);
  setError('');
  setIsAnimating(true);

  try {
    if (mode === 'signup') {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Could not create account.');
      }

      // Directly redirect to onboarding after successful signup
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push('/onboarding');
    } else {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        await new Promise(resolve => setTimeout(resolve, 800));
        router.push('/onboarding');
      } else {
        throw new Error('Invalid email or password');
      }
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Something went wrong.');
    setIsAnimating(false);
  } finally {
    setLoading(false);
  }
};

  const toggleMode = () => {
    setIsAnimating(true);
    setMode(prev => (prev === 'signin' ? 'signup' : 'signin'));
    setError('');
    setOtpSent(false);
    setEmailVerified(false);
    setOtp(Array(6).fill(''));
    setOtpError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <motion.div
        ref={containerRef}
        initial="hidden"
        animate={isMounted ? "visible" : "hidden"}
        exit="exit"
        variants={containerVariants}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <motion.div
          className="h-2 bg-blue-600"
          animate={{
            backgroundColor: '#2563eb',
          }}
          transition={{ duration: 0.6 }}
        />

        <div className="p-8">
          <motion.div className="mb-8 text-center">
            <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
              <motion.h1
                key={`title-${mode}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold text-gray-900 mb-2"
              >
                {mode === 'signin' ? 'Login' : 'Create Account'}
              </motion.h1>
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={`subtitle-${mode}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-gray-500"
              >
                {mode === 'signin'
                  ? 'Welcome back! Please enter your details'
                  : 'Get started with your new account'}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {(error || otpError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg"
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error || otpError}</p>
                    {error.includes('Please sign in with email and password') && (
                      <div className="mt-2 flex space-x-4">
                        <button
                          onClick={() => {
                            setMode('signin');
                            setError('');
                          }}
                          className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                          Go to Sign In
                        </button>
                        <button
                          onClick={() => router.push('/forgot-password')}
                          className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                    {error.includes('Please sign in with Google') && (
                      <button
                        onClick={handleGoogleSignIn}
                        className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Sign in with Google
                      </button>
                    )}
                    {error.includes('@gmail.com') && form.email.includes('@gmail.com') && (
                      <p className="text-xs mt-2 text-gray-600">
                        You're using a Google email. Try signing in with Google.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative pt-5">
                    <motion.label
                      initial={{ y: 20, opacity: 0 }}
                      animate={{
                        y: focusedFields.name || form.name ? 0 : 20,
                        opacity: focusedFields.name || form.name ? 1 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className={`absolute left-3 px-1 bg-white text-sm ${
                        focusedFields.name ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      Name
                    </motion.label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onFocus={() => handleFocus('name')}
                        onBlur={() => handleBlur('name')}
                        placeholder={!focusedFields.name && !form.name ? 'Enter your name' : ''}
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants} custom={2}>
              <div className="relative pt-5">
                <motion.label
                  initial={{ y: 20, opacity: 0 }}
                  animate={{
                    y: focusedFields.email || form.email ? 0 : 20,
                    opacity: focusedFields.email || form.email ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`absolute left-3 px-1 bg-white text-sm ${
                    focusedFields.email ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  Email
                </motion.label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    placeholder={!focusedFields.email && !form.email ? 'Enter your email' : ''}
                    required
                  />
                </div>
             {mode === 'signup' && (
  <div className="mt-2 flex justify-end">
   <button
  type="button"
  onClick={handleSendOtp}
  disabled={resendDisabled || otpLoading || !form.email}
  className={`text-sm px-3 py-1 rounded-md ${
    resendDisabled || otpLoading || !form.email
      ? 'text-gray-400 cursor-not-allowed'
      : 'text-blue-600 hover:text-blue-700'
  }`}
>
  {otpLoading ? 'Sending...' : 
   resendDisabled ? `Resend in ${resendTimer}s` : 
   otpSent ? 'Resend Code' : 
   'Send Code'}
</button>
  </div>
)}
              </div>
            </motion.div>

            {mode === 'signup' && otpSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <p className="text-sm text-gray-600">Enter the 6-digit code sent to your email</p>
                <div className="flex space-x-2">
                  {Array.from({ length: 6 }).map((_, index) => (
  <input
    key={index}
    ref={(el) => {
      otpInputRefs.current[index] = el;
    }}
    type="text"
    maxLength={1}
    value={otp[index]}
    onChange={(e) => handleOtpChange(index, e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }}
    className="w-10 h-12 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    disabled={emailVerified}
  />
))}
                </div>
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.join('').length !== 6}
                    className={`text-sm px-3 py-1 rounded-md ${
                      otpLoading || otp.join('').length !== 6
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {otpLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                )}
                {emailVerified && (
                  <p className="text-sm text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email verified
                  </p>
                )}
              </motion.div>
            )}

            <motion.div variants={itemVariants} custom={3}>
              <div className="relative pt-5">
                <motion.label
                  initial={{ y: 20, opacity: 0 }}
                  animate={{
                    y: focusedFields.password || form.password ? 0 : 20,
                    opacity: focusedFields.password || form.password ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`absolute left-3 px-1 bg-white text-sm ${
                    focusedFields.password ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  Password
                </motion.label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    placeholder={!focusedFields.password && !form.password ? 'Enter your password' : ''}
                    required
                  />
                  {form.password && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      )}
                    </button>
                  )}
                </div>
                {mode === 'signup' && form.password && (
                  <div className="h-1 bg-gray-200 rounded-full mt-1">
                    <div 
                      className={`h-full rounded-full ${
                        passwordStrength > 75 ? 'bg-green-500' :
                        passwordStrength > 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              custom={mode === 'signin' ? 4 : 5}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={loading || isAnimating || (mode === 'signup' && !emailVerified)}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${
                  loading || isAnimating || (mode === 'signup' && !emailVerified)
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } ${
                  isAnimating && !loading ? 'opacity-90' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  emailVerified ? 'Sign Up' : 'Verify Email to Continue'
                )}
              </button>
            </motion.div>
          </form>

          <motion.div className="mt-6" variants={itemVariants} custom={mode === 'signin' ? 6 : 5}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} custom={mode === 'signin' ? 7 : 6}>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || isAnimating}
              className={`w-full mt-4 flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                loading || isAnimating
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <FcGoogle className="h-5 w-5 mr-2" />
                  Continue with Google
                </>
              )}
            </button>
          </motion.div>

          <motion.div
            className="mt-6 text-center text-sm text-gray-500"
            variants={itemVariants}
            custom={mode === 'signin' ? 8 : 7}
          >
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}