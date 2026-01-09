import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  getSolvedMockPapers,
  getUnsolvedMockPapers,
  getSolvedPYQPapers,
  getUnsolvedPYQPapers,
} from "../services/api";
import { getStoredUserProfile } from "../services/authService";
import PaperCard from "./PaperCard";
import PaperCardSkeleton from "./PaperCardSkeleton";
import SubscriptionDialog from "./SubscriptionDialog";

const PaperList = ({ paperType }) => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("unsolved");
  const [subscriptionDialog, setSubscriptionDialog] = useState(false);
  const limit = 4;

  const userProfile = getStoredUserProfile();
  const isSubscribed =
    userProfile?.subscription?.isActive ||
    userProfile?.subscription?.active ||
    false;

  const apiMap = {
    mock: {
      solved: getSolvedMockPapers,
      unsolved: getUnsolvedMockPapers,
    },
    pyq: {
      solved: getSolvedPYQPapers,
      unsolved: getUnsolvedPYQPapers,
    },
  };

  useEffect(() => {
    fetchPapers();
  }, [currentPage, filter, paperType]);

  const fetchPapers = async () => {
    setLoading(true);
    setError(null);

    const cacheKey = `${paperType}_${filter}_papers_page_${currentPage}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      const data = JSON.parse(cachedData);
      setPapers(data.papers || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
      return;
    }

    try {
      const fetcher = apiMap[paperType][filter];
      const data = await fetcher(currentPage, limit);
      setPapers(data.papers || []);
      setTotalPages(data.totalPages || 1);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
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
    const path = `/${paperType}/${paper._id}`;
    const state = filter === "solved" ? { state: { viewMode: true } } : {};
    navigate(path, state);
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
          {paperType === "mock"
            ? "सराव प्रश्नपत्रिका"
            : "मागील वर्षीय प्रश्नपत्रिका"}
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
      <Box
        sx={{
          position: "sticky",
          top: 66,
          zIndex: 10,
          bgcolor: "background.default",
          mb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
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
                "&:hover": { bgcolor: "primary.dark" },
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
          {papers.map((paper, idx) => (
            <PaperCard
              key={paper._id}
              paper={paper}
              filter={filter}
              isSubscribed={isSubscribed}
              onPaperClick={handlePaperClick}
              idx={idx}
            />
          ))}
          {renderPagination()}
        </>
      )}

      <SubscriptionDialog
        open={subscriptionDialog}
        onClose={() => setSubscriptionDialog(false)}
      />
    </Box>
  );
};

export default PaperList;
