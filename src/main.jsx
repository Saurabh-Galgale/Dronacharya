// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";

// MUI pickers
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// 🔹 Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "black",
            color: "red",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          ⚠️ Something went wrong: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <ErrorBoundary>
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//           <App />
//         </LocalizationProvider>
//       </ErrorBoundary>
//     </ThemeProvider>
//   </React.StrictMode>
// );

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <ErrorBoundary>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <App />
      </LocalizationProvider>
    </ErrorBoundary>
  </ThemeProvider>
);

// Register service worker for image caching (public/sw.js)
// Note: SWs only register on https or localhost.
if (
  "serviceWorker" in navigator &&
  (window.location.protocol === "https:" ||
    window.location.hostname === "localhost")
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Optional: log helpful info
        console.log(
          "Service Worker registered for images at scope:",
          reg.scope
        );

        // Optional: listen for updates and activate immediately if you want
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (installing) {
            installing.addEventListener("statechange", () => {
              console.log("SW state:", installing.state);
            });
          }
        });
      })
      .catch((err) => {
        console.warn("Service Worker registration failed:", err);
      });
  });
}
