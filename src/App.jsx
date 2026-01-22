// src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CircularProgress } from "@mui/material";
import theme from "./theme";
import "./index.css";
import PrivateRoute from "./component/PrivateRoute";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import ForceLogoutModal from "./component/ForceLogoutModal";

// Public pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Layout
const MainLayout = lazy(() => import("./layout/MainLayout"));

// Protected pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PerformanceAnalysis = lazy(() => import("./pages/PerformanceAnalysis"));
const MockPapers = lazy(() => import("./pages/MockPapers")); // Mock Papers
const PYQPapers = lazy(() => import("./pages/PYQPapers")); // PYQ Papers
const ShortPapers = lazy(() => import("./pages/ShortPapers"));
const SubjectPapers = lazy(() => import("./pages/SubjectPapers"));
const QuestionPaper = lazy(() => import("./pages/QuestionPaper")); // Single Paper View

// Payment Gateway terms & policy pages imports
const ContactUs = lazy(() => import("./pages/policy/ContactUs"));
const TermsAndConditions = lazy(
  () => import("./pages/policy/TermsAndConditions"),
);
const PrivacyPolicy = lazy(() => import("./pages/policy/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/policy/RefundPolicy"));
const ShippingPolicy = lazy(() => import("./pages/policy/ShippingPolicy"));

const CurrentAffairs = lazy(() => import("./pages/CurrentAffairs"));
const MagazineView = lazy(() => import("./pages/MagazineView"));
const Blogs = lazy(() => import("./pages/Blogs"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Profile = lazy(() => import("./pages/Profile"));

// Loading fallback
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="background.default"
  >
    <CircularProgress size={40} />
  </Box>
);

const AppContent = () => {
  const { isLoggingOut, handleLogout, triggerForceLogout } = useAuth();

  useEffect(() => {
    const handleForceLogout = () => {
      triggerForceLogout();
    };

    window.addEventListener("forceLogout", handleForceLogout);

    return () => {
      window.removeEventListener("forceLogout", handleForceLogout);
    };
  }, [triggerForceLogout]);

  return (
    <>
      <ForceLogoutModal open={isLoggingOut} onLogout={handleLogout} />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/shipping-and-delivery" element={<ShippingPolicy />} />

          <Route
            path="/mock/:paperId"
            element={
              <PrivateRoute>
                <QuestionPaper />
              </PrivateRoute>
            }
          />
          <Route
            path="/pyq/:paperId"
            element={
              <PrivateRoute>
                <QuestionPaper />
              </PrivateRoute>
            }
          />
          <Route
            path="/short/:paperId"
            element={
              <PrivateRoute>
                <QuestionPaper />
              </PrivateRoute>
            }
          />
          <Route
            path="/subject/:paperId"
            element={
              <PrivateRoute>
                <QuestionPaper />
              </PrivateRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="analysis" element={<PerformanceAnalysis />} />
                    {/* Mock Papers */}
                    <Route path="mock" element={<MockPapers />} />
                    {/* <Route path="mock/:paperId" element={<QuestionPaper />} /> */}

                    {/* PYQ Papers */}
                    <Route path="pyq" element={<PYQPapers />} />
                    {/* <Route path="pyq/:paperId" element={<QuestionPaper />} /> */}
                    <Route path="short" element={<ShortPapers />} />
                    <Route path="subject" element={<SubjectPapers />} />

                    {/* Other Pages */}
                    <Route path="ca" element={<CurrentAffairs />} />
                    <Route path="ca/:magazineId" element={<MagazineView />} />
                    <Route path="blogs" element={<Blogs />} />
                    <Route path="subscription" element={<Subscription />} />
                    <Route path="profile" element={<Profile />} />

                    {/* Default redirect */}
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />

                    {/* 404 fallback */}
                    <Route
                      path="*"
                      element={<Navigate to="dashboard" replace />}
                    />
                  </Routes>
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
