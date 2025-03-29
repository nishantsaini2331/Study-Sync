import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import { showProfileDropdown } from "../store/userSlice";

export function handleProfileDropDown(dispatch) {
  dispatch(showProfileDropdown(false));
}

const Header = () => {
  const { username, name, email, roles } = useSelector(
    (state) => state.user.user
  );
  const isShowProfileMenu = useSelector(
    (state) => state.user.showProfileDropdown
  );
  const dispatch = useDispatch();

  function handleProfileDropDown() {
    dispatch(showProfileDropdown(false));
  }

  useEffect(() => {
    document.title = "Study Sync";

    return () => {
      handleProfileDropDown(dispatch);
    };
  }, []);

  return (
    <>
      <header className="bg-white shadow relative p-4 h-[70px] border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">
            <Link to="/">Study Sync</Link>
          </div>
          <nav className="space-x-6">
            <Link to={"/"} className="text-gray-700 hover:text-blue-600">
              Home
            </Link>

            <Link
              to="/verify-certificate/your-certificate-id"
              className="text-gray-700 hover:text-blue-600"
            >
              Verify Certificate
            </Link>

            <Link to="/about" className="text-gray-700 hover:text-blue-600">
              About
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-blue-600">
              Courses
            </Link>

            {username ? (
              roles?.includes("admin") ? (
                ""
              ) : roles?.includes("instructor") ? (
                <Link
                  to="/instructor/dashboard"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Instructor
                </Link>
              ) : (
                <Link
                  to="/teachers"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Become a Teacher
                </Link>
              )
            ) : (
              <Link
                to="/teachers"
                className="text-gray-700 hover:text-blue-600"
              >
                Become a Teacher
              </Link>
            )}

            {username ? (
              <span
                className="text-gray-700 hover:text-blue-600"
                // onMouseOver={() => {
                //   dispatch(showProfileDropdown(true));
                // }}
                // onMouseLeave={() => {
                //   setTimeout(() => {
                //     dispatch(showProfileDropdown(false));
                //   }, 1000);
                // }}
                onClick={() => {
                  dispatch(showProfileDropdown(!isShowProfileMenu));
                }}
              >
                {name}
              </span>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
            )}
          </nav>
        </div>
        {isShowProfileMenu && <ProfileDropdown />}
      </header>
      <Outlet />
    </>
  );
};

export default Header;
