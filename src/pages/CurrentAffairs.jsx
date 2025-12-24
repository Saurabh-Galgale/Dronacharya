import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Container,
  Dialog,
  Slide,
  Fab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

// PDF Viewer Imports
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MONTHS = [
  "जानेवारी",
  "फेब्रुवारी",
  "मार्च",
  "एप्रिल",
  "मे",
  "जून",
  "जुलै",
  "ऑगस्ट",
  "सप्टेंबर",
  "ऑक्टोबर",
  "नोव्हेंबर",
  "डिसेंबर",
];

const MagazineCard = ({ month, isOpen, onToggle, onOpenPdf }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Box
      ref={cardRef}
      sx={{
        mb: 3,
        width: "100%",
        perspective: "1500px",
        height: isOpen ? "500px" : "150px",
        transition: "all 0.5s ease-in-out",
      }}
    >
      <Box
        onClick={onToggle}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isOpen ? "rotateY(180deg)" : "rotateY(0deg)",
          cursor: "pointer",
        }}
      >
        {/* FRONT */}
        <Card
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
            color: "white",
            borderRadius: 4,
            boxShadow: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {month}
          </Typography>
          <Typography variant="subtitle2">२०२५</Typography>
        </Card>
        {/* BACK */}
        <Card
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: "flex",
            flexDirection: "column",
            borderRadius: 4,
            bgcolor: "#fff",
            border: "2px solid #1e3c72",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: "#1e3c72",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              {month} - अनुक्रमणिका
            </Typography>
            <IconButton
              size="small"
              color="inherit"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
            {["घडामोडी", "प्रशासन", "कायदे", "प्रश्नपत्रिका"].map(
              (item, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{ py: 1, borderBottom: "1px dotted #ccc" }}
                >
                  🎯 {item}
                </Typography>
              )
            )}
          </Box>
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              fullWidth
              className="no-flip"
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                fontWeight: 800,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenPdf(month);
              }}
            >
              पूर्ण वाचा
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

const MagazinePage = () => {
  const [openMonthIndex, setOpenMonthIndex] = useState(null);
  const [openReader, setOpenReader] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [zoom, setZoom] = useState(SpecialZoomLevel.PageWidth);

  const handleOpenPdf = (month) => {
    setSelectedMonth(month);
    setOpenReader(true);
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: 4 }}>
      {/* SECURITY CSS */}
      <style>{`
        @media print { body { display: none !important; } }
        .rpv-core__viewer { user-select: none !important; -webkit-user-select: none !important; }
        .rpv-core__inner-pages { background-color: #2c2c2c !important; }
      `}</style>

      <Container maxWidth="xs">
        <Typography
          variant="h5"
          textAlign="center"
          sx={{ fontWeight: 900, mb: 4, color: "#1e3c72" }}
        >
          २०२५ मासिक संच
        </Typography>

        {MONTHS.map((month, index) => (
          <MagazineCard
            key={index}
            month={month}
            isOpen={openMonthIndex === index}
            onToggle={() =>
              setOpenMonthIndex(openMonthIndex === index ? null : index)
            }
            onOpenPdf={handleOpenPdf}
          />
        ))}

        <Dialog
          fullScreen
          open={openReader}
          onClose={() => setOpenReader(false)}
          TransitionComponent={Transition}
        >
          <Box
            sx={{
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              bgcolor: "#1a1a1a",
              position: "relative",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: "#000",
                color: "#fff",
                zIndex: 1100,
              }}
            >
              <IconButton color="inherit" onClick={() => setOpenReader(false)}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {selectedMonth} २०२५
              </Typography>
            </Box>

            {/* Viewer Area */}
            <Box
              sx={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                bgcolor: "#2c2c2c",
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* SECURITY SHIELD - pointerEvents: none allows scrolling but container blocks context menu */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1000,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />

              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <div style={{ height: "100%" }}>
                  <Viewer fileUrl="/images/sample.pdf" defaultScale={zoom} />
                </div>
              </Worker>
            </Box>

            {/* FLOATING ZOOM CONTROLS (Manual Toolbar) */}
            <Box
              sx={{
                position: "absolute",
                bottom: 30,
                right: 20,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                zIndex: 1200,
              }}
            >
              <Fab
                size="small"
                color="primary"
                onClick={() =>
                  setZoom((prev) =>
                    typeof prev === "number" ? prev + 0.2 : 1.2
                  )
                }
              >
                <AddIcon />
              </Fab>
              <Fab
                size="small"
                color="primary"
                onClick={() =>
                  setZoom((prev) =>
                    typeof prev === "number" ? prev - 0.2 : 0.8
                  )
                }
              >
                <RemoveIcon />
              </Fab>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MagazinePage;
