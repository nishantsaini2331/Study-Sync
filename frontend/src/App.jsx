import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthForm from "./pages/AuthForm";
import Header from "./components/Header";
import VerifyUser from "./components/VerifyUser";
import UpdateProfile from "./pages/UpdateProfile";
import TeacherPage from "./pages/TeacherPage";
import TeacherOnboard from "./pages/TeacherOnboard";
import {
  AuthenticateInstructor,
  AuthenticateUser,
} from "./components/AuthenticateUser";
import InstructorDashboard from "./components/InstructorDashboard";

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
        <Route path="/contact" element={<h1>Contact</h1>} />
      </Routes>
    </div>
  );
}

export default App;
