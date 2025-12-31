// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CircularProgress } from "@mui/material";
import theme from "./theme";
import "./index.css";
import PrivateRoute from "./component/PrivateRoute";

// Public pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Layout
const MainLayout = lazy(() => import("./layout/MainLayout"));

// Protected pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MockPapers = lazy(() => import("./pages/MockPapers")); // Mock Papers
const PYQPapers = lazy(() => import("./pages/PYQPapers")); // PYQ Papers
const QuestionPaper = lazy(() => import("./pages/QuestionPaper")); // Single Paper View

// Payment Gateway terms & policy pages imports
const ContactUs = lazy(() => import("./pages/policy/ContactUs"));
const TermsAndConditions = lazy(() =>
  import("./pages/policy/TermsAndConditions")
);
const PrivacyPolicy = lazy(() => import("./pages/policy/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/policy/RefundPolicy"));
const ShippingPolicy = lazy(() => import("./pages/policy/ShippingPolicy"));

const CurrentAffairs = lazy(() => import("./pages/CurrentAffairs"));
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

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
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

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />

                      {/* Mock Papers */}
                      <Route path="mock" element={<MockPapers />} />
                      {/* <Route path="mock/:paperId" element={<QuestionPaper />} /> */}

                      {/* PYQ Papers */}
                      <Route path="pyq" element={<PYQPapers />} />
                      {/* <Route path="pyq/:paperId" element={<QuestionPaper />} /> */}

                      {/* Other Pages */}
                      <Route path="ca" element={<CurrentAffairs />} />
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
      </BrowserRouter>
    </ThemeProvider>
  );
}
