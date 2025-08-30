import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

const ProfileCard = () => {
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);

  // ✅ Load profile or create default
  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      setProfile(JSON.parse(stored));
    } else {
      // Create minimal profile with date
      const defaultProfile = {
        name: "",
        email: "",
        phone: "",
        avatar:
          "https://png.pngtree.com/png-clipart/20250104/original/pngtree-smiling-male-avatar-with-glasses-and-stylish-mustache-for-profile-icons-png-image_20072133.png",
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("userProfile", JSON.stringify(defaultProfile));
      setProfile(defaultProfile);
      setOpen(true); // open form immediately for first-time user
    }
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    setOpen(false);
  };

  if (!profile) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: "90vh",
        mt: { xs: 2, sm: 5 }, // responsive top margin
        px: 2, // horizontal padding
      }}
    >
      <Card
        sx={{
          width: "100%", // take full width of parent Box
          maxWidth: 500, // limit max width on large screens
          borderRadius: 3,
          boxShadow: 6,
          p: { xs: 2, sm: 3 }, // responsive padding
          textAlign: "center",
        }}
      >
        <CardContent>
          <Avatar
            src={profile.avatar}
            alt={profile.name || "User"}
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              mb: 2,
              boxShadow: 3,
            }}
          />
          <Typography variant="h5" fontWeight={600}>
            {profile.name || "Unnamed User"}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1} alignItems="center">
            <Typography variant="body1">
              <strong>Email:</strong> {profile.email || "-"}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {profile.phone || "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Profile Created:</strong>{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </Typography>
          </Stack>
        </CardContent>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={2} justifyContent="center" pb={2}>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            {profile.name ? "Edit Profile" : "Complete Profile"}
          </Button>
        </Stack>
      </Card>

      {/* Profile Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {profile.name ? "Edit Profile" : "Create Profile"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Full Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileCard;
