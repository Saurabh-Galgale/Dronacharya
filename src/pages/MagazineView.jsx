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
        borderRadius: 3,
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
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#de6925",
            mb: 2,
            borderBottom: "2px solid rgba(222,105,37,0.1)",
            pb: 1,
          }}
        >
          {data.heading}
        </Typography>
        {data.items.map((item, i) => (
          <Box key={i} sx={{ mb: 2, display: "flex", flexDirection: "column" }}>
            <Typography
              variant="caption"
              sx={{
                color: "#666",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
              }}
            >
              {item.label}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#212121",
                fontWeight: 500,
                fontSize: "1.05rem",
                lineHeight: 1.4,
              }}
            >
              {item.value}
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
        borderRadius: 3,
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
                  fontSize: "1rem",
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
                    fontSize: "1rem",
                    color: "#333",
                    fontWeight: j === 0 ? 600 : 400,
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

// Updated Bullet List to handle descriptions
function BulletList({ data }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" },
        gap: 2,
      }}
    >
      {data.bullets.map((b, i) => {
        // Handle both string and object formats
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
              p: 2,
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
            <VerifiedIcon sx={{ color: "#de6925", fontSize: 20, mt: 0.3 }} />
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color: "#212121",
                  fontSize: "1.05rem",
                  lineHeight: 1.5,
                  fontWeight: 600,
                }}
              >
                {text}
              </Typography>
              {description && (
                <Typography
                  variant="body2"
                  sx={{ color: "#666", mt: 0.5, lineHeight: 1.4 }}
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
        p: 3,
        textAlign: "center",
        borderRadius: 3,
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
        sx={{ color: "#757575", fontWeight: 600, mb: 1 }}
      >
        {data.title}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: "#de6925",
          mb: 1,
        }}
      >
        {data.value}
      </Typography>
      <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.4 }}>
        {data.description}
      </Typography>
    </Card>
  );
}

// 1. UPDATED: Subtitle Logic changed (No Chip, below title)
function SimpleList({ data }) {
  return (
    <Box>
      {data.items.map((item, i) => (
        <Box key={i}>
          <Box
            sx={{
              py: 2.5,
              px: 2,
              borderRadius: 2,
              transition: "background 0.2s",
              "&:hover": { bgcolor: "rgba(222,105,37,0.04)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column", // Stack vertically
                mb: 0.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#212121", fontSize: "1.1rem" }}
              >
                {item.title}
              </Typography>

              {/* Subtitle below title, orange color, readable font */}
              {item.subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#de6925",
                    fontWeight: 600,
                    fontSize: "0.95rem",
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
                  fontSize: "1.05rem",
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
        p: 3,
        borderRadius: 3,
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
          fontSize: "1.1rem",
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
            gap: 2,
          }}
        >
          {section.blocks.map((b, i) => (
            <ContentBlockRenderer key={i} block={b} />
          ))}
        </Box>
      ) : (
        section.blocks.map((b, i) => (
          <Box key={i} sx={{ mb: 2 }}>
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
          setInitialExpanded(cachedData.sections);
          setIsLoading(false);
          return;
        }

        const data = await getMagazineById(magazineId);
        setMagazine(data);
        setSimpleCache(cacheKey, data);
        setInitialExpanded(data.sections);
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

  const setInitialExpanded = (sections) => {
    const initialExpanded = {};
    if (sections) {
      sections.forEach((s) => {
        initialExpanded[s.sectionId] = true;
      });
    }
    setExpandedSections(initialExpanded);
  };

  const handleToggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleToggleAll = () => {
    if (!magazine) return;
    const isAllOpen = Object.values(expandedSections).every((v) => v === true);
    const newState = {};
    magazine.sections.forEach((s) => {
      newState[s.sectionId] = !isAllOpen;
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
    return null; // Or a 'Not Found' component
  }

  const isAllOpen = Object.values(expandedSections).every((v) => v === true);

  return (
    <SecurityOverlay>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%)",
          pb: 6,
        }}
      >
        <Container maxWidth="md" disableGutters sx={{ pt: 2, px: 2 }}>
          <Paper
            elevation={4}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 1,
              borderRadius: 2,
              background: "linear-gradient(135deg, #de6925 0%, #ff8f00 100%)",
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

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
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
                  mb: 1.5,
                  fontSize: { xs: "1.75rem", md: "2.5rem" },
                }}
              >
                {magazine.title}
              </Typography>
            </Box>
          </Paper>

          <Button
            variant="contained"
            onClick={handleToggleAll}
            fullWidth
            size="medium"
            startIcon={isAllOpen ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
            sx={{
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              mb: 1,
            }}
          >
            {isAllOpen ? "सर्व बंद करा" : "सर्व उघडा"}
          </Button>

          {magazine.sections.map((s) => (
            <Accordion
              key={s.sectionId}
              expanded={!!expandedSections[s.sectionId]}
              onChange={() => handleToggleSection(s.sectionId)}
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.02)",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon sx={{ color: "#de6925", fontSize: 28 }} />
                }
                sx={{
                  bgcolor: "#fff",
                  px: 1,
                  py: 1,
                  "& .MuiAccordionSummary-content": {
                    display: "block",
                    my: 2,
                  },
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                      flexWrap: "wrap",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: "#37474f",
                        fontSize: "1.25rem",
                      }}
                    >
                      {s.title}
                    </Typography>
                    {s.tag && (
                      <Chip
                        label={s.tag}
                        size="small"
                        sx={{
                          bgcolor: "rgba(222,105,37,0.08)",
                          color: "#de6925",
                          fontWeight: 700,
                          ml: { xs: 0, sm: "auto" },
                          mr: { xs: "auto", sm: 2 },
                          mt: { xs: 1, sm: 0 },
                        }}
                      />
                    )}
                  </Box>

                  {s.url && (
                    <Box
                      component="img"
                      src={s.url}
                      alt={s.title}
                      sx={{
                        width: "100%",
                        height: "auto",
                        maxHeight: 250,
                        objectFit: "cover",
                        borderRadius: 3,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        display: "block",
                      }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails
                sx={{ bgcolor: "#fafafa", p: { xs: 2, md: 3 } }}
              >
                <SectionContent section={s} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>
    </SecurityOverlay>
  );
}
