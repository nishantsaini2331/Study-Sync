import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";

async function verifyUser(dispatch, navigate, protect = false, role = null) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}user/auth`,
      { withCredentials: true }
    );

    if (response.data.success) {
      const user = response.data.user;
      dispatch(setUser(user));

      if (role === "instructor" && user.roles.includes("admin")) {
        navigate("/admin/dashboard");
        return;
      }

      if (role === "admin" && user.roles.includes("instructor")) {
        navigate("/instructor/dashboard");
        return;
      }

      if (role && !user.roles.includes(role)) {
        navigate("/unauthorized");
        return;
      }
    } else if (protect) {
      navigate("/login");
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    if (protect) navigate("/login");
  }
}

function AuthenticationWrapper({ children, protect = false, role = null }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      await verifyUser(dispatch, navigate, protect, role);
      setIsLoading(false);
    };

    checkUser();
  }, [dispatch, navigate, protect]);

  if (isLoading) return <div>Loading...</div>;

  return children;
}

function AuthenticateUser({ children, protect = false }) {
  return (
    <AuthenticationWrapper protect={protect}>{children}</AuthenticationWrapper>
  );
}

function AuthenticateInstructor({ children }) {
  return (
    <AuthenticationWrapper protect={true} role="instructor">
      {children}
    </AuthenticationWrapper>
  );
}

function AuthenticateAdmin({ children }) {
  return (
    <AuthenticationWrapper protect={true} role="admin">
      {children}
    </AuthenticationWrapper>
  );
}

export { AuthenticateUser, AuthenticateInstructor, AuthenticateAdmin };
