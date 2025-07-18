// app/Home/Footer.tsx

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t mt-20 py-10 px-6 md:px-12 text-gray-700">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        {/* Left - Logo & Tagline */}
        <div>
          <h2 className="text-xl font-bold text-blue-600">SoccerHub</h2>
          <p className="text-sm mt-2">
            Built by football lovers, for football lovers. ⚽
          </p>
        </div>

        {/* Middle - Links */}
        <div className="flex gap-6 text-sm">
          <Link href="#about" className="hover:text-blue-600 transition">
            About
          </Link>
          <Link href="#features" className="hover:text-blue-600 transition">
            Features
          </Link>
          <Link
            href="/dashboard/browse-events"
            className="hover:text-blue-600 transition"
          >
            Browse Events
          </Link>
          <Link href="/signin" className="hover:text-blue-600 transition">
            Get Started
          </Link>
        </div>

        {/* Right - Credit */}
        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SoccerHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
