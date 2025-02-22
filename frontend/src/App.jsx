import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthForm from "./pages/AuthForm";
import Header from "./components/Header";
import VerifyUser from "./components/VerifyUser";
import UpdateProfile from "./pages/UpdateProfile";
import TeacherPage from "./pages/TeacherPage";
import TeacherOnboard from "./pages/TeacherOnboard";
import {
  AuthenticateAdmin,
  AuthenticateInstructor,
  AuthenticateUser,
  CheckStudentEnrollment,
} from "./components/AuthenticateUser";
import InstructorDashboard from "./components/InstructorDashboard";
import CourseCreationForm from "./components/CourseCreationForm";
import CreateLecture from "./components/CreateLecture";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import CourseManagement from "./pages/CourseManagement";
import FinalQuizComponent from "./components/FinalQuizComponent";
import AdminDashboard from "./components/AdminDashboard";
import CoursesPage from "./pages/CoursesPage";
import CourseLearningPage from "./pages/CourseLearningPage";

function App() {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <AuthenticateUser>
              <Header />
            </AuthenticateUser>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthForm type="login" />} />
          <Route path="/register" element={<AuthForm type="register" />} />
          <Route
            path="/about"
            element={
              <h1 className="text-center mt-80 text-3xl">Coming Soon....</h1>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthenticateUser protect={true}>
                <UpdateProfile />
              </AuthenticateUser>
            }
          />
          <Route path="/teachers" element={<TeacherPage />} />

          <Route
            path="/teaching/onbording"
            element={
              <AuthenticateUser protect={true}>
                <TeacherOnboard />
              </AuthenticateUser>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <AuthenticateAdmin>
                <AdminDashboard />
              </AuthenticateAdmin>
            }
          />

          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:id" element={<CourseDetailsPage />} />
          <Route
            path="/course/:id/learn"
            element={
              <CheckStudentEnrollment>
                <CourseLearningPage />
              </CheckStudentEnrollment>
            }
          />
        </Route>

        <Route
          path="/verify-email/:verificationToken"
          element={<VerifyUser />}
        ></Route>

        <Route
          path="/instructor/dashboard"
          element={
            <AuthenticateInstructor>
              <InstructorDashboard />
            </AuthenticateInstructor>
          }
        />
        <Route
          path="/create-course"
          element={
            <AuthenticateInstructor>
              <CourseCreationForm />
            </AuthenticateInstructor>
          }
        />
        <Route
          path="/edit-course/:id"
          element={
            <AuthenticateInstructor checkInstructor={true}>
              <CourseCreationForm edit={true} />
            </AuthenticateInstructor>
          }
        />
        <Route
          path="/course-preview/:id"
          element={
            <AuthenticateInstructor checkInstructor={true}>
              <CourseManagement />
            </AuthenticateInstructor>
          }
        />
        <Route
          path="/create-lecture/:id"
          element={
            <AuthenticateInstructor checkInstructor={true}>
              <CreateLecture />
            </AuthenticateInstructor>
          }
        />

        <Route
          path="/edit-lecture/:id"
          element={
            <AuthenticateInstructor checkInstructor={true}>
              <CreateLecture edit={true} />
            </AuthenticateInstructor>
          }
        />
        <Route
          path="/create-final-quiz/:id"
          element={
            <AuthenticateInstructor checkInstructor={true}>
              <FinalQuizComponent />
            </AuthenticateInstructor>
          }
        />
        <Route
          path="/edit-final-quiz/:id"
          element={
            <AuthenticateInstructor checkInstructor={true}>
              <FinalQuizComponent edit={true} />
            </AuthenticateInstructor>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <AuthenticateAdmin>
              <h1>Admin Verify Course</h1>
            </AuthenticateAdmin>
          }
        />
        <Route
          path="/admin/verify-course/:id"
          element={
            <AuthenticateAdmin>
              <CourseManagement isVerify={true} />
            </AuthenticateAdmin>
          }
        />

        <Route path="/contact" element={<h1>Contact</h1>} />
      </Routes>
    </div>
  );
}

export default App;
