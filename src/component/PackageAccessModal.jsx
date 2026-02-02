import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";

const PackageAccessModal = ({ open, onClose, isAvailableToSubscribers }) => {
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
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "white",
        },
      }}
    >
      <Box sx={{ position: "absolute", right: 8, top: 8 }}>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4, textAlign: "center" }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
          }}
        >
          <LockIcon sx={{ fontSize: 40, color: "#1a1a2e" }} />
        </Box>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
          प्रवेश नाकारला!
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 4, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}
        >
          तुम्हाला या प्रश्नपत्रिका पाहण्यासाठी एकतर{" "}
          <strong style={{ color: "#FFD700" }}>सदस्यता (Subscription)</strong> घ्यावी लागेल
          {isAvailableToSubscribers ? " किंवा " : " आणि "}
          हे <strong style={{ color: "#FFD700" }}>पॅकेज खरेदी</strong> करावे लागेल.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {isAvailableToSubscribers && (
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
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                color: "white",
              }}
            >
              सदस्यता घ्या
            </Button>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onClose();
              navigate("/packages"); // Navigate to packages to see details and buy
            }}
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              color: "#1a1a2e",
            }}
          >
            पॅकेज खरेदी करा
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PackageAccessModal;
