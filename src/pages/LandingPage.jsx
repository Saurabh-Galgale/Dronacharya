// src/pages/LandingPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  lazy,
} from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Drawer,
  useMediaQuery,
  Button,
  CircularProgress,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import { signInWithGoogle, signInAdmin } from "../services/authService";

// lazy load GoogleOneClick so it does not mount / load unless needed
const GoogleOneClick = lazy(() => import("../component/GoogleOneClick"));

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

// images (public folder)
const images = [
  "/images/slide1.webp",
  "/images/slide2.webp",
  "/images/slide3.webp",
  "/images/slide4.webp",
  "/images/slide5.webp",
  "/images/slide6.webp",
  "/images/slide7.webp",
  "/images/slide8.webp",
  "/images/slide9.webp",
];

// preload cache
const imageCache = new Map();

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // carousel state
  const [index, setIndex] = useState(0);

  // drawer states
  const [adminDrawer, setAdminDrawer] = useState(false);
  const [userDrawer, setUserDrawer] = useState(false); // <-- user drawer

  // click ref for double-click detection
  const lastClickRef = useRef(0);

  // loading / error states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [adminGoogleLoading, setAdminGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);

  // whether Google Identity SDK appears available
  const [googleSdkReady, setGoogleSdkReady] = useState(false);

  // Preload current + next carousel images
  useEffect(() => {
    const preload = (src) => {
      if (!src || imageCache.has(src)) return;
      const img = new Image();
      img.src = src;
      img.onload = () => imageCache.set(src, true);
      img.onerror = () => imageCache.set(src, false);
    };
    preload(images[index]);
    const nextIndex = (index + 1) % images.length;
    preload(images[nextIndex]);
  }, [index]);

  // Detect Google Identity SDK readiness. Retry a few times in early life-cycle.
  useEffect(() => {
    let tries = 0;
    const maxTries = 6;
    const interval = 800; // ms

    const check = () => {
      tries += 1;
      const ok = !!(
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      );
      if (ok) {
        setGoogleSdkReady(true);
      } else if (tries < maxTries) {
        setTimeout(check, interval);
      } else {
        setGoogleSdkReady(false);
        console.warn(
          "Google Identity SDK not detected after retries. Ensure <script src='https://accounts.google.com/gsi/client' async defer></script> is present in index.html and client id configured."
        );
      }
    };
    check();
  }, []);

  // user sign-in handler (Google id token)
  const handleGoogleIdToken = useCallback(
    async (idToken) => {
      try {
        setGoogleLoading(true);
        setErrorMsg(null);
        await signInWithGoogle(idToken);
        setUserDrawer(false); // close drawer on success
        navigate("/app/dashboard");
      } catch (err) {
        console.error("Google sign-in failed:", err);
        setErrorMsg(err.message || "Sign-in failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    [navigate]
  );

  // admin sign-in handler (same UI, different backend endpoint)
  const handleAdminGoogleIdToken = useCallback(
    async (idToken) => {
      try {
        setAdminGoogleLoading(true);
        setErrorMsg(null);
        await signInAdmin(idToken);
        setAdminDrawer(false);
        navigate("/admin/dashboard");
      } catch (err) {
        console.error("Admin Google sign-in failed:", err);
        setErrorMsg(err.message || "Admin sign-in failed");
      } finally {
        setAdminGoogleLoading(false);
      }
    },
    [navigate]
  );

  // manual fallback action when Google button isn't available
  const onFallbackSignInClick = () => {
    alert(
      'Google sign-in not available.\n\nChecklist:\n1) Ensure the Google Identity script is included in public/index.html:\n   <script src="https://accounts.google.com/gsi/client" async defer></script>\n2) Ensure your Google client ID is set in environment variables and accessible to the frontend.\n3) Check browser console for errors and network tab for accounts.google.com requests.\n\nOpen console for details (Ctrl+Shift+J / Cmd+Option+J).'
    );
    console.warn(
      "Fallback Google sign-in pressed. window.google:",
      window.google
    );
  };

  // logo double click → open admin drawer
  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickRef.current < 600) {
      setAdminDrawer(true);
    }
    lastClickRef.current = now;
  };

  // carousel controls
  const handleChangeIndex = useCallback(
    (i) => {
      if (i === images.length) setIndex(0);
      else if (i < 0) setIndex(images.length - 1);
      else setIndex(i);
    },
    [images.length]
  );

  // render either GoogleOneClick (if sdk ready) or fallback visible button
  function RenderGoogleButton({ isAdmin = false, loading = false }) {
    if (googleSdkReady) {
      // lazy-loaded component used for admin or user, but handler differs
      return (
        <Suspense fallback={<CircularProgress size={24} />}>
          <GoogleOneClick
            onSuccess={isAdmin ? handleAdminGoogleIdToken : handleGoogleIdToken}
            loading={loading}
          />
        </Suspense>
      );
    }
    // fallback visible button
    return (
      <Button
        variant="contained"
        onClick={onFallbackSignInClick}
        sx={{
          background: "linear-gradient(135deg, #de6925, #f8b14a)",
          color: "black",
          px: 3,
          py: 1,
          borderRadius: "30px",
        }}
      >
        Sign in with Google
      </Button>
    );
  }

  return (
    <Box
      display="flex"
      height="100vh"
      position="relative"
      sx={{ overflow: "hidden" }}
    >
      {/* Carousel Background */}
      <Box flex={1} height="100%" position="relative">
        <AutoPlaySwipeableViews
          index={index}
          onChangeIndex={handleChangeIndex}
          enableMouseEvents
          interval={10000}
          style={{ height: "100%" }}
        >
          {images.map((src, i) => (
            <Box
              key={i}
              height="100vh"
              display="flex"
              justifyContent="center"
              alignItems="center"
              bgcolor="black"
              sx={{ display: Math.abs(index - i) > 1 ? "none" : "flex" }}
            >
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100vh",
                  objectFit: isMobile ? "cover" : "contain",
                }}
              />
            </Box>
          ))}
        </AutoPlaySwipeableViews>

        {/* Logo + Title (double-click to open admin sign-in drawer) */}
        <Box
          position="absolute"
          top={20}
          left="50%"
          zIndex={20}
          maxWidth="100%"
          sx={{
            transform: "translateX(-50%)",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
          }}
        >
          <img
            src="/images/logo.jpeg"
            alt="Dronacharya Logo"
            style={{
              height: isMobile ? 30 : 56,
              objectFit: "contain",
              paddingBottom: 6,
              cursor: "pointer",
            }}
            onClick={handleLogoClick}
          />
          <Typography
            variant={isMobile ? "h6" : "h4"}
            fontWeight="bold"
            sx={{
              letterSpacing: 1,
              fontFamily: "'Gotu', sans-serif",
              whiteSpace: "nowrap",
              lineHeight: 1.6,
              display: "inline-block",
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            द्रोणाचार्य करिअर अकॅडमी
          </Typography>
        </Box>

        {/* Carousel dots */}
        <Box
          position="absolute"
          bottom={isMobile ? 80 : 40}
          left="50%"
          zIndex={15}
          sx={{ transform: "translateX(-50%)", display: "flex", gap: "10px" }}
        >
          {images.map((_, i) => (
            <Box
              key={i}
              onClick={() => setIndex(i)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background:
                  index === i
                    ? "linear-gradient(135deg, #de6925, #f8b14a)"
                    : "rgba(255,255,255,0.4)",
                boxShadow:
                  index === i ? "0 0 8px rgba(255, 200, 100, 0.8)" : "none",
              }}
            />
          ))}
        </Box>

        {/* Mobile CTA area: show a simple Log In button that opens user drawer (no Google component mounted here) */}
        {isMobile && (
          <Box
            position="absolute"
            bottom={20}
            left="50%"
            zIndex={30}
            maxWidth="100%"
            sx={{
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Button
              variant="contained"
              onClick={() => setUserDrawer(true)}
              startIcon={<LoginIcon sx={{ color: "black" }} />}
              sx={{
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                color: "black",
                px: 4,
                py: 0.8,
                borderRadius: "30px",
                fontWeight: "600",
                letterSpacing: 0.5,
                fontSize: "1rem",
              }}
            >
              साइन इन
            </Button>
          </Box>
        )}
      </Box>

      {/* Right side panel for desktop/tablet: simplified — a Log In button that opens the user drawer */}
      {!isMobile && (
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={5}
          sx={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            px: 4,
            position: "relative",
          }}
        >
          <Box sx={{ textAlign: "center", width: "100%", maxWidth: 420 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: "white", mb: 2 }}
            >
              Welcome
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}
            >
              Sign in to access question papers, current affairs and mock tests.
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Button
                variant="contained"
                onClick={() => setUserDrawer(true)}
                sx={{
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  color: "black",
                  px: 3,
                  py: 1,
                  borderRadius: "30px",
                }}
              >
                साइन इन
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Admin Drawer (unchanged) — contains same Google button but calls admin endpoint */}
      <Drawer
        anchor="bottom"
        open={adminDrawer}
        onClose={() => setAdminDrawer(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px 20px 0 0",
            height: "20%",
            p: 3,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
            प्रशासक साइन इन
          </Typography>

          {adminGoogleLoading ? (
            <Typography sx={{ color: "white" }}>Signing in…</Typography>
          ) : (
            <RenderGoogleButton isAdmin={true} loading={adminGoogleLoading} />
          )}
        </Box>
      </Drawer>

      {/* User Drawer — GoogleOneClick mounts only here when user opens drawer */}
      <Drawer
        anchor="bottom"
        open={userDrawer}
        onClose={() => setUserDrawer(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px 20px 0 0",
            height: "30%", // a bit larger for user drawer
            p: 3,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
            साइन इन
          </Typography>

          {googleLoading ? (
            <Typography sx={{ color: "white" }}>Signing in…</Typography>
          ) : (
            <RenderGoogleButton isAdmin={false} loading={googleLoading} />
          )}

          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}
          >
            Use your Google account to sign in.
          </Typography>
        </Box>
      </Drawer>

      {/* Toast / Snackbar */}
      <Snackbar
        open={toastOpen || !!errorMsg}
        autoHideDuration={4000}
        onClose={() => {
          setToastOpen(false);
          setErrorMsg(null);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toastOpen ? "error" : "info"}
          onClose={() => {
            setToastOpen(false);
            setErrorMsg(null);
          }}
          sx={{ width: "100%" }}
        >
          {toastOpen
            ? "Invalid action"
            : errorMsg || "Signed out or not authorized"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LandingPage;
