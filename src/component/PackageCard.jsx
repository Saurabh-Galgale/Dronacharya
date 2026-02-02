import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Divider,
  Chip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const PackageCard = ({ pkg, onEnter, onBuy, isSubscribed }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Array of rotating questions (can be customized or passed as props)
  const defaultQuestions = [
    "जानेवारी २०२६: महाराष्ट्राची पहिली 'महिला उपमुख्यमंत्री' कोण? 😲",
    "२६ जानेवारी २०२६ चे प्रमुख पाहुणे कोण होते? आठवतंय? 🇪🇺",
    "२०२६ अपडेट: महाराष्ट्राचे नवीन DGP कोण? हे माहीतच पाहिजे! 👮‍♂️",
    "२०२६ च्या परेडमध्ये महाराष्ट्राचा चित्ररथ कोणता होता? 🚩",
    "२०२६ चे पद्मश्री: पालघरच्या 'तारपा' वादकाचे नाव काय? 🏆",
    "जानेवारी २०२६ ची नियुक्ती: राज्याचे नवीन मुख्य सचिव कोण? 📝",
    "२०२६ चे 'अशोक चक्र' कोणाला मिळाले? नाव सांगा पाहू! 🎖️",
    "२०२६ पद्मभूषण: 'मिले सूर मेरा तुम्हारा' चे जनक कोण? 🎶",
    "२०२६ मध्ये तमाशा कलेसाठी कोणाला पद्मश्री मिळाला? 🎭",
  ];

  const questions = pkg.marketingQuestions || defaultQuestions;

  useEffect(() => {
    const questionInterval = setInterval(() => {
      setCurrentQuestionIndex(
        (prevIndex) => (prevIndex + 1) % questions.length,
      );
    }, 5000);

    return () => {
      clearInterval(questionInterval);
    };
  }, [questions.length]);

  const handleOpenDialog = (e) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleCloseDialog = (e) => {
    if (e) e.stopPropagation();
    setOpenDialog(false);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    onBuy(pkg);
    handleCloseDialog();
  };

  const handleCardClick = () => {
    onEnter(pkg);
  };

  const hasAccess = pkg.isPurchased || (pkg.isAvailableToSubscribers && isSubscribed) || pkg.isFree;

  return (
    <>
      {/* Premium Package Card */}
      <Box sx={{ width: "100%", mb: 3 }}>
        <Card
          onClick={handleCardClick}
          sx={{
            cursor: "pointer",
            borderRadius: 5,
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #e94560 100%)",
            boxShadow:
              "0 20px 60px rgba(233, 69, 96, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.3)",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "2px solid transparent",
            backgroundClip: "padding-box",

            // Border Glow logic
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 5,
              padding: "2px",
              background:
                "linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B, #FFD700)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              animation: "border-glow 3s linear infinite",
            },

            "&::after": {
              content: '""',
              position: "absolute",
              top: "-100%",
              left: "-100%",
              width: "200%",
              height: "200%",
              background:
                "linear-gradient(135deg, transparent, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 60%, transparent)",
              animation: "shimmer-diagonal 2s infinite linear",
              zIndex: 3,
              pointerEvents: "none",
            },

            "@keyframes shimmer-diagonal": {
              "0%": { transform: "translate(0, 0)" },
              "100%": { transform: "translate(100%, 100%)" },
            },

            "&:hover": {
              transform: "translateY(-8px) scale(1.02)",
              boxShadow:
                "0 30px 80px rgba(233, 69, 96, 0.6), 0 0 0 2px rgba(255, 215, 0, 0.5)",
            },

            "@keyframes border-glow": {
              "0%": { filter: "hue-rotate(0deg) brightness(1.2)" },
              "50%": { filter: "hue-rotate(180deg) brightness(1.5)" },
              "100%": { filter: "hue-rotate(360deg) brightness(1.2)" },
            },
          }}
        >
          {/* Tags Section */}
          <Box
            sx={{
              position: "absolute",
              top: 20,
              left: 20,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {pkg.isPurchased && (
              <Chip
                icon={<CheckCircleIcon sx={{ color: "white !important" }} />}
                label="खरेदी केलेले"
                size="small"
                sx={{
                  bgcolor: "rgba(74, 222, 128, 0.9)",
                  color: "white",
                  fontWeight: 700,
                  backdropFilter: "blur(4px)",
                }}
              />
            )}
            {pkg.isAvailableToSubscribers && isSubscribed && !pkg.isPurchased && (
              <Chip
                icon={<StarIcon sx={{ color: "white !important" }} />}
                label="सदस्यतेमध्ये उपलब्ध"
                size="small"
                sx={{
                  bgcolor: "rgba(59, 130, 246, 0.9)",
                  color: "white",
                  fontWeight: 700,
                  backdropFilter: "blur(4px)",
                }}
              />
            )}
            {pkg.isFree && (
              <Chip
                label="मोफत"
                size="small"
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  color: "black",
                  fontWeight: 700,
                  backdropFilter: "blur(4px)",
                }}
              />
            )}
          </Box>

          {/* 3D Corner Ribbon */}
          <Box
            sx={{
              position: "absolute",
              top: 28,
              right: -35,
              width: "160px",
              height: "36px",
              background: "linear-gradient(to bottom, #ff4d4d, #b30000)",
              transform: "rotate(45deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: 900,
                fontSize: "1.2rem",
                letterSpacing: "1px",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              {pkg.year || "२०२६"}
            </Typography>
          </Box>

          {/* Animated Background Elements */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "150%",
              height: "150%",
              background:
                "radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)",
              animation: "rotate-glow 20s linear infinite",
              "@keyframes rotate-glow": {
                "0%": { transform: "translate(-50%, -50%) rotate(0deg)" },
                "100%": { transform: "translate(-50%, -50%) rotate(360deg)" },
              },
            }}
          />

          <CardContent sx={{ p: 4, position: "relative", zIndex: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  py: 1,
                  fontWeight: 900,
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FFF 50%, #FFD700 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                  textShadow: "0 0 30px rgba(255, 215, 0, 0.5)",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                {pkg.name}
              </Typography>

              {/* Rotating Question */}
              <Typography
                variant="h3"
                color="white"
                sx={{
                  fontWeight: 1000,
                  mb: 2,
                  textShadow: "0 0 30px rgba(0, 0, 0, 0.5)",
                  fontSize: { xs: "1.5rem", md: "2.2rem" },
                  minHeight: { xs: "80px", md: "100px" },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.5s ease",
                }}
              >
                {questions[currentQuestionIndex]}
              </Typography>

              {/* Main Offer */}
              <Typography
                variant="h4"
                sx={{
                  py: 1,
                  fontWeight: 900,
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FFF 50%, #FFD700 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                  textShadow: "0 0 30px rgba(255, 215, 0, 0.5)",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                फक्त ₹{pkg.price} मध्ये {pkg.totalPapers} प्रश्नपत्रिका!
              </Typography>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  width: "100%",
                  maxWidth: "600px",
                  mt: 2,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  endIcon={<TrendingUpIcon />}
                  sx={{
                    background:
                      "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    color: "#1a1a2e",
                    fontWeight: 900,
                    fontSize: "1rem",
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    boxShadow: "0 8px 24px rgba(255, 215, 0, 0.4)",
                    border: "2px solid #FFD700",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #FFA500 0%, #FFD700 100%)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  प्रवेश करा
                </Button>

                {!hasAccess && (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={handleOpenDialog}
                    sx={{
                      borderColor: "#FFD700",
                      color: "#FFD700",
                      fontWeight: 900,
                      fontSize: "1rem",
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      borderWidth: "2px",
                      "&:hover": {
                        borderColor: "#FFA500",
                        bgcolor: "rgba(255, 215, 0, 0.1)",
                        borderWidth: "2px",
                      },
                    }}
                  >
                    तपशील पहा
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Premium Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #e94560 0%, #533483 100%)",
            color: "white",
            fontWeight: 800,
            fontSize: "1.5rem",
            position: "relative",
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StarIcon sx={{ color: "#FFD700", fontSize: 32 }} />
            {pkg.name}
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box
            sx={{
              textAlign: "center",
              my: 3,
              p: 3,
              borderRadius: 2,
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(255, 215, 0, 0.5)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: "150px",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
                zIndex: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              फक्त ₹{pkg.price}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.95)",
                fontWeight: 600,
                zIndex: 1,
                textShadow: "0 1px 5px rgba(0,0,0,0.8)",
              }}
            >
              {pkg.totalPapers} प्रश्नपत्रिकांसाठी कायमस्वरूपी प्रवेश
            </Typography>
          </Box>

          <Divider sx={{ mb: 3, bgcolor: "rgba(255, 255, 255, 0.1)" }} />

          <Typography
            variant="h6"
            sx={{
              color: "#FFD700",
              fontWeight: 700,
              mb: 2,
              textAlign: "center",
            }}
          >
            या पॅकेजमध्ये समाविष्ट:
          </Typography>

          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <CheckCircleOutlineIcon
                sx={{
                  color: "#4ade80",
                  fontSize: 28,
                  mt: 0.5,
                  filter: "drop-shadow(0 0 8px rgba(74, 222, 128, 0.6))",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: 700, mb: 0.5 }}
                >
                  तज्ज्ञांनी निवडलेले प्रश्न
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  तज्ज्ञांनी काळजीपूर्वक निवडलेले आणि आगामी परीक्षेसाठी विशेष
                  तयार केलेले प्रश्न
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <CheckCircleOutlineIcon
                sx={{
                  color: "#4ade80",
                  fontSize: 28,
                  mt: 0.5,
                  filter: "drop-shadow(0 0 8px rgba(74, 222, 128, 0.6))",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: 700, mb: 0.5 }}
                >
                  संपूर्ण विश्लेषण आणि स्पष्टीकरण
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  प्रत्येक प्रश्नाचे सविस्तर स्पष्टीकरण आणि तुमच्या कामगिरीचे
                  सखोल विश्लेषण
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <CheckCircleOutlineIcon
                sx={{
                  color: "#4ade80",
                  fontSize: 28,
                  mt: 0.5,
                  filter: "drop-shadow(0 0 8px rgba(74, 222, 128, 0.6))",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: 700, mb: 0.5 }}
                >
                  आजीवन प्रवेश
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  एकदा खरेदी करा आणि आयुष्यभर कधीही सराव करा
                </Typography>
              </Box>
            </Box>
          </Box>

          {pkg.isAvailableToSubscribers && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                mb: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: "#93c5fd", fontWeight: 600 }}>
                टीप: हे पॅकेज प्रीमियम सदस्यांसाठी विनामूल्य उपलब्ध आहे.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            background: "rgba(255, 255, 255, 0.03)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleBuyNow}
            sx={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              color: "#1a1a2e",
              fontWeight: 900,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              boxShadow: "0 8px 24px rgba(255, 215, 0, 0.4)",
              border: "2px solid #FFD700",
              "&:hover": {
                background: "linear-gradient(135deg, #FFA500 0%, #FFD700 100%)",
                boxShadow: "0 12px 32px rgba(255, 215, 0, 0.6)",
              },
            }}
          >
            ₹{pkg.price} मध्ये आत्ताच खरेदी करा
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PackageCard;
