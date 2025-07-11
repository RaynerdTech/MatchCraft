// components/Header.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          SoccerZone
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
         <Link href="#about" className="hover:text-blue-600 transition">About</Link>
<Link href="#features" className="hover:text-blue-600 transition">Features</Link>
<Link href="/dashboard/browse-events" className="hover:text-blue-600 transition">Browse Events</Link>
<Link
  href="/signin"
  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
>
  Get Started
</Link>

        </nav>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-4 px-4 flex flex-col gap-4 text-gray-700 font-medium">
          <Link href="#about" onClick={toggleMenu}>About</Link>
          <Link href="#features" onClick={toggleMenu}>Features</Link>
          <Link href="/events" onClick={toggleMenu}>Browse Events</Link>
          <Link
            href="/auth/login"
            onClick={toggleMenu}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-full text-center"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
