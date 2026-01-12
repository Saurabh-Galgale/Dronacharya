import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  useMediaQuery,
  Chip,
  Grid,
  Alert,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { getPerformanceAnalysis } from "../services/api";

/* ✅ ADDED */
import PerformanceAnalysisSkeleton from "../component/PerformanceAnalysisSkeleton";
import { getStoredUserProfile } from "../services/authService";

/* ---------------- Animations (UNCHANGED) ---------------- */

const containerVar = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const cardVar = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15, mass: 0.5 },
  },
};

const pulseVar = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ---------------- UI Components (UNCHANGED) ---------------- */

const NeonCard = ({ children, color = "#fff", glowIntensity = "medium" }) => {
  const glowMap = { low: "20px", medium: "30px", high: "40px" };

  return (
    <motion.div variants={cardVar} style={{ height: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          height: "100%",
          borderRadius: { xs: 3, sm: 4 },
          bgcolor: "#0a0a0a",
          border: `1px solid ${color}50`,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.8) 100%)",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 8px ${glowMap[glowIntensity]} ${color}25`,
        }}
      >
        {children}
      </Paper>
    </motion.div>
  );
};

const StatPill = ({ label, value, color = "#00E5FF" }) => (
  <Box
    sx={{
      bgcolor: "rgba(15,15,15,0.95)",
      border: `1px solid ${color}40`,
      borderRadius: 2,
      p: 1.4,
      textAlign: "center",
    }}
  >
    <Typography variant="caption" sx={{ color: "#aaa", fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800, mt: 0.5 }}>
      {value}
    </Typography>
  </Box>
);

/* ---------------- MAIN COMPONENT ---------------- */

const PerformanceAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCat, setSelectedCat] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ✅ SUBSCRIPTION CHECK */
  const userProfile = getStoredUserProfile();
  const isSubscribed = userProfile?.subscription?.active || false;

  useEffect(() => {
    const loadData = async () => {
      try {
        const cachedData = sessionStorage.getItem(
          "user_performance_analysis_data"
        );

        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setData(parsed);
          setSelectedCat(Object.keys(parsed.categories)[0]);
          return;
        }

        const result = await getPerformanceAnalysis();
        setData(result);
        setSelectedCat(Object.keys(result.categories)[0]);

        sessionStorage.setItem(
          "user_performance_analysis_data",
          JSON.stringify(result)
        );
      } catch (err) {
        setError(err.message || "Failed to load performance data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isSubscribed]);

  /* ---------------- EARLY RETURNS (ONLY ADDED) ---------------- */

  if (loading) {
    return <PerformanceAnalysisSkeleton />;
  }

  if (!data || data.overview?.totalTests === 0) {
    return (
      <PerformanceAnalysisSkeleton message="📌 अजून कोणतीही प्रश्नपत्रिका सोडवलेली नाही. विश्लेषण पाहण्यासाठी किमान एक प्रश्नपत्रिका सोडवा." />
    );
  }

  if (error) {
    return (
      <Box p={3} bgcolor="#000" minHeight="100vh">
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Box>
    );
  }

  const currentData = data.categories[selectedCat];
  const { stats, history, color } = currentData;
  const overview = data.overview;

  const accuracy = Math.round((stats.correct / stats.attempted) * 100) || 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000",
        color: "#fff",
        pb: 4,
        overflowX: "hidden",
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        {/* OVERVIEW HEADER - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              borderRadius: { xs: 3, sm: 5 },
              bgcolor: "#0a0a0a",
              border: `0.4px solid ${color}`,
              boxShadow: `0 10px 40px ${color}30, inset 0 1px 0 rgba(255,255,255,0.1)`,
              background: `linear-gradient(135deg, ${color}08 0%, rgba(0,0,0,0.95) 100%)`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                animation: "slide 3s linear infinite",
                "@keyframes slide": {
                  "0%": { transform: "translateX(-100%)" },
                  "100%": { transform: "translateX(100%)" },
                },
              }}
            />

            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={{ xs: 2, md: 3 }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  }}
                >
                  CAREER SUMMARY
                </Typography>
                <Stack
                  direction="row"
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ mt: 1 }}
                  flexWrap="wrap"
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: "1.75rem", sm: "2.125rem" },
                        color: "#fff",
                        textShadow: "0 0 20px rgba(255,255,255,0.3)",
                      }}
                    >
                      {overview.totalTests}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        fontWeight: 600,
                      }}
                    >
                      Tests
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: "1.75rem", sm: "2.125rem" },
                        color: "#fff",
                        textShadow: "0 0 20px rgba(255,255,255,0.3)",
                      }}
                    >
                      {overview.totalQuestions}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        fontWeight: 600,
                      }}
                    >
                      Questions
                    </Typography>
                  </Box>
                  <Box>
                    <motion.div
                      variants={pulseVar}
                      initial="initial"
                      animate="animate"
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: "1.75rem", sm: "2.125rem" },
                          color: color,
                          textShadow: `0 0 20px ${color}80`,
                        }}
                      >
                        {overview.overallAccuracy}%
                      </Typography>
                    </motion.div>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        fontWeight: 600,
                      }}
                    >
                      Accuracy
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Stack spacing={1.5} justifyContent="center">
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 600,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    Strongest:
                  </Typography>
                  <Chip
                    label={overview.strongestSubject}
                    size="small"
                    sx={{
                      bgcolor: "#F2FF00",
                      color: "#000",
                      fontWeight: 800,
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      boxShadow: "0 4px 15px #F2FF0040",
                    }}
                  />
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 600,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    Weakest:
                  </Typography>
                  <Chip
                    label={overview.weakestSubject}
                    size="small"
                    sx={{
                      bgcolor: "#FF2975",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      boxShadow: "0 4px 15px #FF297540",
                    }}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </motion.div>

        <Divider sx={{ my: 1, borderColor: "#222" }} />

        <Typography
          variant="h6"
          textAlign="center"
          sx={{
            fontWeight: 900,
            mb: 2,
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            color: "#fff",
            textShadow: `0 0 20px ${color}50`,
            width: "100%",
          }}
        >
          विषयानुसार <span style={{ color }}>विश्लेषण</span>
        </Typography>

        {/* CATEGORY SELECTOR - Styled Dropdown */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <FormControl
            variant="outlined"
            sx={{
              minWidth: { xs: "80%", sm: 250 },
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                fontWeight: 800,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.05)",
                border: `1px solid ${color}40`,
                transition: "all 0.3s ease",
                boxShadow: `0 4px 15px ${color}20`,
                "& fieldset": { border: "none" },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  boxShadow: `0 4px 20px ${color}40`,
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 25px ${color}50`,
                  border: `2px solid ${color}`,
                },
              },
              "& .MuiSelect-icon": {
                color: color,
                fontSize: "1.8rem",
              },
            }}
          >
            <Select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              displayEmpty
              IconComponent={KeyboardArrowDownIcon}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "#121212",
                    color: "#fff",
                    borderRadius: 2,
                    mt: 1,
                    border: "1px solid rgba(255,255,255,0.1)",
                    "& .MuiMenuItem-root": {
                      fontWeight: 600,
                      py: 1.5,
                      "&.Mui-selected": {
                        bgcolor: `${color}20`,
                        color: color,
                        "&:hover": { bgcolor: `${color}30` },
                      },
                    },
                  },
                },
              }}
            >
              {Object.keys(data.categories).map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#222" }} />

        {/* DASHBOARD CONTENT */}
        <motion.div
          variants={containerVar}
          initial="hidden"
          animate="visible"
          key={selectedCat}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {/* MAIN STATS CARD */}
            <Box sx={{ width: "100%" }}>
              <NeonCard color={color} glowIntensity="high">
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 4 }}
                  alignItems="center"
                >
                  {/* Accuracy Circle */}
                  <Box sx={{ textAlign: "center" }}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, type: "spring" }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: { xs: 110, sm: 130 },
                          height: { xs: 110, sm: 130 },
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            border: `6px solid ${color}20`,
                            boxShadow: `inset 0 0 20px ${color}20`,
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            background: `conic-gradient(${color} ${
                              accuracy * 3.6
                            }deg, transparent 0deg)`,
                            mask: "radial-gradient(circle, transparent 50%, black 50%)",
                            WebkitMask:
                              "radial-gradient(circle, transparent 50%, black 50%)",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            inset: -10,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, ${color}30, transparent 70%)`,
                            filter: "blur(15px)",
                            animation: "pulse 2s ease-in-out infinite",
                          }}
                        />
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 900,
                            fontSize: { xs: "2rem", sm: "2.5rem" },
                            color: "#fff",
                            textShadow: `0 0 20px ${color}`,
                            zIndex: 1,
                          }}
                        >
                          {accuracy}%
                        </Typography>
                      </Box>
                    </motion.div>
                    <Typography
                      variant="caption"
                      sx={{
                        color: color,
                        fontWeight: 800,
                        fontSize: { xs: "0.7rem", sm: "0.8rem" },
                        letterSpacing: "1px",
                      }}
                    >
                      ACCURACY
                    </Typography>
                  </Box>

                  {/* Stats Grid */}
                  <Box sx={{ flexGrow: 1, width: "100%" }}>
                    <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                      <Grid item xs={4}>
                        <StatPill
                          label="Total"
                          value={stats.total}
                          color={color}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <StatPill
                          label="Attempted"
                          value={stats.attempted}
                          color={color}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <StatPill
                          label="Skipped"
                          value={stats.unattempted}
                          color="#FFAB00"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <StatPill
                          label="Correct"
                          value={stats.correct}
                          color="#00E5FF"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <StatPill
                          label="Wrong"
                          value={stats.wrong}
                          color="#FF2975"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            bgcolor: `${color}10`,
                            border: `2px solid ${color}60`,
                            borderRadius: { xs: 2, sm: 3 },
                            p: { xs: 1.2, sm: 1.5 },
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            boxShadow: `0 4px 20px ${color}20, inset 0 1px 0 rgba(255,255,255,0.1)`,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: "2px",
                              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: { xs: "0.7rem", sm: "0.8rem" },
                              letterSpacing: "0.5px",
                            }}
                          >
                            TOTAL MARKS
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 900,
                              fontSize: { xs: "1.1rem", sm: "1.25rem" },
                              color: "#fff",
                              textShadow: `0 0 10px ${color}50`,
                            }}
                          >
                            {stats.obtainedMarks} / {stats.totalMarks}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </NeonCard>
            </Box>

            {/* HISTORY CHART */}
            <Box sx={{ width: { xs: "100%", md: "calc(50% - 8px)" } }}>
              <NeonCard color={color}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    color: "#fff",
                  }}
                >
                  {selectedCat}: मागील कामगिरी
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.65)",
                    mb: 2,
                    lineHeight: 1.6,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  तुम्ही सोडवलेल्या प्रश्नपत्रिकांमधील{" "}
                  <strong style={{ color: color }}>{selectedCat}</strong> या
                  विभागात तुम्हाला मिळालेले गुण ह्या तक्त्यात दिले गेले आहेत.
                </Typography>

                <Box sx={{ height: { xs: 220, sm: 250 }, width: "100%" }}>
                  <ResponsiveContainer>
                    <AreaChart
                      data={history}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id={`colorHistory-${selectedCat}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={color}
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="95%"
                            stopColor={color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        vertical={false}
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray="3 3"
                      />

                      <XAxis dataKey="d" hide={true} />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0a0a0a",
                          border: `2px solid ${color}`,
                          borderRadius: "12px",
                          boxShadow: `0 10px 30px ${color}40`,
                          backdropFilter: "blur(10px)",
                        }}
                        labelStyle={{
                          color: "#fff",
                          fontWeight: 700,
                          marginBottom: "8px",
                          fontSize: "0.9rem",
                        }}
                        itemStyle={{
                          color: color,
                          fontWeight: 600,
                        }}
                        labelFormatter={(value) => `प्रश्नपत्रिका: ${value}`}
                        formatter={(value) => [`${value} गुण`, "मिळालेले गुण"]}
                      />

                      <Area
                        type="monotone"
                        dataKey="s"
                        name="मिळालेले गुण"
                        stroke={color}
                        strokeWidth={3}
                        fill={`url(#colorHistory-${selectedCat})`}
                        dot={{
                          r: isSmallMobile ? 4 : 5,
                          fill: "#0a0a0a",
                          stroke: color,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: isSmallMobile ? 6 : 8,
                          fill: color,
                          stroke: "#fff",
                          strokeWidth: 2,
                          filter: `drop-shadow(0 0 8px ${color})`,
                        }}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    textAlign: "center",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    pt: 1.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.4)",
                      fontStyle: "italic",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    * ग्राफमधील प्रत्येक बिंदू एका स्वतंत्र चाचणीचा निकाल
                    दर्शवतो
                  </Typography>
                </Box>
              </NeonCard>
            </Box>

            {/* RADAR CHART */}
            <Box sx={{ width: { xs: "100%", md: "calc(50% - 8px)" } }}>
              <NeonCard color="#00E5FF">
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    color: "#fff",
                  }}
                >
                  Skill Shape
                </Typography>
                <Box sx={{ height: { xs: 220, sm: 250 }, width: "100%" }}>
                  <ResponsiveContainer>
                    <RadarChart data={data.radarData}>
                      <PolarGrid
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth={1}
                      />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{
                          fill: "#fff",
                          fontSize: isSmallMobile ? 10 : isMobile ? 12 : 14,
                          fontWeight: 700,
                        }}
                      />
                      <Radar
                        dataKey="A"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.4}
                        strokeWidth={2}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0a0a0a",
                          border: `2px solid ${color}`,
                          borderRadius: "10px",
                          color: "#fff",
                          fontWeight: 600,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    textAlign: "center",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    pt: 1.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.4)",
                      fontStyle: "italic",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    * तुमची प्रत्येक विषयातील कामगिरी दर्शविणारा आलेख
                  </Typography>
                </Box>
              </NeonCard>
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default PerformanceAnalysis;
