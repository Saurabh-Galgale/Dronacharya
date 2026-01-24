import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";

const RestoreSessionDialog = ({
  open,
  onStartFresh,
  onContinue,
  savedAnswerCount,
}) => {
  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          bgcolor: "#1a1a1a",
          color: "white",
          borderRadius: "20px",
          padding: "10px",
          maxWidth: "380px",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 900,
          color: "#de6925",
          fontSize: "1.5rem",
        }}
      >
        पुन्हा स्वागत आहे!
      </DialogTitle>
      <DialogContent>
        <Typography
          sx={{
            textAlign: "center",
            fontSize: "1.1rem",
            lineHeight: 1.6,
            mb: 2,
          }}
        >
          आम्हाला या पेपरसाठी तुमची <strong>{savedAnswerCount}</strong> उत्तरे
          जतन केलेली (saved) सापडली आहेत. तुम्हाला जिथे थांबला होता तिथूनच पुढे
          सुरू करायचे आहे की नव्याने सुरुवात करायची आहे?
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#aaa", textAlign: "center" }}
          >
            नव्याने सुरुवात केल्यास तुमची या पेपरची मागील सर्व उत्तरे कायमची
            हटवली जातील.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexDirection: "column", gap: 1, p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onContinue}
          sx={{
            background: "linear-gradient(135deg, #de6925, #f8b14a)",
            color: "#fff",
            fontWeight: 800,
            borderRadius: "12px",
            py: 1.5,
          }}
        >
          परीक्षा पुढे सुरू ठेवा
        </Button>
        <Button
          fullWidth
          onClick={onStartFresh}
          sx={{
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.9rem",
            background: "black",
            "&:hover": {
              background: "#222",
            },
          }}
        >
          नव्याने सुरुवात करा
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestoreSessionDialog;
