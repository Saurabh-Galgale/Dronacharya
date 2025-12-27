import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0a0a0a", // Slightly darker for better contrast
        color: "white",
        pt: 8,
        pb: 4,
        borderTop: "1px solid #333",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Academy Info */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: "linear-gradient(135deg, #de6925, #f8b14a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              द्रोणाचार्य करिअर अकॅडमी
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#999", mb: 3, maxWidth: 300 }}
            >
              आपल्या यशासाठी समर्पित शैक्षणिक मंच. स्पर्धा परीक्षेच्या तयारीसाठी
              विश्वसनीय नाव.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailIcon sx={{ fontSize: 18, color: "#de6925" }} />
                <Typography variant="body2" sx={{ color: "#bbb" }}>
                  help.dronacharyacareeracademy@gmail.com
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon sx={{ fontSize: 18, color: "#de6925" }} />
                <Typography variant="body2" sx={{ color: "#bbb" }}>
                  +91 8600326056
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={4}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: "#de6925" }}
            >
              Quick Links
            </Typography>
            <List dense disablePadding>
              {[
                { text: "मुख्यपृष्ठ", path: "/" },
                { text: "सराव प्रश्नपत्रिका", path: "/mock" },
                { text: "मागील प्रश्नपत्रिका", path: "/pyq" },
                { text: "Contact Us", path: "/contact-us" },
              ].map((item, idx) => (
                <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      p: 0,
                      color: "#999",
                      "&:hover": { color: "#de6925", bgcolor: "transparent" },
                    }}
                  >
                    <Typography variant="body2">{item.text}</Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Legal - MANDATORY FOR RAZORPAY */}
          <Grid item xs={6} md={4}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: "#de6925" }}
            >
              Legal & Policies
            </Typography>
            <List dense disablePadding>
              {[
                { text: "Terms & Conditions", path: "/terms-and-conditions" },
                { text: "Privacy Policy", path: "/privacy-policy" },
                { text: "Refund Policy", path: "/refund-policy" },
                { text: "Shipping & Delivery", path: "/shipping-and-delivery" },
              ].map((item, idx) => (
                <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      p: 0,
                      color: "#999",
                      "&:hover": { color: "#de6925", bgcolor: "transparent" },
                    }}
                  >
                    <Typography variant="body2">{item.text}</Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "#222" }} />

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: "#666" }}>
            © {new Date().getFullYear()} द्रोणाचार्य करिअर अकॅडमी. All rights
            reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
