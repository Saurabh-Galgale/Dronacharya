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

// 2. Vibrant Gradients for Accordion Headers (When image is missing)
const HEADER_GRADIENTS = [
  "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)", // Blueish
  "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)", // Pinky
  "linear-gradient(to right, #43e97b 0%, #38f9d7 100%)", // Greenish
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Deep Purple
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", // Sunrise
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
            {/* CHANGED from item.label to item.title */}
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

            {/* CHANGED from item.value to item.description */}
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

  // const setInitialExpanded = (sections) => {
  //   const initialExpanded = {};
  //   if (sections) {
  //     sections.forEach((s) => {
  //       initialExpanded[s.sectionId] = true;
  //     });
  //   }
  //   setExpandedSections(initialExpanded);
  // };

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
                background: "#1a1a1a", // Slightly lighter black on hover
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              },
              "&:active": {
                background: "#000", // Back to pure black when clicked
              },
            }}
          >
            {isAnySectionOpen ? "सर्व माहिती लपवा" : "सर्व माहिती उलगडा"}
          </Button>

          {/* Sections */}
          {magazine.sections.map((s, index) => {
            const fallbackGradient =
              HEADER_GRADIENTS[index % HEADER_GRADIENTS.length];
            return (
              <Accordion
                key={s.sectionId}
                expanded={!!expandedSections[s.sectionId]}
                onChange={() => handleToggleSection(s.sectionId)}
                sx={{
                  mb: 1.5,
                  borderRadius: 2, // This sets the roundness (approx 8px)
                  overflow: "hidden", // CRITICAL: This clips the sharp image corners to fit the rounded border
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.02)",
                  "&:before": { display: "none" }, // Removes default MUI line
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        color: "#fff",
                        fontSize: 32,
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                        zIndex: 10,
                      }}
                    />
                  }
                  sx={{
                    p: 0, // Removes all internal padding
                    m: 0, // Removes margins
                    minHeight: { xs: 140, sm: 160, md: 180 }, // Set height on Summary
                    "& .MuiAccordionSummary-content": {
                      m: 0, // IMPORTANT: Removes default content margin
                      p: 0,
                      width: "100%", // Force content to take full width
                      flexGrow: 1,
                    },
                    "& .MuiAccordionSummary-expandIconWrapper": {
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                    },
                  }}
                >
                  {/* Image Container */}
                  <Box
                    sx={{
                      position: "absolute", // Take image out of document flow to fill parent
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: "100%",
                      height: expandedSections[s.sectionId]
                        ? { xs: 90, sm: 80, md: 90 }
                        : { xs: 140, sm: 160, md: 180 },
                      zIndex: 1,
                      background: fallbackGradient,
                    }}
                  >
                    {/* Actual Image */}
                    {s.url && s.url !== "" && (
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_CLOUDFRONT_URL}/${s.url}`} // Note: removed slash if env has it, or add '/' if needed
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block", // Removes tiny bottom whitespace in some browsers
                        }}
                      />
                    )}

                    {/* Gradient Overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "100%",
                        background: s.url
                          ? "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)"
                          : fallbackGradient,
                        zIndex: 1,
                      }}
                    />

                    {/* Content */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: { xs: 1.5, sm: 2 },
                        pr: { xs: 5, sm: 6 },
                        zIndex: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: "#fff",
                          fontSize: {
                            xs: "1rem",
                            sm: "1.15rem",
                            md: "1.25rem",
                          },
                          mb: s.tag ? 0.5 : 0,
                          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                          lineHeight: 1.3,
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
                            backdropFilter: "blur(10px)",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            height: { xs: 22, sm: 24 },
                            border: "1px solid rgba(255,255,255,0.3)",
                          }}
                        />
                      )}
                    </Box>
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
