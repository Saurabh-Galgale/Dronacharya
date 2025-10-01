// src/App.jsx
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
import CurrentAffairs from "./pages/CurrentAffairs";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import StudentsTable from "./pages/StudentsTable";
import BlogsPage from "./pages/BlogsPage";
import BlogDetail from "./pages/BlogDetail";
import Attendance from "./pages/Attendance";
import Shop from "./pages/Shop";
import Pet from "./pages/Pet";
import Subscription from "./pages/Subscription";
import Payment from "./pages/Payment";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UploadQp from "./pages/admin/UploadQp";
import AdminStudentsTable from "./pages/admin/AdminStudentsTable";
import BlogsAdminPage from "./pages/admin/BlogsAdminPage";
// Policy pages (new)
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refunds from "./pages/Refunds";
import Shipping from "./pages/Shipping";
// auth helpers
import { getToken, getUserFromToken } from "./services/authService";

/**
 * Simple auth guard using token presence and role from token.
 * This keeps your previous structure while using real auth state.
 */
function RequireAuth({ children, requiredRole }) {
  const token = getToken();
  if (!token) return <Navigate to="/" replace />;

  if (requiredRole) {
    const user = getUserFromToken();
    if (!user || user.role !== requiredRole) return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  // do NOT rely on localStorage.userCreds for auth — use token/cookie
  // but keep compatibility with legacy flows if needed.
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />

          {/* Policy pages - public (crawlable) */}
          <Route path="/terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/shipping" element={<Shipping />} />

          {/* Student routes - protected */}
          <Route
            path="/app/*"
            element={
              <RequireAuth>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="blogs" element={<BlogsPage />} />
                    <Route path="blogs/:id" element={<BlogDetail />} />
                    <Route path="lectures" element={<VideoLectures />} />
                    <Route path="ca" element={<CurrentAffairs />} />
                    <Route path="list" element={<List />} />
                    <Route path="list/:paperId" element={<QuestionPaper />} />
                    <Route path="notes" element={<Notes />} />
                    <Route path="students" element={<StudentsTable />} />
                    <Route path="about" element={<About />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/pet" element={<Pet />} />
                    <Route path="/subscription" element={<Subscription />} />
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route path="/payment" element={<Payment />} />
                  </Routes>
                </Layout>
              </RequireAuth>
            }
          />

          {/* Admin routes - protected by ADMIN role */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth requiredRole="ADMIN">
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="blogs" element={<BlogsAdminPage />} />
                    <Route path="blogs/:id" element={<BlogDetail />} />
                    <Route path="uploadqp" element={<UploadQp />} />
                    <Route
                      path="adm-students"
                      element={<AdminStudentsTable />}
                    />
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route path="attendance" element={<Attendance />} />
                  </Routes>
                </AdminLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
