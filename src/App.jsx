// src/App.jsx
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

// Eager (small, public) pages — keep these eager for snappy first load
import LandingPage from "./pages/LandingPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refunds from "./pages/Refunds";
import Shipping from "./pages/Shipping";

// Auth helpers remain eager (they are small and synchronous)
import { getToken, getUserFromToken } from "./services/authService";

/**
 * Lazy-loaded pieces (big / rarely needed on first paint)
 */
const Layout = lazy(() => import("./layout/MainLayout"));
const AdminLayout = lazy(() => import("./layout/AdminLayout"));

// Student pages (lazy)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VideoLectures = lazy(() => import("./pages/VideoLectures"));
const QuestionPaper = lazy(() => import("./pages/QuestionPaper"));
const Notes = lazy(() => import("./pages/Notes"));
const List = lazy(() => import("./pages/List"));
const Profile = lazy(() => import("./pages/Profile"));
const CurrentAffairs = lazy(() => import("./pages/CurrentAffairs"));
const About = lazy(() => import("./pages/About"));
const StudentsTable = lazy(() => import("./pages/StudentsTable"));
const BlogsPage = lazy(() => import("./pages/BlogsPage"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Shop = lazy(() => import("./pages/Shop"));
const Pet = lazy(() => import("./pages/Pet"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Payment = lazy(() => import("./pages/Payment"));

// Admin pages (lazy)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UploadQp = lazy(() => import("./pages/admin/UploadQp"));
const AdminStudentsTable = lazy(() =>
  import("./pages/admin/AdminStudentsTable")
);
const BlogsAdminPage = lazy(() => import("./pages/admin/BlogsAdminPage"));

/**
 * Small helper to determine if a stored token appears still valid.
 * - Uses getToken() and getUserFromToken() (your existing helpers).
 * - If token has exp claim, ensures it's in the future.
 * - Returns boolean.
 */
function isTokenValid() {
  const token = getToken();
  if (!token) return false;

  const payload = getUserFromToken();
  if (!payload) return false;

  // if `exp` present (seconds since epoch), ensure not expired
  if (payload.exp && typeof payload.exp === "number") {
    const expiryMs = payload.exp * 1000;
    if (Date.now() >= expiryMs) return false;
  }

  // optionally you could check issued-at (iat), notBefore, etc.
  return true;
}

/**
 * Simple auth guard using token presence and role from token.
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

/**
 * Small Suspense wrapper for route-level fallback.
 */
function RouteSuspense({ children, fallback = null }) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

function App() {
  // On the public root route, if a valid token exists in storage, redirect to /app/dashboard.
  // This solves the "close tab, open new tab, landing page shown even though token exists" issue.
  const redirectToAppIfAuthed = isTokenValid();

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public - redirect to /app/dashboard when token in storage is valid */}
          <Route
            path="/"
            element={
              redirectToAppIfAuthed ? (
                <Navigate to="/app/dashboard" replace />
              ) : (
                <LandingPage />
              )
            }
          />

          {/* Policy pages - public (keep these eager for SEO/readability) */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/shipping" element={<Shipping />} />

          {/* Student routes - protected */}
          <Route
            path="/app/*"
            element={
              <RequireAuth>
                <RouteSuspense fallback={<div />}>
                  <Layout>
                    <Routes>
                      <Route
                        path="dashboard"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <Dashboard />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="blogs"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <BlogsPage />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="blogs/:id"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <BlogDetail />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="lectures"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <VideoLectures />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="ca"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <CurrentAffairs />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="list"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <List />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="list/:paperId/view"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <QuestionPaper />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="notes"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <Notes />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="students"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <StudentsTable />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="about"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <About />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <Profile />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="attendance"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <Attendance />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="shop"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <Shop />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="pet"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <Pet />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="subscription"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <Subscription />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="payment"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <Payment />
                          </RouteSuspense>
                        }
                      />

                      {/* default to /app/dashboard */}
                      <Route
                        index
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </Layout>
                </RouteSuspense>
              </RequireAuth>
            }
          />

          {/* Admin routes - protected by ADMIN role */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth requiredRole="ADMIN">
                <RouteSuspense fallback={<div />}>
                  <AdminLayout>
                    <Routes>
                      <Route
                        path="dashboard"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <AdminDashboard />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="blogs"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <BlogsAdminPage />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="blogs/:id"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <BlogDetail />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="uploadqp"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <UploadQp />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        path="adm-students"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <AdminStudentsTable />
                          </RouteSuspense>
                        }
                      />
                      <Route
                        index
                        element={<Navigate to="dashboard" replace />}
                      />
                      <Route
                        path="attendance"
                        element={
                          <RouteSuspense fallback={<div />}>
                            <Attendance />
                          </RouteSuspense>
                        }
                      />
                    </Routes>
                  </AdminLayout>
                </RouteSuspense>
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
