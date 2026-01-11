// src/layout/MainLayout.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import BubbleChartOutlinedIcon from "@mui/icons-material/BubbleChartOutlined";
import RocketIcon from "@mui/icons-material/Rocket";
import RocketOutlinedIcon from "@mui/icons-material/RocketOutlined";
import QuizIcon from "@mui/icons-material/Quiz";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import NestCamWiredStandIcon from "@mui/icons-material/NestCamWiredStand";
import NestCamWiredStandOutlinedIcon from "@mui/icons-material/NestCamWiredStandOutlined";
import DrawIcon from "@mui/icons-material/Draw";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import LoyaltyOutlinedIcon from "@mui/icons-material/LoyaltyOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

import Footer from "../component/Footer";
import { useTheme } from "@mui/material/styles";
import { clearToken } from "../services/authService";

const drawerWidth = 280;

const listButtonSx = {
  px: 2,
  mx: 1.5,
  borderRadius: "14px",
  mb: 0.8,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&.Mui-selected": {
    background:
      "linear-gradient(135deg,rgba(222, 105, 37, 0.6),rgba(248, 178, 74, 0.6))",
    boxShadow: "0px 4px 12px rgba(222, 105, 37, 0.25)",
    "& .MuiListItemIcon-root": { color: "black" },
    "& .MuiListItemText-primary": { fontWeight: "bold", color: "black" },
    "&:hover": {
      background: "linear-gradient(135deg, #de6925, #f8b14a)",
    },
  },
  "&:hover": {
    background: "rgba(222, 105, 37, 0.08)",
  },
};

export default function Layout({ children }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();

  // const { triggerForceLogout } = useAuth();
  // useEffect(() => {
  //   const handleForceLogout = () => {
  //     triggerForceLogout();
  //   };

  //   window.addEventListener("forceLogout", handleForceLogout);

  //   return () => {
  //     window.removeEventListener("forceLogout", handleForceLogout);
  //   };
  // }, [triggerForceLogout]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const hideFooterPaths = ["/blogs"];
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  const handleLogout = () => {
    clearToken?.();
    window.location.assign("/");
  };

  // Sidebar Menu Logic
  const menuItems = [
    {
      text: "मुख्यपृष्ठ",
      icon: <HomeOutlinedIcon />,
      iconActive: <HomeIcon />, // Add Filled version
      path: "/dashboard",
    },
    {
      text: "विश्लेषण",
      icon: <BubbleChartOutlinedIcon />,
      iconActive: <BubbleChartIcon />,
      path: "/analysis",
    },
    {
      text: "लघु प्रश्नपत्रिका",
      icon: <RocketOutlinedIcon />, // Ensure you import this if not already
      iconActive: <RocketIcon />,
      path: "/short",
    },
    {
      text: "सराव प्रश्नपत्रिका",
      icon: <QuizOutlinedIcon />,
      iconActive: <QuizIcon />,
      path: "/mock",
    },
    {
      text: "मागील प्रश्नपत्रिका",
      icon: <LibraryBooksOutlinedIcon />, // Changed to match your imports
      iconActive: <LibraryBooksIcon />, // Assuming MenuBook is the filled version you want
      path: "/pyq",
    },
  ];

  const studyContentItems = [
    {
      text: "चालू घडामोडी",
      icon: <NestCamWiredStandOutlinedIcon />,
      iconActive: <NestCamWiredStandIcon />, // If you don't have an outline version, keep same
      path: "/ca",
    },
    {
      text: "लेख",
      icon: <DrawOutlinedIcon />,
      iconActive: <DrawIcon />,
      path: "/blogs",
    },
  ];

  const accountItems = [
    {
      text: "सदस्यता",
      icon: <LoyaltyOutlinedIcon />,
      iconActive: <LoyaltyIcon />,
      path: "/subscription",
    },
    {
      text: "माझे खाते",
      icon: <PersonOutlinedIcon />,
      iconActive: <PersonIcon />, // You can import AccountCircleOutlined if needed
      path: "/profile",
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Toolbar />
        {/* मुख्य मेनू Section */}
        <List>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path; // Check selection
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={listButtonSx}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 42,
                      color:
                        location.pathname === item.path ? "white" : "inherit",
                    }}
                  >
                    {isSelected ? item.iconActive : item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ my: 1, mx: 2 }} />
        <List>
          {studyContentItems.map((item) => {
            const isSelected = location.pathname === item.path; // Check selection
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={listButtonSx}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 42,
                      color:
                        location.pathname === item.path ? "white" : "inherit",
                    }}
                  >
                    {isSelected ? item.iconActive : item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ my: 1, mx: 2 }} />
        {/* माहिती व खाते Section */}
        <List>
          {accountItems.map((item) => {
            const isSelected = location.pathname === item.path; // Check selection
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={listButtonSx}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 42,
                      color:
                        location.pathname === item.path ? "white" : "inherit",
                    }}
                  >
                    {isSelected ? item.iconActive : item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* Logout Option in Sidebar */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setLogoutDialogOpen(true)}
              sx={{ ...listButtonSx, mt: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="बाहेर पडा" sx={{ color: "error.main" }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Sidebar Footer with Copyright */}
      <Box
        sx={{
          p: 2,
          borderTop: "2px solid",
          borderColor: "divider",
          background:
            "linear-gradient(135deg,rgba(222, 105, 37, 0.5),rgba(248, 178, 74, 0.5))",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "black",
            fontSize: "12px",
          }}
        >
          © {new Date().getFullYear()} द्रोणाचार्य करिअर अकॅडमी
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "black",
            fontSize: "10px",
            mt: 0.5,
          }}
        >
          All rights reserved
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9f9f9" }}>
      <CssBaseline />

      {/* Header / AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          background: "linear-gradient(135deg, #de6925, #f8b14a)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: 56,
            height: 56,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Left: Mobile Toggle */}
          <Box sx={{ width: 48 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>

          {/* Center: Brand Name */}
          <Typography
            variant={isMobile ? "h6" : "h5"}
            fontWeight="bold"
            textAlign="center"
            sx={{
              fontFamily: "'Gotu', sans-serif",
              color: "white",
              textDecoration: "none",
              flexGrow: 1,
            }}
            component={Link}
            to="/dashboard"
          >
            द्रोणाचार्य करिअर अकॅडमी
          </Typography>

          {/* Right: Profile Menu Icon */}
          <Box sx={{ width: 48, display: "flex", justifyContent: "flex-end" }}>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* 3-Dot Profile Popup Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: { mt: 1.5, minWidth: 200, borderRadius: "16px" },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/profile");
              }}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              माझे खाते
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/subscription");
              }}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <SubscriptionsIcon fontSize="small" />
              </ListItemIcon>
              सदस्यता
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                setLogoutDialogOpen(true);
              }}
              sx={{ color: "error.main", py: 1.5 }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              बाहेर पडा
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Side Navigation (Drawer) */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "none",
              boxShadow: "10px 0 20px rgba(0,0,0,0.05)",
              transition: theme.transitions.create(["transform"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Page Content Holder */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>{children}</Box>

        {/* Footer Component */}
        {shouldShowFooter && <Footer />}
      </Box>

      {/* Global Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "20px" } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>बाहेर पडायचे?</DialogTitle>
        <DialogContent>नक्की बाहेर पडायचे आहे का?</DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: "10px" }}
          >
            रद्द करा
          </Button>
          <Button
            onClick={handleLogout}
            color="error"
            variant="contained"
            sx={{ borderRadius: "10px", px: 3 }}
          >
            होय, बाहेर पडा
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
