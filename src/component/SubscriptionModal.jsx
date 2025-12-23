import React from "react";
import { Modal, Box, Typography, Button, Fade, Backdrop } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
  borderRadius: 2,
};

const SubscriptionModal = ({ open, handleClose }) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    handleClose();
    navigate("/mock-papers"); // Or any other relevant page
  };

  return (
    <Modal
      aria-labelledby="subscription-success-modal-title"
      aria-describedby="subscription-success-modal-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box sx={style}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 60, color: "success.main" }}
          />
          <Typography
            id="subscription-success-modal-title"
            variant="h6"
            component="h2"
            sx={{ mt: 2 }}
          >
            Payment Successful!
          </Typography>
          <Typography
            id="subscription-success-modal-description"
            sx={{ mt: 2 }}
          >
            Your subscription has been activated. You now have full access to
            all our premium content.
          </Typography>
          <Button
            variant="contained"
            onClick={handleRedirect}
            sx={{ mt: 3, textTransform: "none" }}
          >
            Start Learning
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SubscriptionModal;
