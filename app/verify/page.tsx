'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get('status'); // this is important!
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      toast.error("Missing event ID");
      return router.replace('/error?message=Missing event ID');
    }

    if (status === 'success') {
      toast.success("Payment successful!");
      router.replace(`/dashboard/events/players/${eventId}`);
    } else {
      toast.error("Payment failed or cancelled");
      router.replace(`/events/${eventId}?payment=failed`);
    }
  }, [searchParams, router]);

  return (
    <div className="text-center py-10 text-lg font-medium text-gray-600">
      Redirecting...
    </div>
  );
}
