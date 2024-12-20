import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";

// export async function verifyUser(
//   dispatch,
//   navigate,
//   setIsLoading = () => {},
//   protect = false,
//   path = "/"
// ) {
//   try {
//     const response = await axios.get(
//       `${import.meta.env.VITE_BACKEND_URL}user/auth`,
//       { withCredentials: true }
//     );

//     if (response.data.success) {
//       dispatch(setUser(response.data.user));
//       if (protect) navigate(path);
//     } else if (protect) {
//       navigate("/login"); // Redirect if user is not authorized and the route is protected
//     }
//   } catch (error) {
//     if (protect) navigate("/login"); // Redirect only for protected routes
//   } finally {
//     setIsLoading(false); // Finish loading
//   }
// }

function AuthenticateUser({ children, protect = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true); // Handle loading state

  useEffect(() => {
    async function verifyUser() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}user/auth`,
          { withCredentials: true }
        );

        if (response.data.success) {
          dispatch(setUser(response.data.user));
        } else if (protect) {
          navigate("/login"); // Redirect if user is not authorized and the route is protected
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        if (protect) navigate("/login"); // Redirect only for protected routes
      } finally {
        setIsLoading(false); // Finish loading
      }
    }

    verifyUser();
  }, [dispatch, navigate, protect]);

  if (isLoading) return <div>Loading...</div>; // Show a loader while checking

  return children;
}

function AuthenticateInstructor({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true); // Handle loading state

  useEffect(() => {
    async function verifyInstructor() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}user/auth`,
          { withCredentials: true }
        );

        if (response.data.success) {
          if (response.data.user.roles.includes("instructor")) {
            dispatch(setUser(response.data.user));
          } else {
            navigate("/");
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error verifying instructor:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    }

    verifyInstructor();
  }, [dispatch, navigate]);

  if (isLoading) return <div>Loading...</div>;

  return children;
}

function AuthenticateAdmin({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true); // Handle loading state

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}user/auth`,
          { withCredentials: true }
        );

        if (response.data.success) {
          if (response.data.user.roles.includes("admin")) {
            dispatch(setUser(response.data.user));
          } else {
            navigate("/");
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error verifying admin:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    }

    verifyAdmin();
  }, [dispatch, navigate]);

  if (isLoading) return <div>Loading...</div>;

  return children;
}

export { AuthenticateUser, AuthenticateInstructor, AuthenticateAdmin };
