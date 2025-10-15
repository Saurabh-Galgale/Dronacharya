// src/pages/PapersList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
} from "@mui/material";
import api from "../services/api";
import { getStoredUserProfile } from "../services/authService";

const PapersList = () => {
  const navigate = useNavigate();

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // default filter: MOCK
  const [type, setType] = useState("MOCK");
  // solved: false = unsolved by default
  const [solved, setSolved] = useState(false);

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");

  const storedProfile = getStoredUserProfile();
  const isSubscribed = storedProfile ? !!storedProfile.subscription : false;

  // modal state for starting unsolved paper
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activePaper, setActivePaper] = useState(null);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        pageSize,
        type,
      };
      if (q) params.q = q;
      if (tag) params.tag = tag;
      // always send solved param (true/false)
      params.solved = solved;
      const data = await api.listPapers(params);
      if (!data || !Array.isArray(data.rows)) setPapers([]);
      else setPapers(data.rows);
    } catch (e) {
      console.error("list papers error:", e);
      setError(e && e.message ? e.message : "सर्व्हरमध्ये त्रुटी आली.");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, type, solved, q, tag]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleTypeChange = (event, newType) => {
    if (!newType) return;
    setType(newType);
    setPage(1);
  };

  const handleSolvedChange = (event, newVal) => {
    if (newVal === "solved") setSolved(true);
    else if (newVal === "unsolved") setSolved(false);
    else setSolved(null);
    setPage(1);
  };

  function openConfirmModal(paper) {
    setActivePaper(paper);
    setConfirmOpen(true);
  }
  function closeConfirmModal() {
    setConfirmOpen(false);
    setActivePaper(null);
  }

  function onConfirmStart() {
    if (!activePaper) return closeConfirmModal();
    const id = activePaper.id || activePaper._id;
    closeConfirmModal();

    // decide view param based on listing's solved filter
    let viewParam = "auto";
    if (solved === true) viewParam = "review";
    else if (solved === false) viewParam = "attempt";

    navigate(`/app/list/${id}/view?view=${viewParam}`);
  }

  const renderSkeletons = (count = 6) =>
    Array.from({ length: count }).map((_, i) => (
      <Card key={i} sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>
          <Skeleton
            variant="rectangular"
            height={18}
            width="60%"
            sx={{ mb: 1 }}
          />
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="text" width="35%" />
          <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
            <Skeleton variant="rounded" width={120} height={36} />
            <Skeleton variant="text" width={80} />
          </Box>
        </CardContent>
      </Card>
    ));

  const emptyMessageFor = () => {
    const typeLabel =
      type === "MOCK"
        ? "MOCK"
        : type === "PYQ"
        ? "PYQ"
        : type === "SUBJECT"
        ? "SUBJECT"
        : "परीक्षा";
    if (solved === true)
      return `तुम्ही अजून कोणतेही ${typeLabel} सोडवलेले नाही.`;
    if (solved === false)
      return `सध्याच्या फिल्टरप्रमाणे कोणतीही न सोडवलेली ${typeLabel} उपलब्ध नाही.`;
    return `सध्याच्या फिल्टरप्रमाणे कोणतीही ${typeLabel} उपलब्ध नाही.`;
  };

  return (
    <Box sx={{ py: 2, px: 1 }}>
      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        {/* प्रकार Filter */}
        <Box sx={{ mb: 2, width: "100%" }}>
          <ToggleButtonGroup
            fullWidth
            value={type}
            exclusive
            onChange={handleTypeChange}
            aria-label="type"
            color="secondary"
            size="small"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              "& .MuiToggleButton-root": {
                flex: 1,
                borderRadius: "8px !important",
                mx: 0.5,
                fontWeight: 600,
              },
            }}
          >
            <ToggleButton value="PYQ" aria-label="pyq">
              PYQ
            </ToggleButton>
            <ToggleButton value="MOCK" aria-label="mock">
              MOCK
            </ToggleButton>
            <ToggleButton value="SUBJECT" aria-label="subject">
              SUBJECT
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* स्थिती Filter */}
        <Box sx={{ mb: 2, width: "100%" }}>
          <ToggleButtonGroup
            fullWidth
            value={solved ? "solved" : "unsolved"}
            exclusive
            onChange={handleSolvedChange}
            aria-label="solved"
            color="secondary"
            size="small"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              "& .MuiToggleButton-root": {
                flex: 1,
                borderRadius: "8px !important",
                mx: 0.5,
                fontWeight: 600,
              },
            }}
          >
            <ToggleButton value="solved" aria-label="solved">
              सोडवलेले
            </ToggleButton>
            <ToggleButton value="unsolved" aria-label="unsolved">
              न सोडवलेले
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {!isSubscribed && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            नोंद: तुम्ही सध्या सदस्यता घेतलेले नाही. त्यामुळे फक्त{" "}
            <strong>isFree: true</strong> पेपर दिसतील.
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box>{renderSkeletons(6)}</Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="body1" color="error" sx={{ mb: 2 }}>
            {`त्रुटी: ${error}`}
          </Typography>
          <Button variant="contained" onClick={() => fetchPapers()}>
            पुन्हा प्रयत्न करा
          </Button>
        </Box>
      ) : papers.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="h6">{emptyMessageFor()}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            फिल्टर बदलून पुन्हा शोधा.
          </Typography>
        </Box>
      ) : (
        papers.map((paper) => {
          const name = paper.Name || paper.name || "Untitled Paper";
          const duration = paper.durationMinutes ?? paper.duration ?? 0;
          const subject = paper.subject || "-";
          const totalQuestions =
            paper.totalQuestions ??
            (Array.isArray(paper.questions) ? paper.questions.length : 0);
          const totalMarks = paper.totalMarks ?? "-";
          const paperId = paper.id || paper._id;

          // Determine if we are rendering in the "solved" listing
          const isSolvedListing = solved === true;

          // check for result fields that might exist in solved payload
          const percent =
            paper.percent ?? paper.scorePercent ?? paper.averagePercent ?? null;
          const obtained =
            paper.totalMarksObtained ?? paper.obtainedMarks ?? null;

          // For solved listing we render a different visual and CTA
          if (isSolvedListing) {
            return (
              <Card
                key={paperId}
                sx={{
                  mb: 2,
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {/* Green/teal top accent stripe for solved papers */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(135deg, rgba(46, 204, 113, 0.14), rgba(16, 185, 129, 0.08))",
                    zIndex: 0,
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                    clipPath: "polygon(0 60%, 0 0, 45% 0)",
                  }}
                />

                <CardContent sx={{ position: "relative", zIndex: 1, pb: 7 }}>
                  <Box width={"70%"}>
                    <Typography fontWeight="bold" variant="body">
                      {name}
                    </Typography>
                  </Box>

                  <Divider
                    sx={{
                      my: 1,
                      width: "100%",
                      ml: 0,
                      mr: "auto",
                      borderColor: "black",
                    }}
                    variant="fullWidth"
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      position: "absolute",
                      top: 18,
                      right: 16,
                      color: "#000",
                      fontWeight: 600,
                    }}
                  >
                    {duration} मिनिटे
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      विषय: <strong>{subject}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      प्रश्नसंख्या: <strong>{totalQuestions}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      एकूण गुण: <strong>{totalMarks}</strong>
                    </Typography>

                    {/* show obtained / percent if available */}
                    {(percent !== null || obtained !== null) && (
                      <Box sx={{ mt: 1 }}>
                        {percent !== null && (
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            आकलन: <strong>{Math.round(percent)}%</strong>
                          </Typography>
                        )}
                        {obtained !== null && (
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            मिळालेले गुण: <strong>{obtained}</strong>
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* CTA for solved - direct review */}
                  <Button
                    variant="outlined"
                    onClick={() => {
                      // Go directly to review view (no confirm)
                      navigate(`/app/list/${paperId}/view?view=review`);
                    }}
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      right: 16,
                      borderRadius: "20px",
                      textTransform: "none",
                      px: 2.5,
                      py: 0.6,
                      fontWeight: 1000,
                      borderColor: "rgba(16,185,129,0.9)",
                      color: "rgba(16,185,129,0.95)",
                      background: "transparent",
                      transition:
                        "background .18s ease, border-color .12s ease, color .12s ease",
                      "&:hover": {
                        background: "rgba(16,185,129,0.06)",
                        borderColor: "rgba(16,185,129,1)",
                        color: "rgba(16,185,129,1)",
                      },
                      "&:active": {
                        transform: "translateY(1px)",
                      },
                      "& .MuiTouchRipple-root": {
                        color: "rgba(16,185,129,0.2)",
                      },
                    }}
                  >
                    Review Paper
                  </Button>
                </CardContent>
              </Card>
            );
          }

          // Default (unsolved / interactive) card - kept unchanged from your previous design
          return (
            <Card
              key={paperId}
              sx={{
                mb: 2,
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {/* Gradient top accent stripe */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(135deg,rgba(222, 105, 37, 0.6),rgba(248, 178, 74, 0.6))",
                  zIndex: 0,
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px",
                  clipPath: "polygon(0 60%, 0 0, 45% 0)",
                }}
              />

              <CardContent sx={{ position: "relative", zIndex: 1, pb: 7 }}>
                {/* Top left - Name */}
                <Box width={"70%"}>
                  <Typography fontWeight="bold" variant="body">
                    {name}
                  </Typography>
                </Box>

                <Divider
                  sx={{
                    my: 1,
                    width: "100%",
                    ml: 0,
                    mr: "auto",
                    borderColor: "black",
                  }}
                  variant="fullWidth"
                />

                {/* Top right - Duration */}
                <Typography
                  variant="body2"
                  sx={{
                    position: "absolute",
                    top: 18,
                    right: 16,
                    color: "#000",
                    fontWeight: 600,
                  }}
                >
                  {duration} मिनिटे
                </Typography>

                {/* Subject, Total Questions, Total Marks */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    विषय: <strong>{subject}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    प्रश्नसंख्या: <strong>{totalQuestions}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    एकूण गुण: <strong>{totalMarks}</strong>
                  </Typography>
                </Box>

                {/* ✅ Start Paper button (bottom-right corner) */}
                <Button
                  variant="contained"
                  onClick={() =>
                    openConfirmModal({
                      id: paperId,
                      name,
                      duration,
                      totalQuestions,
                      totalMarks,
                    })
                  }
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    right: 16,
                    background: "linear-gradient(135deg, #de6925, #f8b14a)",
                    color: "#fff",
                    borderRadius: "20px",
                    textTransform: "none",
                    px: 2.5,
                    py: 0.6,
                  }}
                >
                  Start Paper
                </Button>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Confirmation dialog for starting unsolved paper */}
      <Dialog
        open={confirmOpen}
        onClose={closeConfirmModal}
        fullWidth
        maxWidth="sm"
      >
        <Box sx={{ px: 3, pt: 2 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 700, mb: 0.5 }}
          >
            परीक्षा सुरू करण्याची खात्री?
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "text.primary", minWidth: 0 }}
              noWrap
              title={activePaper ? activePaper.name : ""}
            >
              {activePaper ? activePaper.name : ""}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1,
                  bgcolor: "rgba(0,0,0,0.04)",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {activePaper ? `${activePaper.duration} मिनिटे` : "-"} ⏱
              </Box>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1,
                  bgcolor: "rgba(0,0,0,0.04)",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {activePaper ? `${activePaper.totalQuestions} प्रश्न` : "-"}
              </Box>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1,
                  bgcolor: "rgba(0,0,0,0.04)",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {activePaper ? `${activePaper.totalMarks} गुण` : "-"}
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <DialogContent sx={{ px: 3 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            कृपया तयार असाल तेव्हा पुढे जा. एक पेपर एकच वेळा सबमिट करता येईल.
            परीक्षा सुरू केल्यावर वेळ चालू होईल आणि तुम्हाला संपूर्ण पेपर पूर्ण
            करून सबमिट करावा लागेल.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeConfirmModal} sx={{ textTransform: "none" }}>
            रद्द करा
          </Button>
          <Button
            variant="contained"
            onClick={onConfirmStart}
            sx={{
              textTransform: "none",
              px: 3,
              py: 0.8,
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            सुरू करा
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PapersList;
