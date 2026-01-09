// src/components/PerformanceAnalysisSkeleton.jsx

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Divider,
  Skeleton,
  FormControl,
} from "@mui/material";
import { motion } from "framer-motion";

/* ---------------------------------- */
/* 1. Custom Cross-Illumination Style  */
/* ---------------------------------- */
const crossIlluminationStyles = {
  bgcolor: "#1a1a1a",
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    // Diagonal gradient for the "corner to corner" feel
    background:
      "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite linear",
  },
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "-200% 0" },
    "100%": { backgroundPosition: "200% 0" },
  },
};

/* ---------------------------------- */
/* Helper Skeleton Blocks              */
/* ---------------------------------- */

const SkText = ({ width = "100%", height = 24 }) => (
  <Skeleton
    variant="text"
    width={width}
    height={height}
    animation={false}
    sx={crossIlluminationStyles}
  />
);

const SkBox = ({ height }) => (
  <Skeleton
    variant="rectangular"
    height={height}
    animation={false}
    sx={{
      ...crossIlluminationStyles,
      borderRadius: 2,
    }}
  />
);

/* ---------------------------------- */
/* Neon Card Skeleton (Exact Clone)    */
/* ---------------------------------- */

const NeonCardSkeleton = ({ children }) => {
  return (
    <motion.div style={{ height: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          height: "100%",
          borderRadius: { xs: 3, sm: 4 },
          bgcolor: "#0a0a0a",
          border: "1px solid #222",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.9) 100%)",
        }}
      >
        {children}
      </Paper>
    </motion.div>
  );
};

/* ---------------------------------- */
/* Main Skeleton Component             */
/* ---------------------------------- */

const PerformanceAnalysisSkeleton = ({ message }) => {
  return (
    <Box
      minHeight="100vh"
      bgcolor="#000"
      color="#fff"
      pb={4}
      overflowX="hidden"
    >
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        {/* INFO BANNER */}
        {message && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 3,
              bgcolor: "#111",
              border: "2px solid #ED6C02",
            }}
          >
            <Typography
              variant="body1"
              sx={{ color: "#ED6C02", fontWeight: 700 }}
            >
              {message}
            </Typography>
          </Paper>
        )}

        {/* ================= OVERVIEW HEADER ================= */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: { xs: 3, sm: 5 },
            bgcolor: "#0a0a0a",
            border: "1px solid #222",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={{ xs: 2, md: 3 }}
          >
            <Box>
              <SkText width={120} height={18} />
              <Stack direction="row" spacing={3} mt={1}>
                <SkText width={60} height={42} />
                <SkText width={80} height={42} />
                <SkText width={80} height={42} />
              </Stack>
            </Box>

            <Stack spacing={1.5} justifyContent="center">
              <SkText width={140} height={24} />
              <SkText width={140} height={24} />
            </Stack>
          </Stack>
        </Paper>

        <Divider sx={{ my: 1, borderColor: "#222" }} />

        {/* ================= TITLE ================= */}
        <Box textAlign="center" mb={2}>
          <SkText width={220} height={28} />
        </Box>

        {/* ================= CATEGORY SELECT ================= */}
        <Box display="flex" justifyContent="center" mb={2}>
          <FormControl sx={{ minWidth: 250 }}>
            <SkBox height={48} />
          </FormControl>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#222" }} />

        {/* ================= MAIN STATS CARD ================= */}
        <NeonCardSkeleton>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 3, sm: 4 }}
            alignItems="center"
          >
            {/* Accuracy Circle */}
            <Box textAlign="center">
              <SkBox height={130} />
              <SkText width={80} height={18} />
            </Box>

            {/* Stat Pills */}
            <Box flexGrow={1} width="100%">
              <Grid container spacing={1.5}>
                {[...Array(6)].map((_, i) => (
                  <Grid item xs={i < 3 ? 4 : 6} key={i}>
                    <SkBox height={56} />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <SkBox height={48} />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </NeonCardSkeleton>

        {/* ================= CHARTS ================= */}
        <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
          <Box sx={{ width: { xs: "100%", md: "calc(50% - 8px)" } }}>
            <NeonCardSkeleton>
              <SkText width={180} height={26} />
              <SkText width="90%" height={18} />
              <Box mt={2}>
                <SkBox height={240} />
              </Box>
            </NeonCardSkeleton>
          </Box>

          <Box sx={{ width: { xs: "100%", md: "calc(50% - 8px)" } }}>
            <NeonCardSkeleton>
              <SkText width={120} height={26} />
              <Box mt={2}>
                <SkBox height={240} />
              </Box>
            </NeonCardSkeleton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PerformanceAnalysisSkeleton;
