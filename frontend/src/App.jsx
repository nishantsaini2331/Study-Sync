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
} from "./components/AuthenticateUser";
import InstructorDashboard from "./components/InstructorDashboard";
import CourseCreationForm from "./components/CourseCreationForm";
import CreateLecture from "./components/CreateLecture";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import CourseManagement from "./pages/CourseManagement";
import FinalQuizComponent from "./components/FinalQuizComponent";
import AdminDashboard from "./components/AdminDashboard";

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

          <Route path="/course" element={<CourseDetailsPage />} />

          <Route
            path="/admin/dashboard"
            element={
              <AuthenticateAdmin>
                <AdminDashboard />
              </AuthenticateAdmin>
            }
          />

          <Route path="/courses" element={<h1>Courses</h1>} />
        </Route>

        <Route
          path="/course-preview/:courseId"
          element={<CourseManagement />}
        />
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
          path="/create-lecture/:id"
          element={
            <AuthenticateInstructor>
              <CreateLecture />
            </AuthenticateInstructor>
          }
        />
        <Route
          path="/edit-course/:id"
          element={
            <AuthenticateInstructor>
              <CourseCreationForm edit={true} />
            </AuthenticateInstructor>
          }
        />
        <Route
          path="/edit-lecture/:id"
          element={
            <AuthenticateInstructor>
              <CreateLecture edit={true} />
            </AuthenticateInstructor>
          }
        />

        <Route
          path="/edit-final-quiz/:courseId"
          element={
            <AuthenticateInstructor>
              <FinalQuizComponent edit={true} />
            </AuthenticateInstructor>
          }
        />

        <Route
          path="/create-final-quiz/:courseId"
          element={
            <AuthenticateInstructor>
              <FinalQuizComponent />
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
          path="/admin/verify-course/:courseId"
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
