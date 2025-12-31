// src/pages/MockPapers.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  Alert,
  IconButton,
  Dialog,
  DialogContent,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Icon,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import { getSolvedMockPapers, getUnsolvedMockPapers } from "../services/api";
import { getStoredUserProfile } from "../services/authService";
import PaperCardSkeleton from "../component/PaperCardSkeleton";

const MockPapers = () => {
  const navigate = useNavigate();

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("unsolved"); // "solved" | "unsolved"
  const [subscriptionDialog, setSubscriptionDialog] = useState(false);
  const limit = 20;

  const userProfile = getStoredUserProfile();
  const isSubscribed = userProfile?.subscription?.isActive || false;

  useEffect(() => {
    fetchPapers();
  }, [currentPage, filter]);

  const fetchPapers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetcher =
        filter === "solved" ? getSolvedMockPapers : getUnsolvedMockPapers;
      const data = await fetcher(currentPage, limit);
      setPapers(data.papers || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load papers");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = (paper) => {
    const isFree = paper.isFree !== false;

    if (!isFree && !isSubscribed) {
      setSubscriptionDialog(true);
      return;
    }

    if (filter === "solved") {
      navigate(`/mock/${paper._id}`, { state: { viewMode: true } });
    } else {
      navigate(`/mock/${paper._id}`);
    }
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          mt: 3,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <IconButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          size="small"
          sx={{
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => handlePageChange(page)}
            variant={currentPage === page ? "contained" : "outlined"}
            size="small"
            sx={{
              minWidth: 36,
              height: 36,
              ...(currentPage === page && {
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                color: "#000",
                fontWeight: 700,
              }),
            }}
          >
            {page}
          </Button>
        ))}

        <IconButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          size="small"
          sx={{
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    );
  };

  if (loading) {
    return <PaperCardSkeleton count={5} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 700 }}>
          सराव प्रश्नपत्रिका
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchPapers}>
          पुन्हा प्रयत्न करा
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0.2, pb: 4, px: 2 }}>
      {/* <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
        सराव प्रश्नपत्रिका
      </Typography> */}

      {/* Filter Toggle */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          fullWidth
          sx={{
            "& .MuiToggleButton-root": {
              py: 0.8,
              fontWeight: 580,
              fontSize: "0.8rem",
              textTransform: "none",
              border: "0.8px solid",
              borderColor: "divider",
              "&.Mui-selected": {
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                color: "black",
                borderColor: "black",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              },
            },
          }}
        >
          <ToggleButton value="unsolved">न सोडवलेले</ToggleButton>
          <ToggleButton value="solved">सोडवलेले</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {papers.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="h6" color="text.secondary">
            {filter === "solved"
              ? "तुम्ही अजून कोणतेही पेपर सोडवलेले नाही"
              : "सध्या कोणतेही प्रश्नपत्र उपलब्ध नाही"}
          </Typography>
        </Box>
      ) : (
        <>
          {papers.map((paper, idx) => {
            const isFree = paper.isFree !== false;
            const isPublished = paper.isPublished !== false;
            const isSolved = filter === "solved";

            return (
              // want to increase width of card
              <Card
                key={paper._id}
                sx={{
                  mb: 2,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 3,
                  background: isSolved
                    ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
                    : `linear-gradient(135deg, ${
                        idx % 3 === 0
                          ? "#fff3e0, #ffe0b2"
                          : idx % 3 === 1
                          ? "#e3f2fd, #bbdefb"
                          : "#f3e5f5, #e1bee7"
                      })`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Header Row */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ flex: 1, pr: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: "text.primary",
                          mb: 0.5,
                        }}
                      >
                        {paper.name || "Untitled Paper"}
                      </Typography>
                      {isSolved && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="पूर्ण झाले"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: "rgba(0,0,0,0.06)",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                      >
                        ⏱ {paper.durationMinutes || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        मिनिटे
                      </Typography>
                    </Box>
                  </Box>

                  {/* Info Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}
                      >
                        प्रश्नसंख्या
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {paper.totalQuestions || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}
                      >
                        एकूण गुण
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {paper.totalMarks || 0}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Bottom Row */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box>
                      {!isFree && !isSubscribed ? (
                        <>
                          <IconButton
                            size="medium"
                            sx={{
                              color: "white",
                              background:
                                "linear-gradient(135deg,rgba(222, 105, 37, 0.9),rgba(248, 178, 74, 0.9))",
                              backdropFilter: "blur(10px)",
                            }}
                          >
                            <LockIcon fontSize="medium" />
                          </IconButton>
                        </>
                      ) : null}
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => handlePaperClick(paper)}
                      disabled={!isPublished}
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        fontWeight: 700,
                        background: isSolved
                          ? "linear-gradient(135deg, #66bb6a, #43a047)"
                          : "linear-gradient(135deg, #de6925, #f8b14a)",
                        color: "#fff",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        "&:hover": {
                          boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                        },
                        "&:disabled": {
                          background: "rgba(0,0,0,0.12)",
                          color: "rgba(0,0,0,0.26)",
                        },
                      }}
                    >
                      {isSolved ? "पुन्हा पहा" : "सुरू करा"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          {renderPagination()}
        </>
      )}

      {/* Subscription Dialog */}
      <Dialog
        open={subscriptionDialog}
        onClose={() => setSubscriptionDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxWidth: 400,
            m: 2,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #de6925, #f8b14a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            प्रीमियम सामग्री 🔒
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            हे प्रश्नपत्र केवळ सदस्यांसाठी उपलब्ध आहे. संपूर्ण प्रवेश
            मिळवण्यासाठी आत्ताच सदस्यता घ्या!
          </Typography>

          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              p: 2,
              mb: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✓ सर्व सराव प्रश्नपत्रिका प्रवेश
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ✓ सर्व मागील वर्षांच्या प्रश्नपत्रिका
            </Typography>
            <Typography variant="body2">✓ तपशीलवार विश्लेषण</Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              setSubscriptionDialog(false);
              navigate("/subscription");
            }}
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: "1rem",
              background: "linear-gradient(135deg, #de6925, #f8b14a)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(222, 105, 37, 0.4)",
            }}
          >
            सदस्यता घ्या
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MockPapers;
