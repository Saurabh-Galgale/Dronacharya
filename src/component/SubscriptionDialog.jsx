import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, Typography, Button, Box } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

const SubscriptionDialog = ({ open, onClose }) => {
  const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onClose={onClose}
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

        <Typography
          variant="body1"
          sx={{ mb: 3, fontWeight: 800, color: "text.secondary" }}
        >
          हे प्रश्नपत्र केवळ सदस्यांसाठी उपलब्ध आहे. संपूर्ण प्रवेश मिळवण्यासाठी
          आत्ताच सदस्यता घ्या!
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
            ✓ सर्व सराव प्रश्नपत्रिकांसाठी प्रवेश
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            ✓ सर्व मागील वर्षांच्या प्रश्नपत्रिकांसाठी प्रवेश
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            ✓ सर्व लघु प्रश्नपत्रिकांसाठी प्रवेश
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            ✓ प्रत्येक पेपरचे तपशीलवार स्वतंत्र विश्लेषण
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            ✓ सर्व प्रश्नपत्रिकांचे एकूण विश्लेषण
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            ✓ संपूर्ण करंट अफेअर्स आणि लेख उपलब्ध
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            onClose();
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
  );
};

export default SubscriptionDialog;
