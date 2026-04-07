import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  getPackagePapersSolved,
  getPackagePapersUnsolved,
} from "../services/api";
import { getStoredUserProfile } from "../services/authService";
import { getPaginatedCache, setPaginatedCache } from "../utils/sessionCache";
import PaperCard from "../component/PaperCard";
import PaperCardSkeleton from "../component/PaperCardSkeleton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const PackagePapers = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pkg = location.state?.package;

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("unsolved");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [_purchaseDialogOpen, _setPurchaseDialogOpen] = useState(false);

  const userProfile = getStoredUserProfile();
  const isSubscribed =
    userProfile?.subscription?.isActive ||
    userProfile?.subscription?.active ||
    false;

  const fetchPapers = async () => {
    setLoading(true);
    setError(null);

    const cachePrefix = `package-paper_${packageId}_${filter}_papers`;
    const cacheKey = `${cachePrefix}_page_${currentPage}`;
    const cachedData = getPaginatedCache(cacheKey, cachePrefix);

    if (cachedData) {
      setPapers(cachedData.papers || []);
      setTotalPages(cachedData.totalPages || 1);
      setLoading(false);
      return;
    }

    try {
      const fetcher =
        filter === "solved" ? getPackagePapersSolved : getPackagePapersUnsolved;
      const data = await fetcher(packageId, currentPage);
      setPapers(data.papers || []);
      setTotalPages(data.totalPages || 1);
      setPaginatedCache(cacheKey, data, cachePrefix);
    } catch (err) {
      setError(err.message || "प्रश्नपत्रिका लोड करण्यात अडचण आली आहे.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId, filter, currentPage]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setCurrentPage(1);
    }
  };

  const handlePaperClick = (paper) => {
    // Navigate to QuestionPaper view
    // We'll use a specific route for package papers: /package/:packageId/:paperId
    navigate(`/package/${packageId}/${paper._id}`, {
      state: {
        viewMode: filter === "solved",
        isAvailableToSubscribers: pkg?.isAvailableToSubscribers,
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        pb: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate("/packages")} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #de6925, #f8b14a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            पॅकेजमधील प्रश्नपत्रिका 📑
          </Typography>
        </Box>

        <Box
          sx={{
            position: "sticky",
            top: 66,
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(8px)",
            borderRadius: 3,
            p: 1,
            mb: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            fullWidth
            sx={{
              "& .MuiToggleButton-root": {
                py: 1,
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
                border: "none",
                "&.Mui-selected": {
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  color: "black",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              },
            }}
          >
            <ToggleButton value="unsolved">न सोडवलेले</ToggleButton>
            <ToggleButton value="solved">सोडवलेले</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <PaperCardSkeleton count={5} />
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : papers.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 10 }}>
            <Typography variant="h6" color="text.secondary">
              {filter === "solved"
                ? "तुम्ही अजून कोणतेही पेपर सोडवलेले नाही."
                : "सर्व पेपर सोडवून पूर्ण झाले आहेत!"}
            </Typography>
          </Box>
        ) : (
          <Box>
            {papers.map((paper, idx) => (
              <PaperCard
                key={paper._id}
                paper={paper}
                filter={filter}
                isSubscribed={isSubscribed}
                onPaperClick={handlePaperClick}
                idx={idx}
                isPremium={true}
                isPurchased={pkg?.isPurchased}
                isAvailableToSubscribers={pkg?.isAvailableToSubscribers}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  mt: 4,
                }}
              >
                <IconButton
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  sx={{ bgcolor: "white", boxShadow: 1 }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Typography sx={{ fontWeight: 700 }}>
                  पाने {currentPage} / {totalPages}
                </Typography>
                <IconButton
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  sx={{ bgcolor: "white", boxShadow: 1 }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PackagePapers;
