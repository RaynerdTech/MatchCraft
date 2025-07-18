"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Search,
  CheckCircle,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed z-40 w-72 h-full bg-gradient-to-b from-gray-50 to-white border-r shadow-xl px-4 py-6 space-y-8 lg:hidden"
      >
        <SidebarHeader setIsOpen={setIsOpen} />
        <NavLinks pathname={pathname} setIsOpen={setIsOpen} />
      </motion.aside>

      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:h-full lg:border-r lg:bg-gradient-to-b lg:from-gray-50 lg:to-white lg:shadow-lg lg:px-5 lg:py-8 lg:space-y-8">
        <SidebarHeader />
        <NavLinks pathname={pathname} setIsOpen={setIsOpen} />
      </aside>
    </>
  );
}

function SidebarHeader({ setIsOpen }: { setIsOpen?: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            <Link
          href="/"
          
          aria-label="SoccerHub Home"
        >
         SH
        </Link>
        </div>
      </div>
      {setIsOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}

function NavLinks({
  pathname,
  setIsOpen,
}: {
  pathname: string;
  setIsOpen: (v: boolean) => void;
}) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const userId = session?.user?._id;
      if (!userId || !/^[0-9a-f]{24}$/i.test(userId)) return;

      try {
        const res = await fetch(`/api/users/${userId}/role`);
        const data = await res.json();
        if (res.ok && data.role) setUserRole(data.role);
      } catch (err) {
        console.error("Failed to fetch role:", err);
      }
    };

    if (session?.user?._id && !userRole) {
      fetchUserRole();
    }
  }, [session, userRole]);

  const links = [
    { label: "Home", href: "/dashboard", icon: <Home size={20} /> },
    {
      label: "Events",
      icon: <Calendar size={20} />,
      submenu: [
        {
          label: "Browse Events",
          href: "/dashboard/browse-events",
          icon: <Search size={16} />,
        },
        {
          label: "Create Event",
          href: "/dashboard/events",
          icon: <Plus size={16} />,
          roles: ["organizer", "admin"],
        },
      ],
    },
    userRole === "player"
      ? {
          label: "Joined Events",
          href: "/dashboard/joined-events",
          icon: <Calendar size={20} />,
        }
      : {
          label: "Created Events",
          href: "/dashboard/created-events",
          icon: <Calendar size={20} />,
        },

    { label: "Teams", href: "/dashboard/teams", icon: <Users size={20} /> },

    // 👇 ADD INVITES DROPDOWN FOR PLAYER ONLY
    userRole === "player" && {
      label: "Invites",
      icon: <Mail size={20} />,
      submenu: [
        {
          label: "All Invites",
          href: "/dashboard/teams/invites",
          icon: <Mail size={16} />,
        },
        {
          label: "Paid Invites",
          href: "/dashboard/teams/paid-invites",
          icon: <CheckCircle size={16} />,
        },
        {
          label: "Unpaid Invites",
          href: "/dashboard/teams/unpaid-invites",
          icon: <Calendar size={16} />,
        },
      ],
    },

    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: <Settings size={20} />,
    },
    {
      label: "Payments",
      href: "/dashboard/payments",
      icon: <Calendar size={20} />,
      roles: ["organizer", "admin"],
    },
    {
      label: "Verify Ticket",
      href: "/dashboard/events/verify",
      icon: <CheckCircle size={20} />,
      roles: ["organizer", "admin"],
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings size={20} />,
    },
  ];

  const filteredLinks = links
    .map((link) => {
      if (!link) return null;
      if (link.submenu) {
        const submenu = link.submenu.filter(
          (sub) => !sub.roles || sub.roles.includes(userRole || "")
        );
        return submenu.length ? { ...link, submenu } : null;
      }
      return !link.roles || link.roles.includes(userRole || "") ? link : null;
    })
    .filter(Boolean) as typeof links;

  return (
    <nav className="space-y-2">
      {filteredLinks.map(({ label, href, icon, submenu }) =>
        submenu ? (
          <div key={label} className="space-y-1">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === label ? null : label)
              }
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                openDropdown === label ||
                submenu.some((item) => pathname === item.href)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`${
                    openDropdown === label ||
                    submenu.some((item) => pathname === item.href)
                      ? "text-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  {icon}
                </span>
                <span className="font-medium">{label}</span>
              </div>
              {openDropdown === label ? (
                <ChevronUp size={18} className="text-gray-500" />
              ) : (
                <ChevronDown size={18} className="text-gray-500" />
              )}
            </button>

            <AnimatePresence>
              {openDropdown === label && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pl-11 space-y-1"
                >
                  {submenu.map(({ label: subLabel, href, icon: subIcon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                        pathname === href
                          ? "bg-blue-100 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {subIcon && (
                        <span className="text-gray-500">{subIcon}</span>
                      )}
                      {subLabel}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            key={href}
            href={href!}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
              pathname === href
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span
              className={pathname === href ? "text-blue-500" : "text-gray-500"}
            >
              {icon}
            </span>
            <span className="font-medium">{label}</span>
          </Link>
        )
      )}

      <div className="pt-4 mt-4 border-t border-gray-200">
        <button
          onClick={() => alert("Stay with us! This feature is coming soon.")}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} className="text-red-400" />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
