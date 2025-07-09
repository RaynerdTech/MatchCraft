'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

export default function QRCodeScanner({ onScan }: { onScan: (text: string) => void }) {
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false // ✅ This is the missing third argument (verbose)
    );

    scanner.render(
      (decodedText) => {
        scanner.clear(); // Stop scanning after first scan
        onScan(decodedText);
      },
      (error) => {
        // you can log scan errors if needed
        console.warn('QR scan error:', error);
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return <div id="reader" className="w-full" />;
}
