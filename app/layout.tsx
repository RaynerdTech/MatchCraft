import "../styles/globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast"; // <-- Import

export const metadata: Metadata = {
  title: "SoccerHub",
  description: "Book and join events easily",
};

<Toaster
  position="top-center" // 👈 Show at center top
  toastOptions={{
    duration: Infinity, // 👈 Don't auto-dismiss unless manually closed
    style: {
      background: "#fff",
      color: "#000",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
    },
  }}
/>;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" /> {/* <-- Add here */}
      </body>
    </html>
  );
}
