"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const { data: session } = useSession();
  if (!session?.user) return null; // 🔒 Hide sidebar if not logged in

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-100 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white shadow-xl transition-transform duration-100 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarHeader setIsOpen={setIsOpen} />
        <div className="flex-1 overflow-y-auto">
          <NavLinks setIsOpen={setIsOpen} />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:border-r lg:border-gray-200 lg:bg-gradient-to-b from-gray-50 to-white shadow-lg">
        <SidebarHeader />
        <div className="flex-1 overflow-y-auto">
          <NavLinks setIsOpen={setIsOpen} />
        </div>
      </aside>
    </>
  );
}

function SidebarHeader({ setIsOpen }: { setIsOpen?: (v: boolean) => void }) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between px-4 py-6">
      <div className="flex items-center gap-2">
        <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
          <Link href="/" aria-label="SoccerHub Home">
            SH
          </Link>
        </div>
        <Link
          href="/"
          className="hidden lg:block text-gray-800 font-semibold text-lg"
        >
          SoccerHub
        </Link>
      </div>
      {setIsOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-full p-1 transition-colors hover:bg-gray-200"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}

function NavLinks({ setIsOpen }: { setIsOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "player";

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
          (sub) => !sub.roles || sub.roles.includes(userRole)
        );
        return submenu.length ? { ...link, submenu } : null;
      }
      return !link.roles || link.roles.includes(userRole) ? link : null;
    })
    .filter(Boolean);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <nav className="flex h-full flex-col justify-between px-4 pb-6">
      <div className="space-y-2">
        {filteredLinks.map(({ label, href, icon, submenu }) =>
          submenu ? (
            <div key={label} className="space-y-1">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === label ? null : label)
                }
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 ${
                  openDropdown === label ||
                  submenu.some((item) => pathname === item.href)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{icon}</span>
                  <span className="font-medium">{label}</span>
                </div>
                {openDropdown === label ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>

              {openDropdown === label && (
                <div className="space-y-1 pl-11">
                  {submenu.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                        pathname === subItem.href
                          ? "bg-blue-100 font-medium text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {subItem.icon && (
                        <span className="text-gray-500">{subItem.icon}</span>
                      )}
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={href}
              href={href!}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                pathname === href
                  ? "bg-blue-50 font-medium text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-gray-500">{icon}</span>
              <span className="font-medium">{label}</span>
            </Link>
          )
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4 pb-10">
        {/* Added `pb-10` to push up logout on mobile */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-500 hover:bg-red-50"
        >
          <LogOut size={20} className="text-red-400" />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
