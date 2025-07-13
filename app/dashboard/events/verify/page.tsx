'use client';

import { useState } from 'react';
import QRCodeScanner from '../../components/QRCodeScanner';
import toast from 'react-hot-toast';

export default function VerifyPassPage() {
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState({ eventId: '', reference: '' });
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<"success" | "fail" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const verifyTicket = async (data: {
    eventId: string;
    reference: string;
    type: string;
    userId?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/verify-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      setResult(result.data);
      setStatus(result.valid ? "success" : "fail");

      if (!res.ok) throw new Error(result.error || result.message || 'Verification failed');

      toast.success(result.message || '✅ Ticket verified!');
    } catch (err: any) {
      toast.error(err.message);
      setStatus("fail");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = (qrValue: string) => {
    try {
      const parsed = JSON.parse(qrValue);
      if (parsed.type !== 'event_pass') throw new Error('Invalid QR code format');
      verifyTicket(parsed);
    } catch {
      toast.error('❌ Invalid QR code');
    }
  };

  const handleManualSubmit = () => {
    if (!manual.eventId || !manual.reference) {
      toast.error('Please enter both Event ID and Reference');
      return;
    }
    verifyTicket({
      eventId: manual.eventId,
      reference: manual.reference,
      type: 'event_pass',
    });
  };

  return (
    <div className="max-w-md mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 w-full">
      <div className="text-center px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-1 sm:mb-2">Verify Event Ticket</h1>
        <p className="text-sm sm:text-base text-gray-600">Scan QR code or enter details manually</p>
      </div>

      {/* QR SCANNER */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md space-y-3 sm:space-y-4 border border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-base sm:text-lg text-gray-800">QR Code Scanner</h2>
          <button
            onClick={() => setScanning((prev) => !prev)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
              scanning 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            disabled={isLoading}
          >
            {scanning ? (
              <span className="flex items-center gap-1 sm:gap-2">
                <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Stop Scanning
              </span>
            ) : 'Start Scanner'}
          </button>
        </div>
        
        {scanning && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 sm:p-4">
            <QRCodeScanner onScan={handleScan} />
            <p className="text-xs sm:text-sm text-center text-gray-500 mt-1 sm:mt-2">Point camera at QR code to scan</p>
          </div>
        )}
      </div>

      {/* MANUAL INPUT */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md space-y-3 sm:space-y-4 border border-gray-100">
        <h2 className="font-semibold text-base sm:text-lg text-gray-800">Manual Verification</h2>
        <div className="space-y-2 sm:space-y-3">
          <div>
            <label htmlFor="eventId" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Event ID</label>
            <input
              id="eventId"
              type="text"
              placeholder="Enter event ID"
              value={manual.eventId}
              onChange={(e) => setManual({ ...manual, eventId: e.target.value })}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="reference" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input
              id="reference"
              type="text"
              placeholder="Enter transaction reference"
              value={manual.reference}
              onChange={(e) => setManual({ ...manual, reference: e.target.value })}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            />
          </div>
        </div>
        <button
          onClick={handleManualSubmit}
          disabled={isLoading}
          className="w-full py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all flex items-center justify-center text-sm sm:text-base"
        >
          {isLoading ? (
            <span className="flex items-center gap-1 sm:gap-2">
              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : (
            'Verify Manually'
          )}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div
          className={`border p-4 sm:p-6 rounded-xl shadow-md ${
            status === 'success' 
              ? result.used 
                ? 'bg-amber-50 border-amber-300' 
                : 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className={`flex-shrink-0 mt-0.5 sm:mt-1 ${
              status === 'fail' 
                ? 'text-red-500' 
                : result.used 
                ? 'text-amber-500' 
                : 'text-green-500'
            }`}>
              {status === 'fail' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : result.used ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${
                status === 'fail' 
                  ? 'text-red-700' 
                  : result.used 
                  ? 'text-amber-700' 
                  : 'text-green-700'
              }`}>
                {status === 'fail'
                  ? 'Verification Failed'
                  : result.used
                  ? 'Used Ticket Detected'
                  : 'Ticket Verified Successfully'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                {result.message || (status === "fail" ? "Invalid or used ticket" : "This ticket is valid")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="space-y-1 sm:space-y-2">
              <div>
                <p className="font-medium text-gray-500">Event</p>
                <p className="text-gray-800">{result.event?.title || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Price</p>
                <p className="text-gray-800">₦{result.event?.pricePerPlayer?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Date & Time</p>
                <p className="text-gray-800">
                  {result.event?.date ? new Date(result.event.date).toLocaleDateString() : 'N/A'}
                  {result.event?.time ? ` at ${result.event.time}` : ''}
                </p>
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div>
                <p className="font-medium text-gray-500">Attendee</p>
                <p className="text-gray-800">{result.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Email</p>
                <p className="text-gray-800">{result.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Reference</p>
                <p className="text-gray-800 font-mono text-xs sm:text-sm">{result.reference}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex flex-col xs:flex-row justify-between text-2xs sm:text-xs text-gray-500 gap-1 sm:gap-0">
              <span>Event ID: {result.eventId}</span>
              <span>User ID: {result.userId || 'N/A'}</span>
            </div>
            {result.scannedAt && (
              <div className="text-2xs sm:text-xs text-gray-500 mt-1">
                Scanned at: {new Date(result.scannedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}