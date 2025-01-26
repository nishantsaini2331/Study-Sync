import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, showProfileDropdown } from "../store/userSlice";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { handleProfileDropDown } from "./Header";

function ProfileDropdown() {
  const user = useSelector((state) => state.userSlice.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}user/logout`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        dispatch(setUser(null));
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(showProfileDropdown(false));
      navigate("/");
    }
  }

  return (
    <div
      onMouseOver={() => {
        dispatch(showProfileDropdown(true));
      }}
      onMouseLeave={() => {
        setTimeout(() => {
          dispatch(showProfileDropdown(false));
        }, 1000);
      }}
      className="w-72 bg-white border rounded-lg shadow-lg absolute top-16 right-4 z-10"
    >
      {/* Header */}
      <Link to={"/profile"}>
        <div className="p-4 flex items-center border-b">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt="user"
              className="w-12 h-12 rounded-full "
            />
          ) : (
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name}&background=random&length=1&rounded=true`}
              alt="user"
              className="w-12 h-12 rounded-full"
            />
          )}
          <div className="ml-4">
            <h3 className="font-bold text-gray-800">Nishant Saini</h3>
            <p className="text-sm text-gray-500">ns0109375@gmail.com</p>
          </div>
        </div>
      </Link>

      {/* Menu Items */}
      <ul className="py-2">
        {/* Section 1 */}
        <li className="p-2 hover:bg-gray-100 cursor-pointer">My learning</li>
        {/* <li className="p-2 hover:bg-gray-100 cursor-pointer">My cart</li>
        <li className="p-2 hover:bg-gray-100 cursor-pointer">Wishlist</li> */}

        {user?.roles?.includes("instructor") ? (
          <Link to={"/instructor/dashboard"}>
            <li className="p-2 hover:bg-gray-100 cursor-pointer">
              Instructor dashboard
            </li>
          </Link>
        ) : (
          <Link to={"/teachers"}>
            <li className="p-2 hover:bg-gray-100 cursor-pointer">
              Become an instructor
            </li>
          </Link>
        )}

        {/* Divider */}
        <hr className="my-2 border-gray-200" />

        {/* Section 2 */}
        <li className="p-2 hover:bg-gray-100 cursor-pointer">Notifications</li>
        {/* <li className="p-2 hover:bg-gray-100 cursor-pointer">Messages</li> */}

        {/* Divider */}
        <hr className="my-2 border-gray-200" />

        {/* Section 3 */}
        <li className="p-2 hover:bg-gray-100 cursor-pointer">
          Account settings
        </li>
        {/* <li className="p-2 hover:bg-gray-100 cursor-pointer">
          Payment methods
        </li> */}
        {/* <li className="p-2 hover:bg-gray-100 cursor-pointer">Subscriptions</li> */}
        <li className="p-2 hover:bg-gray-100 cursor-pointer">
          Purchase history
        </li>

        {/* Divider */}
        <hr className="my-2 border-gray-200" />

        {/* Section 4 */}
        {/* <li className="p-2 flex justify-between items-center hover:bg-gray-100 cursor-pointer">
          Language <span className="text-gray-500">English 🌐</span>
        </li> */}

        {/* Divider */}
        {/* <hr className="my-2 border-gray-200" /> */}

        {/* Section 5 */}
        <li className="p-2 hover:bg-gray-100 cursor-pointer">Public profile</li>
        <li
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleProfileDropDown(dispatch)}
        >
          <Link to={"/profile"}>Edit profile</Link>
        </li>

        {/* Divider */}
        <hr className="my-2 border-gray-200" />

        {/* Section 6 */}
        <li className="p-2 hover:bg-gray-100 cursor-pointer">
          Help and Support
        </li>
        <li
          onClick={handleLogout}
          className="p-2 hover:bg-gray-100 cursor-pointer text-red-500 font-medium"
        >
          Log out
        </li>
      </ul>
    </div>
  );
}

export default ProfileDropdown;
