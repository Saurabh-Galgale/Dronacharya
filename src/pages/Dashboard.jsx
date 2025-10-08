// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useMediaQuery,
  Avatar,
  Stack,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import mockData from "../mockData";
import { useTheme } from "@mui/material/styles";
import {
  getStoredUserProfile,
  getUserFromToken,
} from "../services/authService";

// Playlist of dashboard videos (keep in public/videos/)
const videoList = [
  "/videos/DashVid01.mp4",
  "/videos/DashVid02.mp4",
  "/videos/DashVid03.mp4",
  "/videos/DashVid04.mp4",
  "/videos/DashVid05.mp4",
];

const DEFAULT_AVATAR =
  "https://png.pngtree.com/png-clipart/20250104/original/pngtree-smiling-male-avatar-with-glasses-and-stylish-mustache-for-profile-icons-png-image_20072133.png";

export default function Dashboard() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [stats, setStats] = useState([]);
  const [profile, setProfile] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleVideoEnd = () => {
    setCurrentVideo((prev) => (prev + 1) % videoList.length);
  };

  // load data from localStorage for stats
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("papersStats")) || [];
    setStats(stored);
  }, []);

  // load profile (once) from localStorage or token
  useEffect(() => {
    let user = getStoredUserProfile();
    if (!user) {
      const tokenUser = getUserFromToken();
      if (tokenUser) {
        user = {
          id: tokenUser.id || null,
          name: tokenUser.name || tokenUser.fullName || "",
          email: tokenUser.email || "",
          picture: tokenUser.picture || "",
        };
      }
    }
    if (!user) {
      // fallback minimal profile
      user = { name: "", picture: DEFAULT_AVATAR };
    } else {
      // normalize picture (protocol relative -> https)
      if (user.picture?.startsWith("//"))
        user.picture = "https:" + user.picture;
      if (user.picture?.startsWith("http://"))
        user.picture = user.picture.replace(/^http:\/\//i, "https://");
      if (!user.picture) user.picture = DEFAULT_AVATAR;
    }
    setProfile(user);
  }, []);

  // aggregate summary
  const summary = useMemo(() => {
    const totalPapersAvailable = mockData.length;
    const totalAttempted = stats.length;
    const completionRate = totalPapersAvailable
      ? Math.round((totalAttempted / totalPapersAvailable) * 100)
      : 0;

    let totalCorrect = 0,
      totalAttemptedQs = 0,
      totalQs = 0;

    stats.forEach((p) => {
      totalCorrect += p.correct || 0;
      totalAttemptedQs += p.attempted || 0;
      totalQs += p.totalQuestions || 0;
    });

    const avgAccuracy = totalAttemptedQs
      ? Math.round((totalCorrect / totalAttemptedQs) * 100)
      : 0;

    const avgScore = totalQs ? Math.round((totalCorrect / totalQs) * 100) : 0;

    const bestScore =
      stats.length > 0 ? Math.max(...stats.map((p) => p.scorePercent || 0)) : 0;
    const worstScore =
      stats.length > 0 ? Math.min(...stats.map((p) => p.scorePercent || 0)) : 0;

    // subject-wise performance
    const subjectMap = {};
    stats.forEach((p) => {
      if (!subjectMap[p.subject]) {
        subjectMap[p.subject] = { subject: p.subject, correct: 0, total: 0 };
      }
      subjectMap[p.subject].correct += p.correct || 0;
      subjectMap[p.subject].total += p.totalQuestions || 0;
    });

    const subjectsPerf =
      Object.values(subjectMap).length > 0
        ? Object.values(subjectMap).map((s) => ({
            subject: s.subject,
            percent: s.total ? Math.round((s.correct / s.total) * 100) : 0,
          }))
        : [{ subject: "No Data", percent: 0 }];

    return {
      totalPapersAvailable,
      totalAttempted,
      completionRate,
      avgAccuracy,
      avgScore,
      bestScore,
      worstScore,
      totalCorrect,
      totalAttemptedQs,
      subjectsPerf,
    };
  }, [stats]);

  return (
    <Box sx={{ position: "relative" }}>
      {/* ===== Fixed Background Video ===== */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        <video
          key={currentVideo}
          src={videoList[currentVideo]}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.42)", // faded overlay for readability
          }}
        />
      </Box>

      {/* ===== Foreground Content (scrollable) ===== */}
      <Box sx={{ position: "relative", zIndex: 1, py: 3, px: 0.4 }}>
        {/* ===== Header: Marathi welcome with avatar + moving icon ===== */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
            mb: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1,
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: 2,
            }}
          >
            <Avatar
              src={profile?.picture || DEFAULT_AVATAR}
              alt={profile?.name || "User"}
              sx={{ width: 64, height: 64 }}
              imgProps={{ referrerPolicy: "no-referrer" }}
            />

            <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
              <Typography
                variant={isMobile ? "body" : "h5"}
                sx={{
                  fontWeight: 600,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {profile?.name ? `नमस्कार, ${profile.name}!` : "नमस्कार!"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {[
            { label: "Total Papers", value: summary.totalPapersAvailable },
            { label: "Attempted", value: summary.totalAttempted },
            { label: "Completion Rate", value: `${summary.completionRate}%` },
            { label: "Avg Accuracy", value: `${summary.avgAccuracy}%` },
            { label: "Avg Score", value: `${summary.avgScore}%` },
            { label: "Best Score", value: `${summary.bestScore}%` },
            // { label: "Worst Score", value: `${summary.worstScore}%` },
            { label: "Total Attempted Qs", value: summary.totalAttemptedQs },
            { label: "Total Correct", value: summary.totalCorrect },
          ].map((s, i) => (
            <Box
              key={i}
              sx={{
                flex: "1 1 300px", // responsive: min width 300px, grows as space allows
                maxWidth: "45%",
              }}
            >
              <Card
                sx={{
                  textAlign: "center",
                  py: 2,
                  bgcolor: "rgba(255,255,255,0.9)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">{s.label}</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {s.value}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Charts Row */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 3,
          }}
        >
          {/* Pie Chart */}
          <Box sx={{ flex: "1 1 400px", minWidth: "300px" }}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.9)" }}>
              <CardContent sx={{ height: 350 }}>
                <Typography variant="h6" gutterBottom>
                  Attempted vs Remaining Papers
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Attempted", value: summary.totalAttempted },
                        {
                          name: "Not Attempted",
                          value:
                            summary.totalPapersAvailable -
                            summary.totalAttempted,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 80 : 120}
                      dataKey="value"
                    >
                      <Cell fill="#4caf50" />
                      <Cell fill="#f44336" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          {/* Line Chart */}
          <Box sx={{ flex: "1 1 400px", minWidth: "300px" }}>
            <Card sx={{ bgcolor: "rgba(255,255,255,0.9)" }}>
              <CardContent sx={{ height: 350 }}>
                <Typography variant="h6" gutterBottom>
                  Progress Trend (Score %)
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={
                      stats.length > 0
                        ? stats.map((p, i) => ({
                            name: `Attempt ${i + 1}`,
                            score: p.scorePercent,
                          }))
                        : [{ name: "No Attempts", score: 0 }]
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2196f3" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Bar Chart */}
        <Box sx={{ mt: 3 }}>
          <Card sx={{ bgcolor: "rgba(255,255,255,0.9)" }}>
            <CardContent sx={{ height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Subject-wise Performance
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.subjectsPerf}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="percent" fill="#673ab7" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
