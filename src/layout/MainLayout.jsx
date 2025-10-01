// src/layout/MainLayout.jsx
import React, { useState, useEffect } from "react";
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
  Fab,
  Paper,
  Avatar,
  TextField,
  Divider,
  ListSubheader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ListIcon from "@mui/icons-material/List";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ArticleIcon from "@mui/icons-material/Article";
import NotesIcon from "@mui/icons-material/Notes";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";

import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TodayIcon from "@mui/icons-material/Today";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";

import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const drawerWidth = 240;

export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);

  // active route
  const location = useLocation();

  // 🚫 Disable right click
  useEffect(() => {
    const handleRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleRightClick);
    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // =========================
  // 🔔 Notifications
  // =========================
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "नवीन अभ्यास साहित्य अपलोड केले आहे." },
    { id: 2, text: "आपल्या हजेरीचा अहवाल तयार आहे." },
    { id: 3, text: "नवीन सराव प्रश्नपत्रिका उपलब्ध आहे." },
  ]);
  const unreadCount = notifications.length;

  // =========================
  // 🔹 AI Chat State
  // =========================
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setChatOpen(!chatOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "तू नेहमी मराठीतच उत्तर देशील. User ने वेगळी भाषा विचारली नाही तर मराठीच वापर.",
              },
              ...newMessages,
            ],
          }),
        }
      );

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "⚠️ No response";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "❌ Error fetching response." },
      ]);
    }
    setLoading(false);
  };

  // helper to mark active
  const isActive = (path) => {
    if (!path) return false;
    // exact match or startsWith for nested routes
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // =========================
  // 🔹 Sidebar Drawer Content
  // =========================
  const drawerContent = (
    <Box sx={{ overflow: "auto", height: "100%" }}>
      <Toolbar
        sx={{
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "space-between",
        }}
      />
      <List
        component="nav"
        aria-label="main mailbox folders"
        subheader={
          <ListSubheader
            component="div"
            sx={{
              bgcolor: "transparent",
              fontWeight: 700,
              fontSize: 14,
              py: 1,
            }}
          >
            मुख्य मेनू
          </ListSubheader>
        }
      >
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/dashboard"
            onClick={() => isMobile && setMobileOpen(false)}
            selected={isActive("/app/dashboard")}
            sx={listButtonSx}
          >
            <ListItemIcon>
              <DashboardIcon
                color={isActive("/app/dashboard") ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText primary="मुख्यपृष्ठ" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/list"
            onClick={() => isMobile && setMobileOpen(false)}
            selected={isActive("/app/list")}
            sx={listButtonSx}
          >
            <ListItemIcon>
              <ListIcon color={isActive("/app/list") ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="सराव प्रश्नपत्रिका" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/ca"
            onClick={() => isMobile && setMobileOpen(false)}
            selected={isActive("/app/ca")}
            sx={listButtonSx}
          >
            <ListItemIcon>
              <ArticleIcon
                color={isActive("/app/ca") ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText primary="चालू घडामोडी" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/pet"
            onClick={() => isMobile && setMobileOpen(false)}
            selected={isActive("/app/pet")}
            sx={listButtonSx}
          >
            <ListItemIcon>
              <FitnessCenterIcon
                color={isActive("/app/pet") ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText primary="शारीरिक चाचणी" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/blogs"
            onClick={() => isMobile && setMobileOpen(false)}
            selected={isActive("/app/blogs")}
            sx={listButtonSx}
          >
            <ListItemIcon>
              <ArticleIcon
                color={isActive("/app/blogs") ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText primary="लेख" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ my: 1 }} />

      <List
        component="nav"
        aria-label="secondary menu"
        subheader={
          <ListSubheader
            component="div"
            sx={{
              bgcolor: "transparent",
              fontWeight: 700,
              fontSize: 13,
              py: 1,
            }}
          >
            उपयुक्तता
          </ListSubheader>
        }
      >
        {/* New Main Menus: Products, Attendance */}

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/shop"
            onClick={() => isMobile && setMobileOpen(false)}
            selected={isActive("/app/shop")}
            sx={listButtonSx}
          >
            <ListItemIcon>
              <StorefrontIcon
                color={isActive("/app/shop") ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText primary="उत्पादने" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/attendance"
            onClick={() => isMobile && setMobileOpen(false)}
            selected={isActive("/app/attendance")}
            sx={listButtonSx}
          >
            <ListItemIcon>
              <TodayIcon
                color={isActive("/app/attendance") ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText primary="हजेरी" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ my: 1 }} />

      <List
        component="nav"
        aria-label="info & account"
        subheader={
          <ListSubheader
            component="div"
            sx={{
              bgcolor: "transparent",
              fontWeight: 700,
              fontSize: 13,
              py: 1,
            }}
          >
            माहिती व खाते
          </ListSubheader>
        }
      >
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/subscription"
            onClick={() => isMobile && setMobileOpen(false)}
            selected={isActive("/app/subscription")}
            sx={listButtonSx}
          >
            <ListItemIcon>
              <SubscriptionsIcon
                color={isActive("/app/subscription") ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText primary="सदस्यता" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/about"
            onClick={() => isMobile && setMobileOpen(false)}
            selected={isActive("/app/about")}
            sx={listButtonSx}
          >
            <ListItemIcon>
              <SchoolIcon
                color={isActive("/app/about") ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText primary="आमच्याबद्दल" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/profile"
            onClick={() => isMobile && setMobileOpen(false)}
            selected={isActive("/app/profile")}
            sx={listButtonSx}
          >
            <ListItemIcon>
              <PersonIcon
                color={isActive("/app/profile") ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText primary="माझे खाते" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/"
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              ...listButtonSx,
              color: "error.main",
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ color: "error.main" }} />
            </ListItemIcon>
            <ListItemText primary="बाहेर पडा" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* 🔹 Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          background: "linear-gradient(135deg, #de6925, #f8b14a)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            component={Link}
            to="/app/dashboard"
            variant={isMobile ? "h6" : "h4"}
            fontWeight="bold"
            sx={{
              letterSpacing: 1,
              fontFamily: "'Gotu', sans-serif",
              whiteSpace: "nowrap",
              lineHeight: 1.6,
              display: "inline-block",
              background: (theme) =>
                "linear-gradient(135deg,rgb(255, 255, 255),rgb(255, 230, 176))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textDecoration: "none",
            }}
          >
            द्रोणाचार्य करिअर अकॅडमी
          </Typography>

          {/* 🔔 Notification Icon */}
          <IconButton color="inherit" onClick={() => setNotifOpen(true)}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 🔹 Side Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid rgba(0,0,0,0.06)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* 🔹 Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          ml: isMobile ? 0 : `${drawerWidth}px`,
        }}
      >
        <Toolbar />
        {children}
        {/* ---------- Footer (policy links) ---------- */}
        <Box
          component="footer"
          sx={{
            mt: 4,
            py: 2,
            px: { xs: 2, sm: 3 },
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="caption" sx={{ mr: 1 }}>
            © {new Date().getFullYear()} द्रोणाचार्य करिअर अकॅडमी
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/terms"
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <Typography variant="caption">Terms & Conditions</Typography>
            </Link>

            <Typography variant="caption">|</Typography>

            <Link
              to="/privacy"
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <Typography variant="caption">Privacy</Typography>
            </Link>

            <Typography variant="caption">|</Typography>

            <Link
              to="/refunds"
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <Typography variant="caption">Cancellation & Refunds</Typography>
            </Link>

            <Typography variant="caption">|</Typography>

            <Link
              to="/shipping"
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <Typography variant="caption">Shipping</Typography>
            </Link>

            <Typography variant="caption">|</Typography>
          </Box>
        </Box>
      </Box>

      {/* Notification Modal */}
      <Dialog
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>सूचना</DialogTitle>
        <DialogContent dividers>
          {notifications.length === 0 ? (
            <Typography>कोणतीही नवीन सूचना नाहीत.</Typography>
          ) : (
            notifications.map((n) => (
              <Paper key={n.id} sx={{ p: 1.5, mb: 1 }}>
                {n.text}
              </Paper>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifications([])}>
            सर्व वाचले म्हणून चिन्हांकित करा
          </Button>
          <Button onClick={() => setNotifOpen(false)}>बंद करा</Button>
        </DialogActions>
      </Dialog>

      {/* Floating AI Assistant */}
      {/* {!chatOpen && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 2000 }}
          onClick={toggleChat}
        >
          <ChatIcon />
        </Fab>
      )} */}

      <Drawer
        anchor="bottom"
        open={chatOpen}
        onClose={toggleChat}
        sx={{
          "& .MuiDrawer-paper": {
            height: "70vh",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            p: 2,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={1}>
          AI Assistant
        </Typography>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            mb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: 1,
          }}
        >
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap: 1,
              }}
            >
              {msg.role === "assistant" && (
                <Avatar
                  sx={{ bgcolor: "secondary.main", width: 30, height: 30 }}
                >
                  AI
                </Avatar>
              )}
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: msg.role === "user" ? "primary.main" : "grey.100",
                  color: msg.role === "black",
                  borderRadius: 3,
                  maxWidth: "75%",
                  boxShadow: 2,
                  wordBreak: "break-word",
                }}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <Typography variant="body2" sx={{ color: "black" }}>
                    {msg.content}
                  </Typography>
                )}
              </Paper>
            </Box>
          ))}
          {loading && (
            <Typography variant="body2" color="text.secondary">
              ⏳ Thinking...
            </Typography>
          )}
        </Box>

        {/* Input */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="मला कोणताही प्रश्न विचारा... "
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <IconButton color="secondary" onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
      </Drawer>
    </Box>
  );
}

/* ---------- Small style helpers outside component ---------- */
const listButtonSx = {
  px: 2,
  py: { xs: 1, sm: 1.1 },
  borderRadius: 1.5,
  mb: 0.5,
  "&.Mui-selected": {
    background: "linear-gradient(135deg, #fcb69f, #ffecd2)",
    "& .MuiListItemIcon-root": { color: "primary.main" },
  },
  "&:hover": {
    background: "rgba(11,92,255,0.06)",
    transform: "translateY(-1px)",
  },
};
