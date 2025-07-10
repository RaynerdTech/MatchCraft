'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Suspense } from 'react';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const reference = searchParams.get('reference');
    const eventId = searchParams.get('eventId');
    const trxStatus = searchParams.get('status'); // Paystack may include this

    if (!eventId) {
      toast.error('Missing event ID');
      router.replace('/dashboard'); // fallback
      return;
    }

    if (reference) {
      toast.success('✅ Payment successful!');
      router.replace(`/dashboard/events/players/${eventId}`);
    } else {
      toast.error('❌ Payment failed or canceled.');
      router.replace(`/dashboard/failedpayment/${eventId}?payment=failed`);
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium text-purple-700">Redirecting...</p>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium text-purple-700">Processing payment...</p>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}