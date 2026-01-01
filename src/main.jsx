import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ErrorPage from "./component/ErrorPage"; // Import the new component

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service like Sentry
    console.error("Critical Crash Caught:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Professional Mobile UI Fallback
      return (
        <ErrorPage error={this.state.error} resetError={this.resetError} />
      );
    }

    return this.props.children;
  }
}

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

// Service worker registration remains same below...

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
