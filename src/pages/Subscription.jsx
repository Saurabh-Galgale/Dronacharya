// src/pages/Subscription.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

// Plans definition (clean, ready for BE)
const PLANS = [
  {
    id: "monthly",
    label: "One month",
    marathiLabel: "एक महिना",
    price: 150,
    originalPrice: 250,
    months: 1,
    bonusMonths: 0,
    tagline:
      "Full platform access — unlimited QP, mocktests, stats, current affairs",
  },
  {
    id: "semester",
    label: "Semester",
    marathiLabel: "सेमिस्टर (1 महिना मोफत)",
    price: 900,
    originalPrice: 1500,
    months: 6,
    bonusMonths: 1, // 6 months paid -> 7 months access
    tagline: "Get one month extra — full platform access",
  },
  {
    id: "yearly",
    label: "Yearly",
    marathiLabel: "वार्षिक (2 महिने मोफत)",
    price: 1800,
    originalPrice: 3000,
    months: 12,
    bonusMonths: 2, // 12 -> 14
    tagline: "Get two months extra — best value",
  },
];

// small util: add months to a Date (keeps day-of-month where possible)
function addMonths(date, months) {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  const year = d.getFullYear() + Math.floor(targetMonth / 12);
  const month = ((targetMonth % 12) + 12) % 12;
  const day = Math.min(d.getDate(), new Date(year, month + 1, 0).getDate());
  return new Date(year, month, day);
}

function formatDateLocalized(date) {
  try {
    return new Intl.DateTimeFormat("mr-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export default function Subscription() {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();

  const todayISO = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayISO);
  const [selectedPlanId, setSelectedPlanId] = useState("monthly");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === selectedPlanId) || PLANS[0],
    [selectedPlanId]
  );

  const accessMonths = selectedPlan.months + selectedPlan.bonusMonths;

  const startDateObj = useMemo(() => {
    return new Date(startDate + "T00:00:00");
  }, [startDate]);

  const endDateObj = useMemo(
    () => addMonths(startDateObj, accessMonths),
    [startDateObj, accessMonths]
  );

  const handlePurchase = () => {
    // Simulate purchase flow — show confirmation dialog
    setConfirmOpen(true);
  };

  //   const confirmAndClose = () => {
  //     // simulate success
  //     setConfirmOpen(false);
  //     setPurchaseSuccess(true);
  //     // reset success after short time
  //     setTimeout(() => setPurchaseSuccess(false), 2800);
  //   };

  const confirmAndClose = () => {
    setConfirmOpen(false);
    navigate("/app/payment", { state: { plan: selectedPlan } });
  };

  // put these near top of component (or keep where you had them)
  const CARD_MIN_HEIGHT = 260; // tweak if you want taller/shorter cards

  const gradientBorder = {
    padding: "3px",
    borderRadius: 16,
    background:
      "linear-gradient(135deg, rgba(255,236,210,0.2), rgba(176, 129, 113, 0.2))",
    boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
    boxSizing: "border-box",
    height: "100%", // IMPORTANT: let wrapper fill grid cell
    display: "flex",
    flexDirection: "column",
  };

  const cardInner = {
    background: "#000",
    borderRadius: 12,
    color: "rgba(255,255,255,0.95)",
    p: { xs: 2.5, md: 3 },
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%", // IMPORTANT: fill wrapper
    boxSizing: "border-box",
    minHeight: CARD_MIN_HEIGHT,
  };

  // highlight border for selected plan
  const gradientBorderSelected = {
    padding: "3px",
    borderRadius: 16,
    background:
      "linear-gradient(135deg, rgba(45,212,191,0.5), rgba(6,182,212,0.5))", // teal-cyan border
    boxShadow: "0 6px 18px rgba(0,0,0,0.55)",
    boxSizing: "border-box",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  };

  // Helper to compute display original price (fallback to 25% markup if originalPrice not provided)
  const getOriginalPrice = (plan) =>
    plan.originalPrice ?? Math.round(plan.price * 1.25);

  // Savings percent
  const getSavingsPercent = (plan) => {
    const orig = getOriginalPrice(plan);
    if (!orig || orig <= plan.price) return 0;
    return Math.round(((orig - plan.price) / orig) * 100);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "#000", // full black page
        p: { xs: 2, md: 6 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant={isSm ? "h6" : "h4"}
              sx={{ color: "white", fontWeight: 800 }}
            >
              सदस्यता योजना
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              तुमच्या गरजेनुसार योजना निवडा — सुरक्षित पेमेंट नंतर लगेच प्रवेश.
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.55)", textAlign: "right" }}
            >
              प्रोमो: सर्वोत्तम किंमत वार्षिक योजना
            </Typography>
          </Box>
        </Box>

        {/* Controls row (start date) */}
        <Paper
          sx={{
            mb: 4,
            p: { xs: 2, md: 2.5 },
            borderRadius: 2,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.04)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
          elevation={0}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>
            प्रारंभ दिनांक:
          </Typography>
          <input
            aria-label="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              background: "#0b0b0b",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "8px 10px",
              borderRadius: 8,
            }}
          />
          <Box sx={{ ml: "auto", textAlign: "right" }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)" }}
            >
              Access: {accessMonths} महिने ({selectedPlan.months} +{" "}
              {selectedPlan.bonusMonths} बोनस)
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 700 }}
            >
              समाप्ती: {formatDateLocalized(endDateObj)}
            </Typography>
          </Box>
        </Paper>

        {/* Plans grid */}
        <Grid
          container
          spacing={3}
          sx={{
            // ensures rows stretch and align consistently
            alignItems: "stretch",
            alignContent: "stretch",
          }}
        >
          {PLANS.map((plan) => {
            const selected = selectedPlanId === plan.id;
            const origPrice = getOriginalPrice(plan);
            const savings = getSavingsPercent(plan);
            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={plan.id}
                // make grid item a flex container so child fills full height
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  // remove any accidental padding/margin that could differ per column
                  p: 0,
                  m: 0,
                  width: "100%",
                }}
              >
                {/* Entire card clickable -> selects plan */}
                <Box
                  onClick={() => setSelectedPlanId(plan.id)}
                  sx={{
                    ...(selected ? gradientBorderSelected : gradientBorder),
                    cursor: "pointer",
                    "&:focus": { outline: "none" },
                    transition: "all 0.25s ease",
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <Box
                    sx={{
                      ...cardInner,
                      // keep border subtle; selected uses shadow not translate
                      border:
                        selected === true
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "1px solid rgba(255,255,255,0.02)",
                      transition: "box-shadow 180ms ease, transform 180ms ease",
                      boxShadow: selected
                        ? "0 14px 40px rgba(0,0,0,0.6)"
                        : "none",
                      "&:hover": {
                        boxShadow: selected
                          ? "0 18px 50px rgba(0,0,0,0.65)"
                          : "0 8px 26px rgba(0,0,0,0.45)",
                        transform: "translateY(-3px)",
                      },
                    }}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.05rem", md: "1.25rem" },
                          }}
                        >
                          {plan.marathiLabel}
                        </Typography>
                        {plan.bonusMonths > 0 && (
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.85)",
                              background: "rgba(255,255,255,0.03)",
                              px: 1,
                              borderRadius: 1,
                            }}
                          >
                            +{plan.bonusMonths} महिन्यांचे बोनस
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {origPrice > plan.price && (
                          <Box
                            sx={{
                              position: "relative",
                              display: "inline-block",
                              lineHeight: 1,
                              mr: 1,
                              // the price text itself (keeps it visible but dimmed)
                              "& .origPriceText": {
                                color: "rgba(255,255,255,0.45)",
                                fontWeight: 900,
                              },
                              // diagonal line overlay
                              "&::after": {
                                content: '""',
                                position: "absolute",
                                left: "-6%",
                                right: "-6%",
                                top: "50%",
                                height: 2, // line thickness
                                bgcolor: "rgba(255, 255, 255, 0.4)",
                                transform: "rotate(-18deg)",
                                transformOrigin: "center",
                                pointerEvents: "none",
                              },
                            }}
                          >
                            <Typography variant="h5" className="origPriceText">
                              ₹ {origPrice.toLocaleString("en-IN")}
                            </Typography>
                          </Box>
                        )}

                        <Typography
                          variant="h5"
                          sx={{ color: "white", fontWeight: 900 }}
                        >
                          ₹ {plan.price.toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {plan.tagline}
                      </Typography>

                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          Access: {plan.months + plan.bonusMonths} महिने
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          सुरूवात {formatDateLocalized(startDateObj)} → समाप्ती{" "}
                          {formatDateLocalized(
                            addMonths(
                              startDateObj,
                              plan.months + plan.bonusMonths
                            )
                          )}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* bottom area: purchase button only, stopPropagation so card click doesn't double-run */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      {/* <Button
                        variant={selected ? "contained" : "outlined"}
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanId(plan.id);
                        }}
                        sx={{
                          px: 2.5,
                          py: 0.8,
                          borderRadius: 2,
                          background: selected
                            ? "linear-gradient(135deg,#2dd4bf,#06b6d4)"
                            : "transparent",
                        }}
                      >
                        {selected ? "निवडले" : "निवड करा"}
                      </Button> */}

                      <Button
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanId(plan.id);
                          handlePurchase();
                        }}
                        sx={{
                          background: selected
                            ? "linear-gradient(135deg, rgba(45,212,191,0.5), rgba(6,182,212,0.5))"
                            : "linear-gradient(135deg, rgba(255,236,210,0.16), rgba(252,182,159,0.16))",
                          color: "white",
                          px: 2.5,
                          borderRadius: 2,
                        }}
                      >
                        खरेदी करा
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* tiny footer */}
        <Box
          sx={{ mt: 4, textAlign: "center", color: "rgba(255,255,255,0.5)" }}
        >
          <Typography variant="caption">
            खरेदी केल्यानंतर तुम्हाला त्वरित प्रवेश मिळेल.
          </Typography>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          खरेदी पुष्टीकरण
          <IconButton
            aria-label="close"
            onClick={() => setConfirmOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 1.5, fontWeight: 700 }}>
            {selectedPlan.marathiLabel}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            किंमत: ₹ {selectedPlan.price.toLocaleString("en-IN")}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            प्रारंभ: {formatDateLocalized(startDateObj)}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            समाप्ती: {formatDateLocalized(endDateObj)}
          </Typography>
          <Typography sx={{ mt: 2, color: "rgba(0,0,0,0.7)" }}>
            (हा एक सिम्युलेटेड पुष्टीकरण आहे — तुम्हाला पेमेंट गेटवे इंटीग्रेशन
            जोडायचे असल्यास, येथे API कॉल करावा.)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>रद्द करा</Button>
          <Button variant="contained" onClick={confirmAndClose}>
            पुष्टी करा आणि भरा
          </Button>
        </DialogActions>
      </Dialog>

      {/* Simple success toast (floating) */}
      {purchaseSuccess && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "linear-gradient(90deg, #16a34a, #10b981)",
            borderRadius: 999,
            px: 3,
            py: 1,
            display: "flex",
            gap: 1,
            alignItems: "center",
            color: "white",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
          }}
        >
          <CheckIcon />
          <Typography sx={{ fontWeight: 700 }}>खरेदी यशस्वी</Typography>
        </Box>
      )}
    </Box>
  );
}
