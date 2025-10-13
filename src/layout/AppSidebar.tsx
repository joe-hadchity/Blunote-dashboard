"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import SidebarWidget from "./SidebarWidget";
import { 
  Users, 
  CalendarDays, 
  Plug,
  Settings,
  LifeBuoy,
  User,
  LogOut,
  ChevronDown,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AlertTriangle,
  Loader2,
  Video
} from "@/components/common/Icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    name: "Recordings",
    icon: <Video className="w-6 h-6" strokeWidth={1.5} />,
    path: "/recordings",
  },
  {
    name: "Upcomings",
    icon: <CalendarDays className="w-6 h-6" strokeWidth={1.5} />,
    path: "/calendar",
  },
  {
    name: "Integrations",
    icon: <Plug className="w-6 h-6" strokeWidth={1.5} />,
    path: "/integrations",
  },
];

const othersItems: NavItem[] = [];


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others" | "integrations";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleLogoutClick = () => {
    setIsProfileDropdownOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others" | "integrations"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center" // MODIFIED: Simplified layout
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {/* MODIFIED: Text is now only rendered when expanded */}
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}

              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown
                  strokeWidth={1.5}
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                } ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center" // MODIFIED: Simplified layout
                      : "lg:justify-start"
                  }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                 {/* MODIFIED: Text is now only rendered when expanded */}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );


 useEffect(() => {
    // No submenus in main navigation anymore, so clear any open submenus
    setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.profile-dropdown-container')) {
          setIsProfileDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others" | "integrations") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) return null;
      return { type: menuType, index };
    });
  };

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <>
      <aside
          className={`fixed flex flex-col top-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
          ${
            isExpanded || isMobileOpen
              ? "w-[320px] px-6"
              : "w-24 px-5" // MODIFIED: Wider collapsed width and more padding
          }
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
      >
        <div
          className={`py-8 flex ${
            !isExpanded ? "lg:justify-center" : "justify-start"
          }`}
        >
          <Link href="/recordings">
            {isExpanded || isMobileOpen ? (
              <Image
                className="dark:hidden"
                src="/images/logo/logo-light.png"
                alt="BlueNote Logo"
                width={150}
                height={40}
              />
            ) : (
              <Image
                className="dark:hidden"
                src="/images/logo/logo-icon.png"
                alt="BlueNote Logo"
                width={32}
                height={32}
              />
            )}
            {isExpanded || isMobileOpen ? (
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.png"
                alt="BlueNote Logo"
                width={150}
                height={40}
              />
            ) : (
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-icon.png"
                alt="BlueNote Logo"
                width={32}
                height={32}
              />
            )}
          </Link>
        </div>
        
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-5">
              {renderMenuItems(navItems, "main")}
            </div>
          </nav>
          {(isExpanded || isHovered || isMobileOpen) ? <SidebarWidget /> : null}
        </div>
        
        
        {/* User Profile Section */}
        <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="relative profile-dropdown-container">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                !isExpanded ? "justify-center" : "justify-start"
              }`}
            >
              <div className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shadow-md flex-shrink-0">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </div>
              {isExpanded && (
                <>
                  <div className="flex flex-col items-start">
                    <span className="text-base font-medium text-gray-800 dark:text-white">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                  <ChevronDown 
                    strokeWidth={1.5}
                    className={`w-5 h-5 ml-auto transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </>
              )}
            </button>
            
            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className={`absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-3 z-50 ${
                isExpanded ? "left-0 w-full" : "left-full ml-2 w-48"
              }`}>
                <Link
                  href="/settings"
                  className="flex items-center gap-4 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <Settings className="w-5 h-5" strokeWidth={1.5} />
                  Settings
                </Link>
                
                <Link
                  href="/support"
                  className="flex items-center gap-4 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <LifeBuoy className="w-5 h-5" strokeWidth={1.5} />
                  Support
                </Link>
                
                <Link
                  href="/profile"
                  className="flex items-center gap-4 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <User className="w-5 h-5" strokeWidth={1.5} />
                  Profile
                </Link>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                
                <button
                  className="flex items-center gap-4 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                  onClick={handleLogoutClick}
                >
                  <LogOut className="w-5 h-5" strokeWidth={1.5} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Floating Arrow Toggle Button */}
        <button
          onClick={handleSidebarToggle}
          className="absolute top-1/2 -right-3 w-6 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-r-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-center z-50 group"
          aria-label="Toggle Sidebar"
        >
          {isExpanded ? (
            <ChevronLeftIcon strokeWidth={1.5} className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
          ) : (
            <ChevronRightIcon strokeWidth={1.5} className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
          )}
        </button>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
                Are you sure you want to logout?
              </h3>
              
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                You will need to sign in again to access your account.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                      Logging out...
                    </>
                  ) : (
                    'Yes, Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppSidebar;
