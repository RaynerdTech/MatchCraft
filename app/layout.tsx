import "../styles/globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast"; // <-- Import

export const metadata: Metadata = {
  title: "SoccerZone",
  description: "Book and join events easily",
};

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