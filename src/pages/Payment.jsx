// src/pages/Payment.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { QRCodeCanvas } from "qrcode.react";

// NOTE: merchant side values (you should not hardcode in production)
const MERCHANT_UPI_ID = "sample@icici";
const MERCHANT_NAME = "DronacharyaAcademy";

// small helper to detect mobile
const isMobileDevice = () =>
  /Mobi|Android|iPhone|iPad|iPod|Capacitor|Android/i.test(
    navigator.userAgent || ""
  );

// ---- Payment component ----
export default function Payment({ locationState }) {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const plan = (locationState && locationState.plan) || {
    id: "monthly",
    marathiLabel: "एक महिना",
    price: 150,
  };

  const amount = plan.price;

  // client state
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [order, setOrder] = useState(null); // stores { orderId, txnId, upiIntent, qrPayload, expiresAt }
  const [upiIdInput, setUpiIdInput] = useState("");
  const [collectStatus, setCollectStatus] = useState(null); // null | 'sent' | 'accepted' | 'rejected' | 'failed'
  const [qrOpen, setQrOpen] = useState(false);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);

  // create server order when page loads or user clicks first pay action
  const createOrder = async () => {
    setCreatingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          amount,
        }),
      });
      if (!res.ok) {
        throw new Error("order create failed");
      }
      const data = await res.json();
      // expected data: { orderId, txnId, upiIntent, qrPayload, expiresAt }
      setOrder(data);
      // start lightweight status polling as fallback (server should also use webhooks -> push)
      startPollingStatus(data.orderId);
      return data;
    } catch (err) {
      console.error("createOrder:", err);
      alert("Order creation failed. Try again.");
      return null;
    } finally {
      setCreatingOrder(false);
    }
  };

  // Poll order status fallback (with small backoff)
  const startPollingStatus = (orderId) => {
    if (!orderId) return;
    if (pollRef.current) clearInterval(pollRef.current);
    setPolling(true);
    let requests = 0;
    pollRef.current = setInterval(async () => {
      requests++;
      try {
        const r = await fetch(`/api/orders/${orderId}/status`);
        if (!r.ok) throw new Error("status fetch failed");
        const st = await r.json();
        // st: { status, order }
        if (st.status === "paid") {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setPolling(false);
          setOrder((o) => ({ ...(o || {}), status: "paid", ...st.order }));
          setCollectStatus("accepted");
          // show success UI handle below
        } else if (st.status === "failed" || st.status === "expired") {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setPolling(false);
          setOrder((o) => ({ ...(o || {}), status: st.status, ...st.order }));
        } else {
          // continue polling; after some cycles backoff
          if (requests >= 12) {
            // after ~1 minute of 5s intervals, slow polling to 15s
            clearInterval(pollRef.current);
            pollRef.current = setInterval(async () => {
              try {
                const rr = await fetch(`/api/orders/${orderId}/status`);
                const s2 = await rr.json();
                if (s2.status === "paid") {
                  clearInterval(pollRef.current);
                  pollRef.current = null;
                  setPolling(false);
                  setOrder((o) => ({
                    ...(o || {}),
                    status: "paid",
                    ...s2.order,
                  }));
                  setCollectStatus("accepted");
                }
              } catch (e) {}
            }, 15000);
          }
        }
      } catch (e) {
        console.error("poll error", e);
      }
    }, 5000);
  };

  useEffect(() => {
    // cleanup polling on unmount
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Copy helper
  const copyText = async (txt, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(txt);
      alert(`${label}: ${txt}`);
    } catch {
      alert("Copy failed");
    }
  };

  // -------------- Option A: SEND PAY REQUEST (Collect)
  const sendCollectRequest = async () => {
    // ensure order exists
    let ord = order;
    if (!ord) {
      ord = await createOrder();
      if (!ord) return;
    }

    // validate UPI/phone input
    if (!upiIdInput || upiIdInput.length < 3) {
      alert("Please enter user's UPI ID or phone (for collect).");
      return;
    }

    setCollectStatus("sending");
    try {
      const res = await fetch("/api/collect-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: ord.orderId,
          userUpiOrPhone: upiIdInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCollectStatus("failed");
        alert(data?.message || "Collect request failed");
        return;
      }
      // backend accepted and (usually) forwarded to PSP — user receives push
      setCollectStatus("sent");
      // backend will get webhook from PSP and update order status; polling will pick up or websocket will push
    } catch (err) {
      console.error("collect error", err);
      setCollectStatus("failed");
      alert("Collect request failed");
    }
  };

  // -------------- Option B: OPEN UPI APP (Intent)
  const openUpiApp = async () => {
    let ord = order;
    if (!ord) {
      ord = await createOrder();
      if (!ord) return;
    }
    // open the server-provided upiIntent (safer) or build client side
    if (ord.upiIntent) {
      window.location.href = ord.upiIntent;
    } else {
      // fallback: build quick link (only if server didn't return intent)
      window.location.href = encodeURI(
        `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(
          MERCHANT_NAME
        )}&am=${amount}&cu=INR&tr=${ord.txnId}`
      );
    }
  };

  // -------------- Option C: SCAN QR
  const showQr = async () => {
    let ord = order;
    if (!ord) {
      ord = await createOrder();
      if (!ord) return;
    }
    setQrOpen(true);
  };

  // UI helpers
  const paid = order && order.status === "paid";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000",
        color: "white",
        p: 3,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 920 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant={isSm ? "h6" : "h4"} fontWeight={800}>
              पेमेंट — {plan.marathiLabel}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
              रक्कम: ₹ {amount}
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.02)",
              p: 2,
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                Order
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {order ? order.orderId : "not created yet"}
              </Typography>
            </Box>
            <Box>
              <Button
                onClick={() => createOrder()}
                disabled={creatingOrder}
                variant="outlined"
              >
                Create Order
              </Button>
            </Box>
          </Box>

          {/* Option A: Send pay request (Collect) */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: isSm ? "column" : "row",
              alignItems: "center",
            }}
          >
            <TextField
              label="UPI ID or phone (to send collect request)"
              value={upiIdInput}
              onChange={(e) => setUpiIdInput(e.target.value.trim())}
              fullWidth
              InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
              inputProps={{ style: { color: "white" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.02)",
                },
              }}
            />
            <Button
              variant="contained"
              onClick={sendCollectRequest}
              disabled={collectStatus === "sending" || paid}
            >
              Send Pay Request
            </Button>
          </Box>

          {/* show collect status */}
          {collectStatus && (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: collectStatus === "sent" ? "lightgreen" : "orange",
                }}
              >
                Collect status: {collectStatus}
              </Typography>
            </Box>
          )}

          {/* Option B & C */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={openUpiApp}
              startIcon={<QrCode2Icon />}
              disabled={paid}
            >
              {isMobileDevice() ? "Open UPI App" : "Open UPI App (mobile only)"}
            </Button>

            <Button variant="outlined" onClick={showQr} disabled={paid}>
              Scan & Pay (QR)
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                // copy merchant upi
                navigator.clipboard
                  .writeText(MERCHANT_UPI_ID)
                  .then(() => alert("UPI copied"));
              }}
            >
              Copy Merchant UPI
            </Button>
          </Box>

          {/* status area */}
          <Box>
            {polling && <LinearProgress color="secondary" />}
            {paid ? (
              <Box
                sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}
              >
                <CheckCircleIcon sx={{ color: "lightgreen" }} />
                <Typography sx={{ fontWeight: 700 }}>
                  Payment received — subscription active
                </Typography>
              </Box>
            ) : (
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                Status: {order ? order.status || "created" : "not started"}{" "}
                {collectStatus ? `• collect=${collectStatus}` : ""}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>

      {/* QR dialog */}
      <Dialog
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Scan to Pay
          <IconButton
            onClick={() => setQrOpen(false)}
            size="small"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ bgcolor: "white", p: 2, borderRadius: 2 }}>
            <QRCodeCanvas
              value={
                order
                  ? order.qrPayload ||
                    order.upiIntent ||
                    `upi://pay?pa=${MERCHANT_UPI_ID}&am=${amount}&tr=${order?.txnId}`
                  : ""
              }
              size={220}
            />
          </Box>
          <Typography sx={{ fontWeight: 700 }}>₹ {amount}</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Pay to: {MERCHANT_UPI_ID}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => navigator.clipboard.writeText(MERCHANT_UPI_ID)}
            >
              Copy UPI
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // open upi if user wants
                if (order && order.upiIntent)
                  window.location.href = order.upiIntent;
                else
                  window.location.href = `upi://pay?pa=${MERCHANT_UPI_ID}&am=${amount}&tr=${order?.txnId}`;
              }}
            >
              Open UPI App
            </Button>
            <Button
              variant="text"
              onClick={() => {
                /* refresh by creating new order */ createOrder().then(() =>
                  alert("QR refreshed")
                );
              }}
              startIcon={<RestartAltIcon />}
            >
              Refresh QR
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
