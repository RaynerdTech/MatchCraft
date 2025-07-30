"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as HTMLElement).closest("header")) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { href: "#about", text: "About", icon: "📋" },
    { href: "#features", text: "Features", icon: "🎮" },
    { href: "/dashboard/browse-events", text: "Browse Events", icon: "🏟" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-blue-600/90 backdrop-blur-md shadow-lg"
          : "bg-blue-600/80 backdrop-blur-sm"
      }`}
    >
      {/* Pitch background visible on desktop and mobile */}
      <div className="absolute inset-0 z-[-1] opacity-60">
        <div className="absolute inset-0 bg-[url('/images/pitch-pattern.jpg')] bg-cover bg-bottom mix-blend-overlay"></div>
      </div>

      {/* Main container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-white hover:text-blue-100 transition-colors flex items-center"
            aria-label="SoccerHub Home"
          >
            <span className="font-barlow-condensed tracking-tight">S</span>
            <span className="relative"> 
              <span className="relative inline-block w-6 h-6">
                <Image
                  src="/images/football-icon.png"
                  alt="Football"
                  width={24}
                  height={24}
                  className="animate-spin-slow"
                />
              </span>
              <span className="text-white">ccerHub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-blue-100 transition-colors font-medium group flex items-center"
              >
                <span className="mr-1.5 opacity-80 group-hover:opacity-100 group-hover:animate-bounce">
                  {link.icon}
                </span>
                <span className="font-barlow-condensed text-lg tracking-wide">
                  {link.text}
                </span>
              </Link>
            ))}
            <Link
              href="/signin"
              className="ml-4 px-6 py-2.5 bg-white text-blue-600 rounded-full hover:bg-blue-100 transition-all font-bold hover:animate-wobble focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              <span className="flex items-center">
                <span className="mr-2">⚽</span>
                Get Started
              </span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-white hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-96 py-4 backdrop-blur-md" : "max-h-0 py-0"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="px-4 py-3 rounded-md text-lg font-medium text-white hover:bg-blue-600/50 transition-colors flex items-center"
            >
              <span className="mr-3">{link.icon}</span>
              {link.text}
            </Link>
          ))}
          <Link
            href="/signin"
            onClick={closeMenu}
            className="block w-full px-4 py-3 bg-white text-blue-600 rounded-full text-center font-bold hover:bg-blue-100 transition-all mt-2"
          >
            <span className="flex items-center justify-center">
              <span className="mr-2">⚽</span>
              Get Started
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
