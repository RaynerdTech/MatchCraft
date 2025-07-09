'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDollarSign,
  FiCreditCard,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
} from 'react-icons/fi';

export default function PayoutSettingsForm() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    bankCode: '',
    bankName: '',
    accountNumber: '',
  });
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOrganizerOrAdmin, setIsOrganizerOrAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const banks = [
    { code: '058', name: 'GTBank' },
    { code: '044', name: 'Access Bank' },
    { code: '011', name: 'First Bank' },
    { code: '032', name: 'Union Bank' },
    { code: '033', name: 'UBA' },
    { code: '023', name: 'Citibank' },
    { code: '050', name: 'Ecobank' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' },
  ];

  useEffect(() => {
    const verifyRole = async () => {
      if (!session?.user?._id) return;
      setIsCheckingRole(true);
      try {
        const res = await fetch(`/api/users/${session.user._id}/role`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        const data = await res.json();
        if (['organizer', 'admin'].includes(data?.role)) {
          setIsOrganizerOrAdmin(true);
        }
      } catch (err) {
        console.error('Error verifying role:', err);
        toast.error('Could not verify permissions.');
      } finally {
        setIsCheckingRole(false);
      }
    };

    verifyRole();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bankCode || formData.accountNumber.length !== 10) {
      toast.error('Please select a bank and enter a valid 10-digit account number.');
      return;
    }

    setIsLoading(true);
    setIsVerifying(true);
    setAccountName('');

    try {
      const res = await fetch('/api/payments/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'An unknown error occurred.');
        return;
      }

      setAccountName(data.accountName);
      toast.success('Subaccount created successfully! 🎉 You’ll now receive payouts automatically.');
      router.refresh();

    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [code, name] = e.target.value.split('|');
    setFormData((prev) => ({
      ...prev,
      bankCode: code,
      bankName: name,
    }));
    setAccountName('');
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      accountNumber: value.slice(0, 10),
    }));
    setAccountName('');
  };

  const SkeletonLoader = () => (
    <div className="space-y-6">
      <div><div className="h-5 w-1/4 bg-gray-200 rounded mb-2"></div><div className="h-12 w-full bg-gray-200 rounded-lg"></div></div>
      <div><div className="h-5 w-1/4 bg-gray-200 rounded mb-2"></div><div className="h-12 w-full bg-gray-200 rounded-lg"></div></div>
      <div className="h-14 w-full bg-gray-200 rounded-xl"></div>
      <div className="flex space-x-2"><div className="h-5 w-5 bg-gray-200 rounded-full"></div><div className="h-5 w-3/4 bg-gray-200 rounded"></div></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 text-center">
            <div className="flex justify-center mb-4"><div className="bg-white/20 p-3 rounded-full"><FiCreditCard className="h-8 w-8 text-white" /></div></div>
            <h2 className="text-3xl font-bold text-white mb-2">Payout Settings</h2>
            {isCheckingRole
              ? <div className="h-5 w-3/4 mx-auto bg-blue-400/30 rounded animate-pulse"></div>
              : <p className="text-blue-100 max-w-md mx-auto">{isOrganizerOrAdmin ? "Set up your bank account to receive payouts" : "Payout settings are only available for organizers"}</p>}
          </div>

          <div className="px-6 py-8 sm:p-10">
            {isCheckingRole ? <SkeletonLoader /> : isOrganizerOrAdmin ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={`${formData.bankCode}|${formData.bankName}`}
                      onChange={handleBankChange}
                      disabled={isLoading}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Select your bank --</option>
                      {banks.map((bank) => (
                        <option key={bank.code} value={`${bank.code}|${bank.name}`}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.bankCode && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Code</label>
                    <input
                      type="text"
                      value={formData.bankCode}
                      readOnly
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">#</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={10}
                      value={formData.accountNumber}
                      onChange={handleAccountNumberChange}
                      disabled={isLoading}
                      required
                      placeholder="10-digit account number"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  {formData.accountNumber.length > 0 && formData.accountNumber.length < 10 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-600 mt-1.5 flex items-center">
                      <FiAlertCircle className="mr-1" /> Account number must be exactly 10 digits
                    </motion.p>
                  )}
                </div>

                <AnimatePresence>
                  {isVerifying && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center justify-center py-4">
                      <FiLoader className="animate-spin h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-600">Creating Paystack subaccount...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {accountName && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium text-green-800">Subaccount Created</p>
                        <p className="text-sm text-green-700 mt-1">{accountName}</p>
                        <p className="text-xs text-green-600 mt-2">
                          Payments will now be automatically routed to your bank account.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.bankCode || formData.accountNumber.length !== 10}
                    className={`w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                      isLoading
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <FiLoader className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Save & Verify Account'
                    )}
                  </button>
                </div>

                <div className="flex items-start text-sm text-gray-500 pt-2">
                  <FiLock className="flex-shrink-0 mr-2 mt-0.5" />
                  <p>Your bank details are encrypted and securely stored. We never store your full account information.</p>
                </div>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <div className="flex">
                  <div className="flex-shrink-0"><FiLock className="h-5 w-5 text-yellow-500" /></div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Access Restricted</h3>
                    <p className="mt-2 text-sm text-yellow-700">
                      Payout settings are only available for event organizers and administrators. If you believe this is an error, please contact support.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
