// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg(
        "Reset link is invalid. Please use the link from your email."
      );
    }
  }, [token]);

  const handleSubmit = async () => {
    // Validation
    if (!password || !confirmPassword) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      await resetPassword(token, { password, confirmPassword });
      setSuccessMsg("Password reset successful! Redirecting to login...");

      // Redirect after 2.5 seconds
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setErrorMsg(err.message || "Reset link invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bgcolor="background.default"
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={2}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 450,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={1} color="text.primary">
          Reset Password
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Please enter a new password for your account.
        </Typography>

        <TextField
          label="New Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || !token}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((v) => !v)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirm Password"
          type={showConfirm ? "text" : "password"}
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading || !token}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !loading && token) {
              handleSubmit();
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirm((v) => !v)}
                  edge="end"
                >
                  {showConfirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Password must be at least 8 characters with letters and numbers
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, height: 48 }}
          disabled={loading || !token}
          onClick={handleSubmit}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Change Password"
          )}
        </Button>

        <Button
          variant="text"
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Back to Login
        </Button>
      </Paper>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={5000}
        onClose={() => setErrorMsg("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg("")}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPassword;
