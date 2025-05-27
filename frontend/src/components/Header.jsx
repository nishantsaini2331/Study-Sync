import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import { Menu, X, User, GraduationCap, Home, Award, BookOpen } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { showProfileDropdown } from "../store/userSlice";

export function handleProfileDropDown(dispatch) {
  dispatch(showProfileDropdown(false));
}

function Header() {
  const { username, name, email, roles } = useSelector(
    (state) => state.user.user
  );
  const isShowProfileMenu = useSelector(
    (state) => state.user.showProfileDropdown
  );
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleProfileDropDown() {
    dispatch(showProfileDropdown(false));
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  useEffect(() => {
    document.title = "Study Sync";

    return () => {
      handleProfileDropDown(dispatch);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="bg-white shadow relative p-4 h-[70px] border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold text-blue-600">
            <Link to="/" onClick={closeMobileMenu}>
              Study Sync
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-gray-700 hover:text-blue-600 flex items-center gap-1">
              <Home size={16} />
              Home
            </Link>

            <Link
              to="/verify-certificate/your-certificate-id"
              className="text-gray-700 hover:text-blue-600 flex items-center gap-1"
            >
              <Award size={16} />
              Verify Certificate
            </Link>

            <Link to="/courses" className="text-gray-700 hover:text-blue-600 flex items-center gap-1">
              <BookOpen size={16} />
              Courses
            </Link>

            {username ? (
              roles?.includes("admin") ? (
                ""
              ) : roles?.includes("instructor") ? (
                <Link
                  to="/instructor/dashboard"
                  className="text-gray-700 hover:text-blue-600 flex items-center gap-1"
                >
                  <GraduationCap size={16} />
                  Instructor
                </Link>
              ) : (
                <Link
                  to="/teachers"
                  className="text-gray-700 hover:text-blue-600 flex items-center gap-1"
                >
                  <GraduationCap size={16} />
                  Become a Teacher
                </Link>
              )
            ) : (
              <Link
                to="/teachers"
                className="text-gray-700 hover:text-blue-600 flex items-center gap-1"
              >
                <GraduationCap size={16} />
                Become a Teacher
              </Link>
            )}

            {username ? (
              <span
                className="text-gray-700 hover:text-blue-600 cursor-pointer flex items-center gap-1"
                onClick={() => {
                  dispatch(showProfileDropdown(!isShowProfileMenu));
                }}
              >
                <User size={16} />
                {name}
              </span>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-blue-600 flex items-center gap-1">
                <User size={16} />
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-600 p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-container absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden z-50">
            <nav className="flex flex-col p-4 space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 flex items-center gap-2 py-2"
                onClick={closeMobileMenu}
              >
                <Home size={18} />
                Home
              </Link>

              <Link
                to="/verify-certificate/your-certificate-id"
                className="text-gray-700 hover:text-blue-600 flex items-center gap-2 py-2"
                onClick={closeMobileMenu}
              >
                <Award size={18} />
                Verify Certificate
              </Link>

              <Link 
                to="/courses" 
                className="text-gray-700 hover:text-blue-600 flex items-center gap-2 py-2"
                onClick={closeMobileMenu}
              >
                <BookOpen size={18} />
                Courses
              </Link>

              {username ? (
                roles?.includes("admin") ? (
                  ""
                ) : roles?.includes("instructor") ? (
                  <Link
                    to="/instructor/dashboard"
                    className="text-gray-700 hover:text-blue-600 flex items-center gap-2 py-2"
                    onClick={closeMobileMenu}
                  >
                    <GraduationCap size={18} />
                    Instructor
                  </Link>
                ) : (
                  <Link
                    to="/teachers"
                    className="text-gray-700 hover:text-blue-600 flex items-center gap-2 py-2"
                    onClick={closeMobileMenu}
                  >
                    <GraduationCap size={18} />
                    Become a Teacher
                  </Link>
                )
              ) : (
                <Link
                  to="/teachers"
                  className="text-gray-700 hover:text-blue-600 flex items-center gap-2 py-2"
                  onClick={closeMobileMenu}
                >
                  <GraduationCap size={18} />
                  Become a Teacher
                </Link>
              )}

              {username ? (
                <div className="border-t border-gray-200 pt-4">
                  <span
                    className="text-gray-700 hover:text-blue-600 cursor-pointer flex items-center gap-2 py-2"
                    onClick={() => {
                      dispatch(showProfileDropdown(!isShowProfileMenu));
                      closeMobileMenu();
                    }}
                  >
                    <User size={18} />
                    {name}
                  </span>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-blue-600 flex items-center gap-2 py-2"
                    onClick={closeMobileMenu}
                  >
                    <User size={18} />
                    Login
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}

        {/* Profile Dropdown */}
        {isShowProfileMenu && <ProfileDropdown />}
      </header>
      <Outlet />
    </>
  );
}

export default Header;