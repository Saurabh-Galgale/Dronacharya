import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import {
  Box,
  Typography,
  TextField,
  Snackbar,
  Alert,
  Drawer,
  useMediaQuery,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Backdrop,
} from "@mui/material";
import { keyframes } from "@mui/system";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import {
  signInWithGoogle,
  emailLogin,
  registerUser,
  forgotPassword,
  isAuthenticated,
} from "../services/authService";
const GoogleSign = lazy(() => import("../component/GoogleSign"));
import Footer from "../component/Footer";

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

const imageCache = new Map();

const darkTextFieldSx = {
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    "& fieldset": { borderColor: "rgba(255,255,255,0.35)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
    "&.Mui-focused fieldset": { borderColor: "white" },
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // UI State
  const [index, setIndex] = useState(0);
  const [userDrawer, setUserDrawer] = useState(false);
  const [loginDrawer, setLoginDrawer] = useState(false);
  const [registerDrawer, setRegisterDrawer] = useState(false);

  // Logic State
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Slider Logic
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000 }),
  ]);

  const onSelect = useCallback(() => {
    if (emblaApi) setIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const preload = (src) => {
      if (!src || imageCache.has(src)) return;
      const img = new Image();
      img.src = src;
      img.onload = () => imageCache.set(src, true);
    };
    preload(images[index]);
    preload(images[(index + 1) % images.length]);
  }, [index]);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Close all drawers
  const closeAllDrawers = () => {
    setUserDrawer(false);
    setLoginDrawer(false);
    setRegisterDrawer(false);
  };

  // Auth Handlers
  const handleGoogleSuccess = async (idToken) => {
    try {
      setFormLoading(true);
      setErrorMsg(null);
      await signInWithGoogle(idToken);
      closeAllDrawers();
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "Google sign-in failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    if (!loginForm.email || !loginForm.password) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    try {
      setFormLoading(true);
      setErrorMsg(null);
      await emailLogin(loginForm);
      closeAllDrawers();
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || "Login failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    try {
      setFormLoading(true);
      setErrorMsg(null);

      // Register user
      const response = await registerUser(registerForm);

      // Check if backend returns tokens (some backends auto-login after registration)
      if (response?.data?.accessToken) {
        // Auto-logged in
        closeAllDrawers();
        navigate("/dashboard");
      } else {
        // Registration successful, now login
        setSuccessMsg("Account created! Logging you in...");

        // Auto-login after 1 second
        setTimeout(async () => {
          try {
            await emailLogin({
              email: registerForm.email,
              password: registerForm.password,
            });
            closeAllDrawers();
            navigate("/dashboard");
          } catch (loginErr) {
            setErrorMsg(
              "Account created but login failed. Please login manually."
            );
            setRegisterDrawer(false);
            setLoginDrawer(true);
          }
        }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.message || "Registration failed");
    } finally {
      setFormLoading(false);
    }
  };
  const handleForgotPassword = async () => {
    if (!loginForm.email) {
      setErrorMsg("Please enter your email first");
      return;
    }

    try {
      setForgotLoading(true);
      setErrorMsg(null);
      await forgotPassword(loginForm.email);
      setSuccessMsg(
        "तुमचा ई-मेल नोंदणीकृत असल्यास, तुम्हाला लवकरच रीसेट लिंक प्राप्त होईल. ई-मेल प्राप्त होण्यासाठी काही मिनिटे लागू शकतात."
      );
      setForgotCooldown(true);
      setTimeout(() => setForgotCooldown(false), 300000); // 5 minute cooldown
    } catch (err) {
      setErrorMsg(err.message || "Failed to send reset email");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection={"column"}
      height="100vh"
      minHeight={"100vh"}
      position="relative"
      sx={{ bgcolor: "black" }}
    >
      {/* 1. Full Screen Loader Backdrop */}
      <Backdrop
        sx={{
          color: "#de6925",
          zIndex: (theme) => theme.zIndex.drawer + 1000, // Ensure it's above everything
          flexDirection: "column",
          gap: 2,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
        }}
        open={formLoading}
      >
        <CircularProgress color="inherit" size={60} thickness={4} />
        <Typography sx={{ color: "white", fontWeight: 600 }}>
          कृपया प्रतीक्षा करा... (Logging in)
        </Typography>
      </Backdrop>
      <Box>
        {/* Carousel Slider */}
        <Box
          flex={1}
          height="100%"
          position="relative"
          ref={emblaRef}
          sx={{
            overflow: "hidden",
            width: isMobile ? "100%" : "60%",
            margin: "0 auto",
          }}
        >
          <Box sx={{ display: "flex", height: "100%" }}>
            {images.map((src, i) => (
              <Box
                key={i}
                sx={{
                  position: "relative",
                  flex: "0 0 100%",
                  height: "100vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={src}
                  alt={`Slide ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: isMobile ? "cover" : "fill",
                  }}
                />
              </Box>
            ))}
          </Box>

          <Box
            position="absolute"
            top={20}
            left="50%"
            zIndex={20}
            sx={{
              transform: "translateX(-50%)",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant={isMobile ? "h6" : "h4"}
              fontWeight="bold"
              sx={{
                fontFamily: "'Gotu', sans-serif",
                background: (t) =>
                  `linear-gradient(90deg, ${t.palette.secondary.dark}, ${t.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                pr: 1.5, // add some right padding to the text
                mt: "auto",
              }}
            >
              द्रोणाचार्य करिअर अकॅडमी
            </Typography>

            <IconButton
              size="small"
              onClick={() => setUserDrawer(true)}
              sx={{
                bgcolor: "rgba(31, 31, 31, 0.9)", // Increased opacity slightly to make the GIF clearer
                border: "1px solid rgba(189, 189, 189, 0.9)",
                padding: 0.8, // Slightly more padding for a better "button" feel
                ml: 1,
                "&:hover": {
                  bgcolor: "white",
                  transform: "scale(1.1)",
                  transition: "transform 0.2s",
                },
              }}
            >
              <Box
                component="img"
                src="/images/arrow.gif"
                alt="Login"
                sx={{
                  width: 22, // Slightly larger than standard icon for visibility
                  height: 22,
                  display: "block",
                }}
              />
            </IconButton>
          </Box>

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
                onClick={() => emblaApi?.scrollTo(i)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  cursor: "pointer",
                  background:
                    index === i
                      ? "linear-gradient(135deg, #de6925, #f8b14a)"
                      : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </Box>

          {isMobile && (
            <Box
              width={"80%"}
              position="absolute"
              bottom={20}
              left="50%"
              zIndex={30}
              sx={{ transform: "translateX(-50%)" }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={() => setUserDrawer(true)}
                startIcon={<LoginIcon sx={{ color: "black" }} />}
                sx={{
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  color: "black",
                  borderRadius: "30px",
                  px: 4,
                }}
              >
                Sign In
              </Button>
            </Box>
          )}
        </Box>

        {!isMobile && (
          <Box
            sx={{
              position: "absolute",
              bottom: "4%",
              left: "50%",
              transform: "translate(-50%, -50%)", // Perfect Centering
              zIndex: 10,
              width: "60%",
              maxWidth: 500,
              p: 2,
              textAlign: "center",
              borderRadius: 4,
              backgroundColor: "rgba(0, 0, 0, 0.0001)", // Darker for text legibility
              backdropFilter: "blur(12px)", // Increased blur for premium feel
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={() => setUserDrawer(true)}
              sx={{
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                color: "black",
                borderRadius: "30px",
              }}
            >
              Sign In
            </Button>
          </Box>
        )}

        {/* Main Auth Drawer */}
        <Drawer
          anchor="bottom"
          open={userDrawer}
          onClose={() => setUserDrawer(false)}
          PaperProps={{
            sx: {
              borderRadius: "22px 22px 0 0",
              p: 3,
              background:
                "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))",
              backdropFilter: "blur(10px)",
            },
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="body2" sx={{ color: "white", mb: 2 }}>
              शक्यतो Google Login वापरूनच पुढे जा.
            </Typography>
            <Suspense fallback={<CircularProgress size={24} />}>
              <GoogleSign onSuccess={handleGoogleSuccess} />
            </Suspense>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                maxWidth: 320,
                my: 2.5,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  height: "1px",
                  bgcolor: "rgba(255,255,255,0.25)",
                }}
              />
              <Typography
                sx={{
                  px: 1.5,
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.8rem",
                }}
              >
                OR
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  height: "1px",
                  bgcolor: "rgba(255,255,255,0.25)",
                }}
              />
            </Box>
            <Button
              variant="outlined"
              onClick={() => {
                setRegisterDrawer(true);
              }}
              sx={{
                width: 278,
                height: 38,
                borderRadius: "28px",
                mb: 1,
                fontWeight: 600,
                background: "rgba(47, 47, 47, 0.3)",
                color: "white",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.6)",
                  bgcolor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              नवीन अकाउंट बनवा
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setLoginDrawer(true);
              }}
              sx={{
                width: 278,
                height: 38,
                borderRadius: "28px",
                fontWeight: 600,
                background: "rgba(47, 47, 47, 0.3)",
                color: "white",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.6)",
                  bgcolor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              Email ने Log in करा
            </Button>
          </Box>
        </Drawer>

        {/* Login Drawer */}
        <Drawer
          anchor="bottom"
          open={loginDrawer}
          onClose={() => setLoginDrawer(false)}
          PaperProps={{
            sx: {
              borderRadius: "22px 22px 0 0",
              p: 3,
              background:
                "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))",
              backdropFilter: "blur(10px)",
            },
          }}
        >
          <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
            Login
          </Typography>
          <TextField
            label="ई-मेल (Email)"
            fullWidth
            margin="dense"
            value={loginForm.email}
            onChange={(e) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
            disabled={formLoading}
            sx={darkTextFieldSx}
          />
          <TextField
            label="पासवर्ड (Password)"
            type={showLoginPassword ? "text" : "password"}
            fullWidth
            margin="dense"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            disabled={formLoading}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !formLoading) {
                handleLoginSubmit();
              }
            }}
            sx={darkTextFieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    sx={{ color: "white" }}
                  >
                    {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              mt: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                cursor:
                  forgotLoading || forgotCooldown || formLoading
                    ? "not-allowed"
                    : "pointer",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "underline",
                opacity:
                  forgotLoading || forgotCooldown || formLoading ? 0.5 : 1,
              }}
              onClick={() =>
                !forgotLoading &&
                !forgotCooldown &&
                !formLoading &&
                handleForgotPassword()
              }
            >
              {forgotLoading
                ? "Sending..."
                : forgotCooldown
                ? "Wait a minute"
                : "Forgot password?"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={formLoading}
            onClick={handleLoginSubmit}
          >
            {formLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
          </Button>
        </Drawer>

        {/* Register Drawer */}
        <Drawer
          anchor="bottom"
          open={registerDrawer}
          onClose={() => setRegisterDrawer(false)}
          PaperProps={{
            sx: {
              borderRadius: "22px 22px 0 0",
              p: 3,
              background:
                "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))",
              backdropFilter: "blur(10px)",
            },
          }}
        >
          <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
            नवीन अकाउंट बनवा
          </Typography>
          <TextField
            label="स्वतःचे पूर्ण नाव टाका"
            fullWidth
            margin="dense"
            value={registerForm.name}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, name: e.target.value })
            }
            disabled={formLoading}
            sx={darkTextFieldSx}
          />
          <TextField
            label="स्वतःचा व योग्य ई-मेल टाका  "
            fullWidth
            margin="dense"
            value={registerForm.email}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, email: e.target.value })
            }
            disabled={formLoading}
            sx={darkTextFieldSx}
          />
          <TextField
            label="नवीन पासवर्ड बनवा"
            type={showRegisterPassword ? "text" : "password"}
            fullWidth
            margin="dense"
            value={registerForm.password}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, password: e.target.value })
            }
            disabled={formLoading}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !formLoading) {
                handleRegisterSubmit();
              }
            }}
            sx={darkTextFieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowRegisterPassword(!showRegisterPassword)
                    }
                    sx={{ color: "white" }}
                  >
                    {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "white",
              mt: 1,
              display: "block",
              px: 1,
            }}
          >
            किमान ८ अक्षरे, संख्या आणि चिन्हांचा वापर करा.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={formLoading}
            onClick={handleRegisterSubmit}
          >
            {formLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "नवीन अकाउंट बनवा"
            )}
          </Button>
        </Drawer>

        {/* Error Snackbar */}
        <Snackbar
          open={!!errorMsg}
          autoHideDuration={4000}
          onClose={() => setErrorMsg(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="error" onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        </Snackbar>

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMsg}
          autoHideDuration={4000}
          onClose={() => setSuccessMsg(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        </Snackbar>
      </Box>

      <Footer />
    </Box>
  );
};

export default LandingPage;
