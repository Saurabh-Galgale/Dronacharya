// src/pages/LandingPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  Switch,
  FormControlLabel,
  Drawer,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

// ✅ point to public folder images
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

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminDrawer, setAdminDrawer] = useState(false); // 🔹 new state for admin
  const [mobile, setMobile] = useState(""); // 🔹 mobile number input
  const [index, setIndex] = useState(0);
  const [guestMode, setGuestMode] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    if (guestMode) {
      setEmail("abc@gmail.com");
      setPassword("1234");
    } else {
      setEmail("");
      setPassword("");
    }
  }, [guestMode]);

  const handleLogin = () => {
    const loginEmail = guestMode ? "abc@gmail.com" : email;
    const loginPassword = guestMode ? "1234" : password;

    if (loginEmail === "abc@gmail.com" && loginPassword === "1234") {
      localStorage.setItem(
        "userCreds",
        JSON.stringify({ email: loginEmail, password: loginPassword })
      );
      navigate("/app/dashboard");
    } else {
      setToastOpen(true);
    }
  };

  // 🔹 Double click on logo → open admin drawer
  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 600) {
      setAdminDrawer(true); // ✅ open admin drawer
    }
    setLastClickTime(now);
  };

  // Loop carousel
  const handleChangeIndex = (i) => {
    if (i === images.length) {
      setIndex(0); // reset back to first image
    } else if (i < 0) {
      setIndex(images.length - 1); // go to last if swiping backwards
    } else {
      setIndex(i);
    }
  };

  // 🔹 Send OTP handler (mock for now)
  const handleSendOtp = () => {
    if (mobile.length !== 10) {
      alert("कृपया 10 अंकी मोबाईल नंबर भरा");
      return;
    }
    console.log("📱 OTP sent to:", "+91" + mobile);
    alert("OTP पाठवला (development mode)");
  };

  const LoginForm = (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      p={4}
      sx={{
        width: isMobile ? "100vw" : "100%",
        height: isMobile ? "100%" : "auto",
        backgroundColor: "transparent !important", // force transparent
        boxShadow: "none !important", // remove shadow
        border: "none", // remove border if any
      }}
    >
      <Typography variant="h5" gutterBottom color="primary">
        Login
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        label="Email"
        value={email}
        color="secondary"
        onChange={(e) => !guestMode && setEmail(e.target.value)}
        variant="outlined"
        sx={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          input: { color: "#fff" }, // input text white
          "& .MuiInputLabel-root": { color: "#fff" }, // label white
          "& .MuiInputLabel-root.Mui-focused": { color: "#90caf9" }, // label on focus
        }}
      />

      <TextField
        fullWidth
        margin="normal"
        type={showPassword ? "text" : "password"}
        label="Password"
        value={password}
        onChange={(e) => !guestMode && setPassword(e.target.value)}
        variant="outlined"
        color="secondary"
        sx={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          input: { color: "#fff" },
          "& .MuiInputLabel-root": { color: "#fff" },
          "& .MuiInputLabel-root.Mui-focused": { color: "#90caf9" },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                color="primary"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={guestMode}
            onChange={() => setGuestMode(!guestMode)}
            color="secondary"
          />
        }
        label="Guest Mode"
        sx={{ color: "#fff", mt: 2 }}
      />

      <Button
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleLogin}
      >
        Log In
      </Button>
    </Box>
  );

  return (
    <Box display="flex" height="100vh" position="relative">
      {/* Carousel Background with smooth drag */}
      <Box flex={1} height="100%" position="relative">
        <AutoPlaySwipeableViews
          index={index}
          onChangeIndex={handleChangeIndex}
          enableMouseEvents
          interval={10000}
          style={{ height: "100%" }}
        >
          {images.map((src, i) => {
            // only render current, prev, next
            if (Math.abs(index - i) > 1) {
              return (
                <Box
                  key={i}
                  height="100vh"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  bgcolor="black"
                >
                  {/* Render placeholder, not actual img */}
                  <Box
                    sx={{ width: "100%", height: "100vh", bgcolor: "black" }}
                  />
                </Box>
              );
            }

            return (
              <Box
                key={i}
                height="100vh"
                display="flex"
                justifyContent="center"
                alignItems="center"
                bgcolor="black"
              >
                <img
                  src={src}
                  alt={`poster${i}`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100vh",
                    objectFit: isMobile ? "cover" : "contain",
                  }}
                />
              </Box>
            );
          })}
        </AutoPlaySwipeableViews>

        {/* 🔥 Stylish Heading Overlay */}
        <Box
          position="absolute"
          top={20}
          left="50%"
          zIndex={20}
          maxWidth="100%"
          sx={{
            transform: "translateX(-50%)",
            textAlign: "center",
            display: "flex", // ✅ align logo + text
            alignItems: "center", // ✅ vertically center
            gap: 1.5, // ✅ spacing between logo & text
          }}
        >
          <img
            src="/images/logo.jpeg" // ✅ your logo path
            alt="Logo"
            style={{
              height: isMobile ? "30px" : "56px", // responsive size
              objectFit: "contain",
              paddingBottom: "6px",
              cursor: "pointer",
            }}
            onClick={handleLogoClick} // ✅ double click detection
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

        <Box
          position="absolute"
          bottom={isMobile ? 90 : 40} // just above the login button
          left="50%"
          zIndex={15}
          sx={{
            transform: "translateX(-50%)",
            display: "flex",
            gap: "10px", // more breathing space
          }}
        >
          {images.map((_, i) => (
            <Box
              key={i}
              onClick={() => setIndex(i)} // make them clickable
              sx={{
                width: index === i ? 8 : 8, // active = bigger
                height: index === i ? 8 : 8,
                borderRadius: "50%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background:
                  index === i
                    ? "linear-gradient(135deg, #de6925, #f8b14a)" // active gradient
                    : "rgba(255,255,255,0.4)", // inactive faint white
                boxShadow:
                  index === i
                    ? "0 0 8px rgba(255, 200, 100, 0.8)" // glowing effect
                    : "none",
              }}
            />
          ))}
        </Box>

        {/* Mobile login button */}
        {isMobile && (
          <Box
            position="absolute"
            bottom={20}
            left="50%"
            zIndex={10}
            maxWidth="100%"
            sx={{ transform: "translateX(-50%)" }}
          >
            <Button
              variant="contained"
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: "30px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                color: "black",
                minWidth: "300px",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "black",
                  color: "black",
                },
              }}
              onClick={() => setDrawerOpen(true)}
            >
              Login
            </Button>
          </Box>
        )}
      </Box>

      {/* Tablet / Desktop login side */}
      {!isMobile && (
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={5}
          sx={{
            backgroundColor: "rgb(0, 0, 0)", // 🔥 semi-transparent black overlay
            backdropFilter: "blur(6px)", // 🔥 frosted blur effect
            WebkitBackdropFilter: "blur(6px)", // Safari support
            boxShadow: "none", // remove default shadow
          }}
        >
          {LoginForm}
        </Box>
      )}

      {/* Drawer for Normal Login */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px 20px 0 0",
            height: "55%",
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(6px)",
            boxShadow: "none",
          },
        }}
      >
        {LoginForm}
      </Drawer>

      {/* Drawer for Admin Mobile Login */}
      <Drawer
        anchor="bottom"
        open={adminDrawer}
        onClose={() => setAdminDrawer(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px 20px 0 0",
            height: "40%",
            p: 3,
            backgroundColor: "rgba(0,0,0,0.6)", // little darker
            backdropFilter: "blur(4px)",
            boxShadow: "none",
          },
        }}
      >
        <Typography
          variant="h6"
          mb={2}
          textAlign="center"
          sx={{ color: "white", fontWeight: "bold" }}
        >
          Admin Mobile Login
        </Typography>

        <TextField
          fullWidth
          label="Mobile Number"
          value={mobile}
          onChange={(e) =>
            setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          InputProps={{
            startAdornment: (
              <Typography sx={{ mr: 1, fontWeight: "bold", color: "white" }}>
                +91
              </Typography>
            ),
          }}
          sx={{
            "& .MuiInputBase-input": { color: "white" }, // input text white
            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" }, // label
            "& .MuiInputLabel-root.Mui-focused": { color: "#f8b14a" }, // focus color
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.6)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f8b14a",
            },
          }}
        />

        <Button
          disabled
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            borderRadius: "25px",
            background: "linear-gradient(135deg, #de6925, #f8b14a)",
            color: "black",
            fontWeight: "bold",
          }}
          onClick={handleSendOtp}
        >
          Send OTP
        </Button>
      </Drawer>

      {/* Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setToastOpen(false)}
          sx={{ width: "100%" }}
        >
          Invalid email or password!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LandingPage;
