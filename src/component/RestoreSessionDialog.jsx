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
      // Non-dismissible: no onClose handler, disable escape key
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
        Welcome Back!
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
          We found your saved progress for this paper with{" "}
          <strong>{savedAnswerCount}</strong> answers. Would you like to
          continue where you left off or start fresh?
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
            Starting fresh will permanently delete your previous answers for
            this paper.
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
          Continue Progress
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
          Start Fresh
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestoreSessionDialog;
