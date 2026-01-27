import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SecurityIcon from "@mui/icons-material/Security";
import { getMagazineById } from "../services/api";
import { getSimpleCache, setSimpleCache } from "../utils/sessionCache";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VerifiedIcon from "@mui/icons-material/Verified";

// 1. Soft Pastels for Content Blocks (Text readability is key)
const PASTEL_PALETTE = [
  "#E3F2FD", // Blue
  "#F3E5F5", // Purple
  "#E8F5E9", // Green
  "#FFF3E0", // Orange
  "#FFEBEE", // Red
  "#E0F7FA", // Cyan
  "#FFF8E1", // Amber
  "#F1F8E9", // Light Green
];

// 2. Professional Dark Gradients for Accordion Headers
const HEADER_GRADIENTS = [
  "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", // Deep Ocean Blue
  "linear-gradient(135deg, #134e5e 0%, #71b280 100%)", // Teal to Green
  "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)", // Midnight Blue
  "linear-gradient(135deg, #4b134f 0%, #c94b4b 100%)", // Purple to Red
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", // Dark Slate
  "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)", // Royal Sunset
  "linear-gradient(135deg, #141e30 0%, #243b55 100%)", // Deep Navy
  "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)", // Blue to Purple
  "linear-gradient(135deg, #134e5e 0%, #71b280 100%)", // Forest Green
  "linear-gradient(135deg, #000428 0%, #004e92 100%)", // Deep Space Blue
  "linear-gradient(135deg, #283048 0%, #859398 100%)", // Charcoal Grey
  "linear-gradient(135deg, #360033 0%, #0b8793 100%)", // Plum to Teal
  "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)", // Royal Blue
  "linear-gradient(135deg, #2e3192 0%, #1bffff 100%)", // Electric Blue
  "linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)", // Purple Dawn
  "linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)", // Emerald
  "linear-gradient(135deg, #232526 0%, #414345 100%)", // Graphite
  "linear-gradient(135deg, #4b134f 0%, #c94b4b 100%)", // Wine Red
  "linear-gradient(135deg, #00467f 0%, #a5cc82 100%)", // Ocean Breeze
  "linear-gradient(135deg, #373b44 0%, #4286f4 100%)", // Steel Blue
];

// ========== SECURITY LAYER ==========
const SecurityOverlay = ({ children }) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
      return false;
    };

    const disableSelection = () => {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    };

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "s", "p", "a", "u"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
        return false;
      }
      if (e.key === "PrintScreen" || e.key === "F12") {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
        return false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
      }
    };

    disableSelection();
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const style = document.createElement("style");
    style.textContent = `* { user-select: none !important; }`;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.body.style.userSelect = "";
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {children}
      {showWarning && (
        <Fade in={showWarning}>
          <Box
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
              bgcolor: "rgba(222, 105, 37, 0.95)",
              color: "white",
              px: 4,
              py: 3,
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <SecurityIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                सुरक्षित सामग्री
              </Typography>
              <Typography variant="body2">
                कॉपी, सेव्ह आणि स्क्रीनशॉट प्रतिबंधित
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}
    </>
  );
};

// ========== COMPONENTS ==========

function InfoCard({ data }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        transition: "all 0.3s",
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.05)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(222,105,37,0.15)",
          borderColor: "rgba(222,105,37,0.3)",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#de6925",
            mb: 1.5,
            borderBottom: "2px solid rgba(222,105,37,0.1)",
            pb: 1,
            fontSize: { xs: "1rem", sm: "1.1rem" },
          }}
        >
          {data.heading}
        </Typography>
        {data.items.map((item, i) => (
          <Box
            key={i}
            sx={{ mb: 1.5, display: "flex", flexDirection: "column" }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#666",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.7rem",
              }}
            >
              {item.title || item.label}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#212121",
                fontWeight: 500,
                fontSize: { xs: "0.95rem", sm: "1rem" },
                lineHeight: 1.4,
              }}
            >
              {item.description || item.value}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

function ResponsiveTable({ data }) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.08)",
        overflowX: "auto",
      }}
    >
      <Table stickyHeader sx={{ minWidth: 350 }}>
        <TableHead>
          <TableRow>
            {data.headers.map((h, i) => (
              <TableCell
                key={i}
                sx={{
                  fontWeight: 800,
                  bgcolor: "#fff3e0",
                  color: "#de6925",
                  whiteSpace: "nowrap",
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  py: 1.5,
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.rows.map((row, i) => (
            <TableRow
              key={i}
              sx={{ "&:hover": { bgcolor: "rgba(222,105,37,0.04)" } }}
            >
              {row.map((cell, j) => (
                <TableCell
                  key={j}
                  sx={{
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                    color: "#333",
                    fontWeight: j === 0 ? 600 : 400,
                    py: 1.5,
                  }}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function BulletList({ data }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" },
        gap: 1.5,
      }}
    >
      {data.bullets.map((b, i) => {
        const isObj = typeof b === "object";
        const text = isObj ? b.text : b;
        const description = isObj ? b.description : null;

        return (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(222,105,37,0.04)",
              border: "1px solid transparent",
              "&:hover": {
                bgcolor: "white",
                borderColor: "#de6925",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              },
            }}
          >
            <VerifiedIcon
              sx={{ color: "#de6925", fontSize: 18, mt: 0.3, flexShrink: 0 }}
            />
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color: "#212121",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  lineHeight: 1.5,
                  fontWeight: 600,
                }}
              >
                {text}
              </Typography>
              {description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    mt: 0.5,
                    lineHeight: 1.4,
                    fontSize: { xs: "0.8rem", sm: "0.85rem" },
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function FactCard({ data }) {
  return (
    <Card
      sx={{
        p: 2,
        textAlign: "center",
        borderRadius: 2,
        background: "white",
        border: "1px solid rgba(0,0,0,0.1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: "#757575",
          fontWeight: 600,
          mb: 1,
          fontSize: { xs: "0.8rem", sm: "0.85rem" },
        }}
      >
        {data.title}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: "#de6925",
          mb: 1,
          fontSize: { xs: "1.75rem", sm: "2rem" },
        }}
      >
        {data.value}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#666",
          lineHeight: 1.4,
          fontSize: { xs: "0.8rem", sm: "0.85rem" },
        }}
      >
        {data.description}
      </Typography>
    </Card>
  );
}

function SimpleList({ data }) {
  return (
    <Box>
      {data.items.map((item, i) => (
        <Box key={i}>
          <Box
            sx={{
              py: 2,
              px: 1.5,
              borderRadius: 2,
              transition: "background 0.2s",
              "&:hover": { bgcolor: "rgba(222,105,37,0.04)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                mb: 0.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#212121",
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                }}
              >
                {item.title}
              </Typography>

              {item.subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#de6925",
                    fontWeight: 600,
                    fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    mt: 0.3,
                  }}
                >
                  {item.subtitle}
                </Typography>
              )}
            </Box>

            {item.description && (
              <Typography
                variant="body1"
                sx={{
                  color: "#555",
                  mt: 0.5,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  lineHeight: 1.6,
                }}
              >
                {item.description}
              </Typography>
            )}
          </Box>
          {i < data.items.length - 1 && <Divider sx={{ my: 1 }} />}
        </Box>
      ))}
    </Box>
  );
}

function Paragraph({ text }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "#fff8e1",
        borderLeft: "4px solid #fbc02d",
      }}
    >
      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.8,
          textAlign: "justify",
          color: "#333",
          fontSize: { xs: "0.95rem", sm: "1.05rem" },
        }}
      >
        {text}
      </Typography>
    </Paper>
  );
}

function ContentBlockRenderer({ block }) {
  const components = {
    "info-card": InfoCard,
    table: ResponsiveTable,
    "bullet-list": BulletList,
    "fact-card": FactCard,
    "simple-list": SimpleList,
    paragraph: Paragraph,
  };
  const Component = components[block.type];
  return Component ? <Component data={block} text={block.text} /> : null;
}

function SectionContent({ section }) {
  const layouts = {
    "card-grid": { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(2,1fr)" },
    "fact-grid": { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(3,1fr)" },
  };
  const grid = layouts[section.layout];

  return (
    <Box sx={{ py: 1 }}>
      {grid ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: grid,
            gap: 1.5,
          }}
        >
          {section.blocks.map((b, i) => (
            <ContentBlockRenderer key={i} block={b} />
          ))}
        </Box>
      ) : (
        section.blocks.map((b, i) => (
          <Box key={i} sx={{ mb: 1.5 }}>
            <ContentBlockRenderer block={b} />
          </Box>
        ))
      )}
    </Box>
  );
}

export default function MagazineView() {
  const { magazineId } = useParams();
  const navigate = useNavigate();
  const [magazine, setMagazine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const fetchMagazine = async () => {
      const cacheKey = `magazine_${magazineId}`;
      try {
        const cachedData = getSimpleCache(cacheKey);
        if (cachedData) {
          setMagazine(cachedData);
          setIsLoading(false);
          return;
        }

        const data = await getMagazineById(magazineId);
        setMagazine(data);
        setSimpleCache(cacheKey, data);
      } catch (err) {
        setError("मासिक लोड करण्यात अयशस्वी. कृपया नंतर प्रयत्न करा.");
      } finally {
        setIsLoading(false);
      }
    };

    if (magazineId) {
      fetchMagazine();
    }
  }, [magazineId]);

  const handleToggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleToggleAll = () => {
    if (!magazine) return;
    const shouldOpenAll = !isAnySectionOpen;

    const newState = {};
    magazine.sections.forEach((s) => {
      newState[s.sectionId] = shouldOpenAll;
    });
    setExpandedSections(newState);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button onClick={() => navigate("/ca")} sx={{ mt: 2 }}>
          मागे जा
        </Button>
      </Box>
    );
  }

  if (!magazine) {
    return null;
  }

  const isAnySectionOpen = Object.values(expandedSections).some(
    (v) => v === true,
  );

  return (
    <SecurityOverlay>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%)",
          pb: 4,
        }}
      >
        <Container
          maxWidth="md"
          disableGutters
          sx={{ pt: 1.5, px: { xs: 1, sm: 1.5 } }}
        >
          {/* Header */}
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 1.5,
              borderRadius: 2,
              background:
                "linear-gradient(135deg,rgb(114, 34, 0) 0%,rgb(0, 0, 0) 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 240,
                height: 240,
                borderRadius: "60%",
                background: "rgba(255,255,255,0.1)",
              }}
            />

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  mb: 1,
                }}
              >
                <IconButton
                  onClick={() => navigate(-1)}
                  sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
                }}
              >
                {magazine.title}
              </Typography>
            </Box>
          </Paper>

          {/* Toggle All Button */}
          <Button
            variant="contained"
            onClick={handleToggleAll}
            fullWidth
            size="medium"
            startIcon={
              isAnySectionOpen ? <UnfoldLessIcon /> : <UnfoldMoreIcon />
            }
            sx={{
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              mb: 1.5,
              py: 1,
              background: "#000",
              "&:hover": {
                background: "#1a1a1a",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              },
              "&:active": {
                background: "#000",
              },
            }}
          >
            {isAnySectionOpen ? "सर्व माहिती लपवा" : "सर्व माहिती उलगडा"}
          </Button>

          {/* Sections with Gradient Headers */}
          {magazine.sections.map((s, index) => {
            const gradient = HEADER_GRADIENTS[index % HEADER_GRADIENTS.length];
            return (
              <Accordion
                key={s.sectionId}
                expanded={!!expandedSections[s.sectionId]}
                onChange={() => handleToggleSection(s.sectionId)}
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                    transform: "translateY(-2px)",
                  },
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        color: "#fff",
                        fontSize: 32,
                        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
                      }}
                    />
                  }
                  sx={{
                    background: gradient,
                    minHeight: { xs: 100, sm: 110, md: 120 },
                    p: { xs: 2, sm: 2.5, md: 3 },
                    pr: { xs: 6, sm: 7 },
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0,0,0,0.15)",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover::before": {
                      opacity: 1,
                    },
                    "& .MuiAccordionSummary-content": {
                      my: 1,
                      position: "relative",
                      zIndex: 1,
                    },
                  }}
                >
                  <Box sx={{ width: "100%" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#fff",
                        fontSize: {
                          xs: "1.1rem",
                          sm: "1.25rem",
                          md: "1.4rem",
                        },
                        mb: s.tag ? 0.8 : 0,
                        textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                        lineHeight: 1.3,
                        letterSpacing: "0.3px",
                      }}
                    >
                      {s.title}
                    </Typography>
                    {s.tag && (
                      <Chip
                        label={s.tag}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.25)",
                          backdropFilter: "blur(12px)",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          height: { xs: 22, sm: 24 },
                          border: "1px solid rgba(255,255,255,0.3)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      />
                    )}
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  sx={{
                    bgcolor: "#fafafa",
                    p: { xs: 1.5, sm: 2 },
                  }}
                >
                  <SectionContent section={s} />
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Container>
      </Box>
    </SecurityOverlay>
  );
}
