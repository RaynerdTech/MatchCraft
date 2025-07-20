// app/layout.tsx

import "../styles/globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SoccerHub",
  description: "Book and join events easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <body className="h-dvh bg-white text-black overflow-x-hidden">
        <div className="flex flex-col min-h-dvh">{children}</div>

        {/* One toaster is enough — use this and control position where needed */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: Infinity,
            style: {
              background: "#fff",
              color: "#000",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
            },
          }}
        />
      </body>
    </html>
  );
}
