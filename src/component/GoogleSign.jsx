// src/component/GoogleSign.jsx
import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";

export default function GoogleSign({ onSuccess }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const initAttempts = useRef(0);
  const maxAttempts = 20; // 10 seconds max wait

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google Client ID not configured");
      console.error(
        "VITE_GOOGLE_CLIENT_ID is missing in environment variables"
      );
      return;
    }

    let interval;
    let mounted = true;

    const initGoogle = () => {
      initAttempts.current += 1;

      // Stop after max attempts
      if (initAttempts.current > maxAttempts) {
        clearInterval(interval);
        if (mounted) {
          setError("Failed to load Google Sign-In. Please refresh the page.");
        }
        return;
      }

      // Check if Google library is loaded
      if (window.google?.accounts?.id) {
        clearInterval(interval);

        if (!mounted) return;

        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response?.credential) {
                onSuccess && onSuccess(response.credential);
              } else {
                setError("Google sign-in failed. Please try again.");
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (containerRef.current) {
            window.google.accounts.id.renderButton(containerRef.current, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "pill",
              width: 280,
              locale: "en",
            });
          }

          setReady(true);
        } catch (err) {
          console.error("Google Sign-In initialization error:", err);
          setError("Failed to initialize Google Sign-In");
        }
      }
    };

    // Start polling for Google library
    interval = setInterval(initGoogle, 500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [onSuccess]);

  if (error) {
    return (
      <Alert severity="error" sx={{ maxWidth: 280 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "45px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        ref={containerRef}
        style={{
          display: ready ? "block" : "none",
          minHeight: "45px",
        }}
      />
      {!ready && <CircularProgress size={24} sx={{ color: "white" }} />}
    </Box>
  );
}

// import React, { useEffect, useRef, useState } from "react";
// import { Box, CircularProgress } from "@mui/material";

// export default function GoogleSign({ onSuccess }) {
//   const containerRef = useRef(null);
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
//     let interval;

//     const initGoogle = () => {
//       if (window.google?.accounts?.id) {
//         clearInterval(interval);
//         window.google.accounts.id.initialize({
//           client_id: clientId,
//           callback: (res) => onSuccess && onSuccess(res.credential),
//         });

//         if (containerRef.current) {
//           window.google.accounts.id.renderButton(containerRef.current, {
//             type: "standard",
//             theme: "outline",
//             size: "large",
//             text: "continue_with",
//             shape: "pill",
//             width: 280,
//           });
//         }
//         setReady(true);
//       }
//     };

//     interval = setInterval(initGoogle, 500);
//     return () => clearInterval(interval);
//   }, [onSuccess]);

//   return (
//     <Box sx={{ minHeight: "45px", display: "flex", justifyContent: "center" }}>
//       <div ref={containerRef} style={{ display: ready ? "block" : "none" }} />
//       {!ready && <CircularProgress size={24} sx={{ color: "white" }} />}
//     </Box>
//   );
// }
