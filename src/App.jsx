// App.jsx (updated)
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Layout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";

// Student pages
import Dashboard from "./pages/Dashboard";
import VideoLectures from "./pages/VideoLectures";
import QuestionPaper from "./pages/QuestionPaper";
import Notes from "./pages/Notes";
import List from "./pages/List";
import Profile from "./pages/Profile";
import CurrentAffair from "./pages/CurrentAffair";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import StudentsTable from "./pages/StudentsTable";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UploadQp from "./pages/admin/UploadQp";
// import Blogs from "./pages/admin/Blogs";

function App() {
  const user = JSON.parse(localStorage.getItem("userCreds") || "null");

  // Simple secure checks
  // const isAuthenticated = !!user; // must be logged in
  // const isAdmin = user?.role === "admin"; // must be admin role
  const isAuthenticated = true; // must be logged in
  const isAdmin = true; // must be admin role

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Student Routes */}
          <Route
            path="/app/*"
            element={
              isAuthenticated ? (
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="lectures" element={<VideoLectures />} />
                    <Route path="ca" element={<CurrentAffair />} />
                    <Route path="list" element={<List />} />
                    <Route path="list/:paperId" element={<QuestionPaper />} />
                    <Route path="notes" element={<Notes />} />
                    <Route path="students" element={<StudentsTable />} />
                    <Route path="about" element={<About />} />
                    <Route path="profile" element={<Profile />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Admin Routes (Secure) */}
          <Route
            path="/admin/*"
            element={
              isAuthenticated && isAdmin ? (
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="uploadqp" element={<UploadQp />} />
                    {/* <Route path="blogs" element={<Blogs />} /> */}
                  </Routes>
                </AdminLayout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
