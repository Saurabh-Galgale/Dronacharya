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
  Icon,
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

const blinkAnimation = keyframes`
  0% { color: #de6925; }
  50% { color: #fff; }
  100% { color: #de6925; }
`;

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
    Autoplay({ delay: 10000 }),
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
      height="100vh"
      position="relative"
      sx={{ overflow: "hidden", bgcolor: "black" }}
    >
      {/* Carousel Slider */}
      <Box
        flex={1}
        height="100%"
        position="relative"
        ref={emblaRef}
        sx={{ overflow: "hidden" }}
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
                  objectFit: isMobile ? "cover" : "contain",
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
              bgcolor: "rgba(255, 255, 255, 0.2)",
              padding: 0.5,
              color: "#de6925",
              ml: 1,
              boxShadow: 2,
              animation: `${blinkAnimation} 1s ease-in-out infinite`,
            }}
          >
            <LoginIcon sx={{ m: 0.4 }} />
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
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={5}
          sx={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            px: 4,
          }}
        >
          <Box sx={{ textAlign: "center", width: "100%", maxWidth: 420 }}>
            <Typography variant="h5" sx={{ color: "white", mb: 2 }}>
              Welcome
            </Typography>
            <Button
              variant="contained"
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
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.65)", mb: 2 }}
          >
            Continue with Google वापरून पुढे जा.
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
              sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,0.25)" }}
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
              sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,0.25)" }}
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
              borderColor: "rgba(255,255,255,0.3)",
              color: "white",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.6)",
                bgcolor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            Create account
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
              borderColor: "rgba(255,255,255,0.3)",
              color: "white",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.6)",
                bgcolor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            Login with Email
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
          label="Email"
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
          label="Password"
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
              opacity: forgotLoading || forgotCooldown || formLoading ? 0.5 : 1,
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
          Create Account
        </Typography>
        <TextField
          label="Full Name"
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
          label="Email"
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
          label="Password"
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
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
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
          sx={{ color: "rgba(255,255,255,0.5)", mt: 1 }}
        >
          Password must be at least 8 characters with letters and numbers
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
            "Create Account"
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
  );
};

export default LandingPage;

// import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Snackbar,
//   Alert,
//   Drawer,
//   useMediaQuery,
//   Button,
//   CircularProgress,
//   IconButton,
//   InputAdornment,
// } from "@mui/material";
// import LoginIcon from "@mui/icons-material/Login";
// import Visibility from "@mui/icons-material/Visibility";
// import VisibilityOff from "@mui/icons-material/VisibilityOff";
// import { useNavigate } from "react-router-dom";
// import { useTheme } from "@mui/material/styles";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";

// import {
//   signInWithGoogle,
//   emailLogin,
//   registerUser,
//   forgotPassword,
// } from "../services/authService";

// const GoogleSign = lazy(() => import("../component/GoogleSign"));

// const images = [
//   "/images/slide1.webp",
//   "/images/slide2.webp",
//   "/images/slide3.webp",
//   "/images/slide4.webp",
//   "/images/slide5.webp",
//   "/images/slide6.webp",
//   "/images/slide7.webp",
//   "/images/slide8.webp",
//   "/images/slide9.webp",
// ];

// const imageCache = new Map();

// const darkTextFieldSx = {
//   "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
//   "& .MuiInputLabel-root.Mui-focused": { color: "white" },
//   "& .MuiOutlinedInput-root": {
//     color: "#fff",
//     "& fieldset": { borderColor: "rgba(255,255,255,0.35)" },
//     "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
//     "&.Mui-focused fieldset": { borderColor: "white" },
//   },
// };

// const LandingPage = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));

//   // UI State
//   const [index, setIndex] = useState(0);
//   const [userDrawer, setUserDrawer] = useState(false);
//   const [loginDrawer, setLoginDrawer] = useState(false);
//   const [registerDrawer, setRegisterDrawer] = useState(false);

//   // Logic State
//   const [errorMsg, setErrorMsg] = useState(null);
//   const [formLoading, setFormLoading] = useState(false);
//   const [forgotLoading, setForgotLoading] = useState(false);
//   const [forgotCooldown, setForgotCooldown] = useState(false);
//   const [showLoginPassword, setShowLoginPassword] = useState(false);
//   const [showRegisterPassword, setShowRegisterPassword] = useState(false);

//   const [loginForm, setLoginForm] = useState({ email: "", password: "" });
//   const [registerForm, setRegisterForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   // Slider Logic
//   const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
//     Autoplay({ delay: 10000 }),
//   ]);

//   const onSelect = useCallback(() => {
//     if (emblaApi) setIndex(emblaApi.selectedScrollSnap());
//   }, [emblaApi]);

//   useEffect(() => {
//     if (emblaApi) emblaApi.on("select", onSelect);
//   }, [emblaApi, onSelect]);

//   useEffect(() => {
//     const preload = (src) => {
//       if (!src || imageCache.has(src)) return;
//       const img = new Image();
//       img.src = src;
//       img.onload = () => imageCache.set(src, true);
//     };
//     preload(images[index]);
//     preload(images[(index + 1) % images.length]);
//   }, [index]);

//   // Auth Handlers
//   const handleGoogleSuccess = async (idToken) => {
//     try {
//       setFormLoading(true);
//       await signInWithGoogle(idToken);
//       navigate("/dashboard");
//     } catch (err) {
//       setErrorMsg(err.message);
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleLoginSubmit = async () => {
//     try {
//       setFormLoading(true);
//       await emailLogin(loginForm);
//       navigate("/dashboard");
//     } catch (err) {
//       setErrorMsg(err.message);
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleRegisterSubmit = async () => {
//     try {
//       setFormLoading(true);
//       await registerUser(registerForm);
//       navigate("/dashboard");
//     } catch (err) {
//       setErrorMsg(err.message);
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!loginForm.email) {
//       setErrorMsg("Please enter your email first");
//       return;
//     }
//     try {
//       setForgotLoading(true);
//       await forgotPassword(loginForm.email);
//       setErrorMsg("Reset link sent if account exists.");
//       setForgotCooldown(true);
//       setTimeout(() => setForgotCooldown(false), 60000); // 1 minute cooldown
//     } catch (err) {
//       setErrorMsg("Error sending reset link.");
//     } finally {
//       setForgotLoading(false);
//     }
//   };

//   return (
//     <Box
//       display="flex"
//       height="100vh"
//       position="relative"
//       sx={{ overflow: "hidden", bgcolor: "black" }}
//     >
//       {/* 1. Carousel Slider */}
//       <Box
//         flex={1}
//         height="100%"
//         position="relative"
//         ref={emblaRef}
//         sx={{ overflow: "hidden" }}
//       >
//         <Box sx={{ display: "flex", height: "100%" }}>
//           {images.map((src, i) => (
//             <Box
//               key={i}
//               sx={{
//                 position: "relative",
//                 flex: "0 0 100%",
//                 height: "100vh",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//             >
//               <img
//                 src={src}
//                 alt={`Slide ${i + 1}`}
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: isMobile ? "cover" : "contain",
//                 }}
//               />
//             </Box>
//           ))}
//         </Box>

//         <Box
//           position="absolute"
//           top={20}
//           left="50%"
//           zIndex={20}
//           sx={{
//             transform: "translateX(-50%)",
//             textAlign: "center",
//             width: "100%",
//           }}
//         >
//           <Typography
//             variant={isMobile ? "h6" : "h4"}
//             fontWeight="bold"
//             sx={{
//               fontFamily: "'Gotu', sans-serif",
//               background: (t) =>
//                 `linear-gradient(90deg, ${t.palette.secondary.dark}, ${t.palette.secondary.main})`,
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//             }}
//           >
//             द्रोणाचार्य करिअर अकॅडमी
//           </Typography>
//         </Box>

//         <Box
//           position="absolute"
//           bottom={isMobile ? 80 : 40}
//           left="50%"
//           zIndex={15}
//           sx={{ transform: "translateX(-50%)", display: "flex", gap: "10px" }}
//         >
//           {images.map((_, i) => (
//             <Box
//               key={i}
//               onClick={() => emblaApi?.scrollTo(i)}
//               sx={{
//                 width: 8,
//                 height: 8,
//                 borderRadius: "50%",
//                 cursor: "pointer",
//                 background:
//                   index === i
//                     ? "linear-gradient(135deg, #de6925, #f8b14a)"
//                     : "rgba(255,255,255,0.4)",
//               }}
//             />
//           ))}
//         </Box>

//         {isMobile && (
//           <Box
//             width={"80%"}
//             position="absolute"
//             bottom={20}
//             left="50%"
//             zIndex={30}
//             sx={{ transform: "translateX(-50%)" }}
//           >
//             <Button
//               fullWidth
//               variant="contained"
//               onClick={() => setUserDrawer(true)}
//               startIcon={<LoginIcon sx={{ color: "black" }} />}
//               sx={{
//                 background: "linear-gradient(135deg, #de6925, #f8b14a)",
//                 color: "black",
//                 borderRadius: "30px",
//                 px: 4,
//               }}
//             >
//               Sign In
//             </Button>
//           </Box>
//         )}
//       </Box>

//       {!isMobile && (
//         <Box
//           flex={1}
//           display="flex"
//           alignItems="center"
//           justifyContent="center"
//           zIndex={5}
//           sx={{
//             backgroundColor: "rgba(0,0,0,0.6)",
//             backdropFilter: "blur(6px)",
//             px: 4,
//           }}
//         >
//           <Box sx={{ textAlign: "center", width: "100%", maxWidth: 420 }}>
//             <Typography variant="h5" sx={{ color: "white", mb: 2 }}>
//               Welcome
//             </Typography>
//             <Button
//               variant="contained"
//               onClick={() => setUserDrawer(true)}
//               sx={{
//                 background: "linear-gradient(135deg, #de6925, #f8b14a)",
//                 color: "black",
//                 borderRadius: "30px",
//               }}
//             >
//               Sign In
//             </Button>
//           </Box>
//         </Box>
//       )}

//       {/* Main Auth Drawer */}
//       <Drawer
//         anchor="bottom"
//         open={userDrawer}
//         onClose={() => setUserDrawer(false)}
//         PaperProps={{
//           sx: {
//             borderRadius: "22px 22px 0 0",
//             p: 3,
//             backgroundColor: "rgba(0,0,0,0.65)",
//             backdropFilter: "blur(10px)",
//           },
//         }}
//       >
//         <Box display="flex" flexDirection="column" alignItems="center">
//           <Typography
//             variant="body2"
//             sx={{ color: "rgba(255,255,255,0.65)", mb: 2 }}
//           >
//             Continue with Google वापरून पुढे जा.
//           </Typography>
//           <Suspense fallback={<CircularProgress size={24} />}>
//             <GoogleSign onSuccess={handleGoogleSuccess} />
//           </Suspense>
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               width: "100%",
//               maxWidth: 320,
//               my: 2.5,
//             }}
//           >
//             <Box
//               sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,0.25)" }}
//             />
//             <Typography
//               sx={{
//                 px: 1.5,
//                 color: "rgba(255,255,255,0.7)",
//                 fontSize: "0.8rem",
//               }}
//             >
//               OR
//             </Typography>
//             <Box
//               sx={{ flex: 1, height: "1px", bgcolor: "rgba(255,255,255,0.25)" }}
//             />
//           </Box>
//           <Button
//             variant="outlined"
//             onClick={() => setRegisterDrawer(true)}
//             sx={{
//               width: 278,
//               height: 38,
//               borderRadius: "28px",
//               mb: 1,
//               fontWeight: 600,
//               color: "black",
//             }}
//           >
//             Create account
//           </Button>
//           <Button
//             variant="outlined"
//             onClick={() => setLoginDrawer(true)}
//             sx={{
//               width: 278,
//               height: 38,
//               borderRadius: "28px",
//               color: "black",
//               fontWeight: 600,
//             }}
//           >
//             Login with Email
//           </Button>
//         </Box>
//       </Drawer>

//       {/* Login Drawer */}
//       <Drawer
//         anchor="bottom"
//         open={loginDrawer}
//         onClose={() => setLoginDrawer(false)}
//         PaperProps={{
//           sx: {
//             borderRadius: "22px 22px 0 0",
//             p: 3,
//             bgcolor: "rgba(0,0,0,0.85)",
//             backdropFilter: "blur(10px)",
//           },
//         }}
//       >
//         <TextField
//           label="Email"
//           fullWidth
//           margin="dense"
//           value={loginForm.email}
//           onChange={(e) =>
//             setLoginForm({ ...loginForm, email: e.target.value })
//           }
//           sx={darkTextFieldSx}
//         />
//         <TextField
//           label="Password"
//           type={showLoginPassword ? "text" : "password"}
//           fullWidth
//           margin="dense"
//           value={loginForm.password}
//           onChange={(e) =>
//             setLoginForm({ ...loginForm, password: e.target.value })
//           }
//           sx={darkTextFieldSx}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton
//                   onClick={() => setShowLoginPassword(!showLoginPassword)}
//                   sx={{ color: "white" }}
//                 >
//                   {showLoginPassword ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />
//         <Box
//           sx={{
//             width: "100%",
//             display: "flex",
//             justifyContent: "flex-end",
//             mt: 0.5,
//           }}
//         >
//           <Typography
//             variant="caption"
//             sx={{
//               cursor:
//                 forgotLoading || forgotCooldown ? "not-allowed" : "pointer",
//               color: "rgba(255,255,255,0.7)",
//               textDecoration: "underline",
//             }}
//             onClick={() =>
//               !forgotLoading && !forgotCooldown && handleForgotPassword()
//             }
//           >
//             {forgotLoading
//               ? "Sending..."
//               : forgotCooldown
//               ? "Wait a minute"
//               : "Forgot password?"}
//           </Typography>
//         </Box>
//         <Button
//           variant="contained"
//           fullWidth
//           sx={{ mt: 2 }}
//           disabled={formLoading}
//           onClick={handleLoginSubmit}
//         >
//           {formLoading ? "Logging in..." : "Login"}
//         </Button>
//       </Drawer>

//       {/* Register Drawer */}
//       <Drawer
//         anchor="bottom"
//         open={registerDrawer}
//         onClose={() => setRegisterDrawer(false)}
//         PaperProps={{
//           sx: {
//             borderRadius: "22px 22px 0 0",
//             p: 3,
//             bgcolor: "rgba(0,0,0,0.85)",
//             backdropFilter: "blur(10px)",
//           },
//         }}
//       >
//         <TextField
//           label="Full Name"
//           fullWidth
//           margin="dense"
//           value={registerForm.name}
//           onChange={(e) =>
//             setRegisterForm({ ...registerForm, name: e.target.value })
//           }
//           sx={darkTextFieldSx}
//         />
//         <TextField
//           label="Email"
//           fullWidth
//           margin="dense"
//           value={registerForm.email}
//           onChange={(e) =>
//             setRegisterForm({ ...registerForm, email: e.target.value })
//           }
//           sx={darkTextFieldSx}
//         />
//         <TextField
//           label="Password"
//           type={showRegisterPassword ? "text" : "password"}
//           fullWidth
//           margin="dense"
//           value={registerForm.password}
//           onChange={(e) =>
//             setRegisterForm({ ...registerForm, password: e.target.value })
//           }
//           sx={darkTextFieldSx}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton
//                   onClick={() => setShowRegisterPassword(!showRegisterPassword)}
//                   sx={{ color: "white" }}
//                 >
//                   {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />
//         <Button
//           variant="contained"
//           fullWidth
//           sx={{ mt: 2 }}
//           disabled={formLoading}
//           onClick={handleRegisterSubmit}
//         >
//           {formLoading ? "Creating..." : "Create Account"}
//         </Button>
//       </Drawer>

//       <Snackbar
//         open={!!errorMsg}
//         autoHideDuration={4000}
//         onClose={() => setErrorMsg(null)}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//       >
//         <Alert severity="error">{errorMsg}</Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default LandingPage;
