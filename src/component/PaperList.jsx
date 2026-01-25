import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Alert,
  useMediaQuery,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  Select,
  FormHelperText,
  MenuItem,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  getSolvedMockPapers,
  getUnsolvedMockPapers,
  getSolvedPYQPapers,
  getUnsolvedPYQPapers,
  getSolvedShortPapers,
  getUnsolvedShortPapers,
  getSolvedSubjectPapers,
  getUnsolvedSubjectPapers,
  getSubjectTopics,
} from "../services/api";
import { getStoredUserProfile } from "../services/authService";
import {
  getPaginatedCache,
  setPaginatedCache,
  getSimpleCache,
  setSimpleCache,
} from "../utils/sessionCache";
import PaperCard from "./PaperCard";
import PaperCardSkeleton from "./PaperCardSkeleton";
import SubscriptionDialog from "./SubscriptionDialog";
import { useTheme } from "@mui/material/styles";

const PaperList = ({ paperType }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("unsolved");
  const [subscriptionDialog, setSubscriptionDialog] = useState(false);
  const limit = 4;

  // State for subject papers
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

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
    short: {
      solved: getSolvedShortPapers,
      unsolved: getUnsolvedShortPapers,
    },
    subject: {
      solved: getSolvedSubjectPapers,
      unsolved: getUnsolvedSubjectPapers,
    },
  };

  useEffect(() => {
    if (paperType === "subject") {
      const fetchSubjectData = async () => {
        setLoading(true);
        setError(null);
        try {
          const cachedData = getSimpleCache("subject_topics_data");
          if (cachedData) {
            setSubjects(cachedData);
          } else {
            const data = await getSubjectTopics();
            setSubjects(data);
            setSimpleCache("subject_topics_data", data);
          }
        } catch (err) {
          setError(err.message || "Failed to load subject and topic filters.");
        } finally {
          setLoading(false);
        }
      };
      fetchSubjectData();
    }
  }, [paperType]);

  // FIXED: Automatically select Math subject AND populate topics
  useEffect(() => {
    if (paperType === "subject" && subjects.length > 0 && !selectedSubject) {
      const mathSubject = subjects.find(
        (s) =>
          s.subjectKey === "math" ||
          s.subjectKey === "mathematics" ||
          s.subjectKey === "ankganit" ||
          s.subjectLabel.toLowerCase().includes("math") ||
          s.subjectLabel.includes("गणित"),
      );

      if (mathSubject) {
        setSelectedSubject(mathSubject.subjectKey);
        // FIX: Ensure topics are set immediately when default subject is selected
        setTopics(mathSubject.topics || []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, paperType]);

  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    setSelectedSubject(newSubject);
    if (newSubject) {
      const subjectData = subjects.find((s) => s.subjectKey === newSubject);
      setTopics(subjectData?.topics || []);
    } else {
      setTopics([]);
    }
    setSelectedTopic("");
    setCurrentPage(1);
  };

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filter, paperType, selectedSubject, selectedTopic]);

  const fetchPapers = async () => {
    if (paperType === "subject" && !selectedSubject) {
      setPapers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let cachePrefix = `${paperType}_${filter}_papers`;
    if (paperType === "subject") {
      cachePrefix += `_${selectedSubject}_${selectedTopic || "all"}`;
    }
    const cacheKey = `${cachePrefix}_page_${currentPage}`;
    const cachedData = getPaginatedCache(cacheKey, cachePrefix);

    if (cachedData) {
      setPapers(cachedData.papers || []);
      setTotalPages(cachedData.totalPages || 1);
      setLoading(false);
      return;
    }

    try {
      const fetcher = apiMap[paperType][filter];
      let data;
      if (paperType === "subject") {
        data = await fetcher(
          currentPage,
          limit,
          selectedSubject,
          selectedTopic,
        );
      } else {
        data = await fetcher(currentPage, limit);
      }
      setPapers(data.papers || []);
      setTotalPages(data.totalPages || 1);
      setPaginatedCache(cacheKey, data, cachePrefix);
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

    const siblingCount = isMobile ? 1 : 1;
    // eslint-disable-next-line no-unused-vars
    const boundaryCount = 1;

    const range = (start, end) => {
      let length = end - start + 1;
      return Array.from({ length }, (_, idx) => idx + start);
    };

    const paginationRange = (() => {
      const totalPageNumbers = siblingCount + 5;

      if (totalPageNumbers >= totalPages) {
        return range(1, totalPages);
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(
        currentPage + siblingCount,
        totalPages,
      );

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 3 + 2 * siblingCount;
        let leftRange = range(1, leftItemCount);
        return [...leftRange, "...", totalPages];
      }

      if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 3 + 2 * siblingCount;
        let rightRange = range(totalPages - rightItemCount + 1, totalPages);
        return [firstPageIndex, "...", ...rightRange];
      }

      if (shouldShowLeftDots && shouldShowRightDots) {
        let middleRange = range(leftSiblingIndex, rightSiblingIndex);
        return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
      }
    })();

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.4,
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
            bgcolor: "rgb(255, 255, 255)",
            color: "black",
            boxShadow: 2,
            mr: 1,
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {paginationRange.map((page, index) => {
          if (page === "...") {
            return (
              <Typography
                key={`dots-${index}`}
                variant="body2"
                color="text.secondary"
                sx={{ mx: 0.5 }}
              >
                ...
              </Typography>
            );
          }

          return (
            <Button
              key={page}
              onClick={() => handlePageChange(page)}
              variant={currentPage === page ? "contained" : "outlined"}
              size="small"
              sx={{
                minWidth: { xs: 30, sm: 32 },
                height: { xs: 30, sm: 32 },
                padding: 0,
                background: "white",
                border: "0.1px solid black",
                color: "black",
                ...(currentPage === page && {
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  color: "#000",
                  fontWeight: 800,
                }),
              }}
            >
              {page}
            </Button>
          );
        })}

        <IconButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          size="small"
          sx={{
            bgcolor: "rgb(255, 255, 255)",
            color: "black",
            boxShadow: 2,
            ml: 1,
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
            : paperType === "short"
              ? "लघु प्रश्नपत्रिका"
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
    <Box sx={{ p: 0.2, pb: 1, px: 2 }}>
      <Box
        sx={{
          position: "sticky",
          top: 66,
          zIndex: 10,
          bgcolor: "background.default",
          mb: 2,
          borderColor: "divider",
          pb: 1,
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
        {paperType === "subject" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 0.2,
              mt: 1,
            }}
          >
            {/* Subject Dropdown */}
            <FormControl fullWidth sx={{ width: "100%" }}>
              <Select
                value={selectedSubject}
                onChange={handleSubjectChange}
                size="small"
              >
                <MenuItem value="">
                  <em>विषय निवडा</em>
                </MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.subjectKey} value={subject.subjectKey}>
                    {subject.subjectLabel}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>विषय निवडा</FormHelperText>
            </FormControl>
            {/* Topic Dropdown */}
            <FormControl
              fullWidth
              disabled={!selectedSubject}
              sx={{ width: "100%" }}
            >
              <Select
                value={selectedTopic}
                onChange={handleTopicChange}
                size="small"
              >
                <MenuItem value="">
                  <em>घटक निवडा</em>
                </MenuItem>
                {topics.map((topic) => (
                  <MenuItem key={topic.key} value={topic.key}>
                    {topic.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>घटक निवडा</FormHelperText>
            </FormControl>
          </Box>
        )}
      </Box>

      {paperType === "subject" && !selectedSubject ? (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="h6" color="text.secondary">
            कृपया प्रश्नपत्रिका मिळविण्यासाठी विषय आणि घटक निवडा
          </Typography>
        </Box>
      ) : papers.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 6, px: 3 }}>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
            {filter === "solved" ? (
              "तुम्ही अजून कोणतेही पेपर सोडवलेले नाही"
            ) : filter === "unsolved" ? (
              <>
                <Box
                  sx={{
                    fontSize: "3rem",
                    mb: 2,
                    opacity: 0.5,
                  }}
                >
                  📚
                </Box>
                हा एक नवीन विभाग आहे. सध्या काही विषयांच्या प्रश्नपत्रिका उपलब्ध
                नाहीत, <br />
                पण आम्ही त्या लवकरच जोडत आहोत. कृपया प्रतीक्षा करा!
              </>
            ) : (
              "सध्या कोणतेही प्रश्नपत्र उपलब्ध नाही"
            )}
          </Typography>

          {filter === "unsolved" && (
            <Box
              sx={{
                mt: 2,
                display: "inline-block",
                px: 2,
                py: 0.5,
                borderRadius: 5,
                bgcolor: "rgba(222, 105, 37, 0.1)",
                border: "1px solid #de6925",
                color: "#de6925",
                fontSize: "0.85rem",
                fontWeight: "bold",
              }}
            >
              Coming Soon...
            </Box>
          )}
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
