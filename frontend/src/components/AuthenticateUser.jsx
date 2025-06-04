import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import { useNavigate, useParams } from "react-router-dom";
import { chechStudentEnrolled } from "../pages/CourseDetailsPage";
import { LoadingSpinner } from "./CommentSystem";

async function verifyUser(
  dispatch,
  navigate,
  protect = false,
  role = null,
  id = null,
  checkInstructor = false
) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}user/auth`,
      { withCredentials: true }
    );

    if (response.data.success) {
      const user = response.data.user;
      dispatch(setUser(user));

      //   if (checkInstructor && !user.instructorProfile) {
      //     navigate("/teaching/onbording");
      //     return;
      //   }

      if (checkInstructor && role === "instructor") {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}course/check-instructor/${id}`,
          { withCredentials: true }
        );

        if (!response.data.isOwner) {
          navigate("/instructor/dashboard");
          return;
        }
      }

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

      if (id && role === "student") {
        const enrolled = await chechStudentEnrolled(id);
        if (!enrolled) {
          navigate("/courses");
          return;
        }
      }
    } else if (protect) {
      navigate("/login");
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    if (protect) navigate("/login");
  }
}

function AuthenticationWrapper({
  children,
  protect = false,
  role = null,
  id = null,
  checkInstructor = false,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      await verifyUser(dispatch, navigate, protect, role, id, checkInstructor);
      setIsLoading(false);
    };

    checkUser();
  }, [dispatch, navigate, protect, id, checkInstructor]);

  if (isLoading)
    return (
      <div className="col-span-3 flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );

  return children;
}

function AuthenticateUser({ children, protect = false }) {
  return (
    <AuthenticationWrapper protect={protect}>{children}</AuthenticationWrapper>
  );
}

function AuthenticateInstructor({ children, checkInstructor = false }) {
  const { id } = useParams();
  return (
    <AuthenticationWrapper
      protect={true}
      role="instructor"
      checkInstructor={checkInstructor}
      id={id}
    >
      {children}
    </AuthenticationWrapper>
  );
}

function CheckStudentEnrollment({ children }) {
  const { id } = useParams();

  return (
    <AuthenticationWrapper protect={true} role="student" id={id}>
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

export {
  AuthenticateUser,
  AuthenticateInstructor,
  AuthenticateAdmin,
  CheckStudentEnrollment,
};
