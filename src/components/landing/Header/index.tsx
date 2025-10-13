"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

import menuData from "./menuData";
import { useActiveSection } from "@/hooks/useActiveSection";

const Header = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [dropdownToggler, setDropdownToggler] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { isAuthenticated, isLoading } = useAuth();

  const pathUrl = usePathname();
  
  // Section IDs for scroll-based active navigation
  const sectionIds = ['features', 'integration', 'faq', 'pricing', 'support'];
  const activeSection = useActiveSection({ sectionIds });

  // Helper function to determine if a menu item is active
  const isMenuItemActive = (menuItem: any) => {
    // For home page - active when on home path and either no section is active or at top
    if (menuItem.path === '/' && pathUrl === '/') {
      return !activeSection || scrollY < 100;
    }
    
    // For anchor links, check if the corresponding section is active
    if (menuItem.path?.startsWith('/#')) {
      const sectionId = menuItem.path!.substring(2); // Remove '#'
      return activeSection === sectionId;
    }
    
    return false;
  };

  // Custom smooth scroll function
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Close mobile menu if open
      setNavigationOpen(false);
    }
  };

  // Sticky menu and scroll tracking
  const handleStickyMenu = () => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    
    if (currentScrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    
    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 z-99999 w-full py-7 ${
        stickyMenu
          ? "bg-white py-4! shadow-sm transition duration-100 dark:bg-black"
          : ""
      }`}
    >
      <div className="relative mx-auto max-w-none items-center justify-between px-16 sm:px-20 lg:px-24 xl:flex">
        <div className="flex w-full items-center justify-between xl:w-1/4 pl-0">
          <Link href="/">
            <Image
              src="/images/logo/logo-dark.png"
              alt="Bluenote Logo - Dark Mode"
              width={119.03}
              height={30}
              className="hidden w-full dark:block"
            />
            <Image
              src="/images/logo/logo-light.png"
              alt="Blunote Logo - Light Mode"
              width={119.03}
              height={30}
              className="w-full dark:hidden"
            />
          </Link>

          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-label="hamburger Toggler"
            className="block xl:hidden"
            onClick={() => setNavigationOpen(!navigationOpen)}
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="absolute right-0 block h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 rounded-sm bg-black delay-0 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "w-full! delay-300" : "w-0"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "delay-400 w-full!" : "w-0"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "w-full! delay-500" : "w-0"
                  }`}
                ></span>
              </span>
              <span className="du-block absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "h-0! delay-0" : "h-full"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "h-0! delay-200" : "h-0.5"
                  }`}
                ></span>
              </span>
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}
        </div>

        {/* Nav Menu Start   */}
        <div
          className={`invisible h-0 w-full items-center justify-between xl:visible xl:flex xl:h-auto xl:w-full ${
            navigationOpen &&
            "navbar visible! mt-4 h-auto max-h-[400px] rounded-md bg-white p-7.5 shadow-solid-5 dark:bg-blacksection xl:h-auto xl:p-0 xl:shadow-none xl:dark:bg-transparent"
          }`}
        >
          <nav>
            <ul className="flex flex-col gap-5 xl:flex-row xl:items-center xl:gap-10">
              {menuData.map((menuItem, key) => (
                <li key={key} className={menuItem.submenu && "group relative"}>
                  {menuItem.submenu ? (
                    <>
                      <button
                        onClick={() => setDropdownToggler(!dropdownToggler)}
                        className="flex cursor-pointer items-center justify-between gap-3 hover:text-primary"
                      >
                        {menuItem.title}
                        <span>
                          <svg
                            className="h-3 w-3 cursor-pointer fill-waterloo group-hover:fill-primary"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                          >
                            <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                          </svg>
                        </span>
                      </button>

                      <ul
                        className={`dropdown ${dropdownToggler ? "flex" : ""}`}
                      >
                        {menuItem.submenu.map((item, key) => (
                          <li key={key} className="hover:text-primary">
                            <Link href={item.path || "#"}>{item.title}</Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (!menuItem.path) return;
                        
                        if (menuItem.path === '/') {
                          window.location.href = '/';
                        } else if (menuItem.path.startsWith('/#')) {
                          const sectionId = menuItem.path.substring(2);
                          smoothScrollTo(sectionId);
                        } else {
                          window.location.href = menuItem.path;
                        }
                      }}
                      className={
                        isMenuItemActive(menuItem)
                          ? "text-primary hover:text-primary font-medium"
                          : "hover:text-primary"
                      }
                    >
                      {menuItem.title}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-7 flex items-center gap-6 xl:mt-0">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Link
                    href="/recordings"
                    className="flex items-center justify-center rounded-full bg-blue-600 px-7.5 py-2.5 text-regular text-white duration-300 ease-in-out hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="text-regular font-medium text-waterloo hover:text-primary"
                    >
                      Sign in
                    </Link>

                    <Link
                      href="/signup"
                      className="flex items-center justify-center rounded-full bg-blue-600 px-7.5 py-2.5 text-regular text-white duration-300 ease-in-out hover:bg-blue-700"
                    >
                      Get Bluenote for free
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// w-full delay-300

export default Header;
