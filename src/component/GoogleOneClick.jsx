// src/component/GoogleOneClick.jsx
import React, { useEffect, useRef, useState } from "react";
import { Button, Box } from "@mui/material";

/**
 * GoogleOneClick (robust)
 * - Renders an EMPTY container div which the Google SDK will populate.
 * - Shows a React "fallback" button as a sibling (not a child) until the SDK has injected its markup.
 * - Retries initialization for a while to handle slow script load / slow networks.
 * - Uses try/catch on unmount cleanup so React won't throw when SDK mutated DOM.
 *
 * Props:
 *  - onSuccess(idTokenString)  // receives raw JWT (response.credential)
 *  - loading (boolean) optional
 *
 * NOTE: Ensure public/index.html includes:
 * <script src="https://accounts.google.com/gsi/client" async defer></script>
 * and VITE_GOOGLE_CLIENT_ID is set in env.
 */
export default function GoogleOneClick({ onSuccess, loading = false }) {
  const containerRef = useRef(null); // target where SDK will render
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);
  const [ready, setReady] = useState(false); // true when SDK has rendered
  const [attempting, setAttempting] = useState(true);

  useEffect(() => {
    mountedRef.current = true;
    let tries = 0;
    const maxTries = 20; // ~10 seconds with 500ms interval
    const intervalMs = 500;
    let timer = null;

    async function tryInit() {
      if (!mountedRef.current) return;
      tries += 1;

      // If already initialized, mark ready and stop
      if (initializedRef.current) {
        setReady(true);
        setAttempting(false);
        return;
      }

      const hasSdk =
        typeof window !== "undefined" &&
        window.google &&
        window.google.accounts &&
        window.google.accounts.id;

      if (!hasSdk) {
        if (tries >= maxTries) {
          // Give up after retries
          console.error("Google Identity SDK not detected after retries.");
          setAttempting(false);
          return;
        }
        // schedule next try
        timer = setTimeout(tryInit, intervalMs);
        return;
      }

      // SDK present -> try to initialize
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.error(
            "VITE_GOOGLE_CLIENT_ID not set — GoogleOneClick cannot initialize."
          );
          setAttempting(false);
          return;
        }

        // initialize only once
        if (!initializedRef.current) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              const idToken = response && response.credential;
              if (!idToken) {
                console.warn("Google callback had no credential", response);
                return;
              }
              try {
                onSuccess && onSuccess(idToken);
              } catch (e) {
                console.error("onSuccess handler threw:", e);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            itp_support: true,
          });

          // Render button into the container element.
          // IMPORTANT: containerRef.current must be an empty element — we NEVER render React children inside it.
          const target = containerRef.current;
          if (!target) {
            console.warn("GoogleOneClick: target container missing");
            setAttempting(false);
            return;
          }

          // call renderButton — SDK will create DOM inside target
          window.google.accounts.id.renderButton(target, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
            logo_alignment: "left",
            width: 280,
          });

          initializedRef.current = true;
        }

        // success
        setReady(true);
        setAttempting(false);
      } catch (e) {
        console.error("GoogleOneClick init error:", e);
        if (tries < maxTries) {
          timer = setTimeout(tryInit, intervalMs);
        } else {
          setAttempting(false);
        }
      }
    }

    tryInit();

    return () => {
      mountedRef.current = false;
      if (timer) clearTimeout(timer);
      // Best-effort cleanup: try to remove any children the SDK injected — but guard with try/catch
      try {
        const t = containerRef.current;
        if (t && t.parentNode) {
          // Remove all children safely
          while (t.firstChild) {
            t.removeChild(t.firstChild);
          }
        }
      } catch (e) {
        // swallow errors here — this avoids React trying to remove nodes that SDK already touched
        // and causing the removeChild NotFoundError you saw.
        // Log for debugging only.
        console.warn("GoogleOneClick cleanup caught:", e && e.message);
      }
    };
  }, [onSuccess]);

  // The container where the SDK will render must stay empty under React's control.
  // We return a wrapper with two siblings:
  //  - containerRef div: SDK will mount inside this DOM node (React won't add children to it)
  //  - fallback button: a normal React button shown until SDK renders (BUT placed outside container)
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      {/* SDK target (React does not render children inside this node) */}
      <div
        ref={containerRef}
        aria-hidden={!ready}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />

      {/* Fallback: visible while attempting or when SDK not available */}
      {!ready && attempting && (
        <Button
          variant="contained"
          disabled={loading}
          onClick={() =>
            alert(
              "Google sign-in initializing. If this message persists, check that the Google Identity script is added to public/index.html and VITE_GOOGLE_CLIENT_ID is configured."
            )
          }
          sx={{
            background: "linear-gradient(135deg, #de6925, #f8b14a)",
            color: "black",
            px: 3,
            py: 1,
            borderRadius: "30px",
          }}
        >
          {loading ? "Signing in…" : "Sign in with Google"}
        </Button>
      )}
    </Box>
  );
}
