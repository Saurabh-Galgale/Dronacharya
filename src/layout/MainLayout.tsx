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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ListIcon from "@mui/icons-material/List";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ArticleIcon from "@mui/icons-material/Article";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import SchoolIcon from "@mui/icons-material/School";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const drawerWidth = 220;

export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // =========================
  // 🔹 Sidebar Drawer Content
  // =========================
  const drawerContent = (
    <Box sx={{ overflow: "auto" }}>
      <Toolbar />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/dashboard"
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/lectures"
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <VideoLibraryIcon />
            </ListItemIcon>
            <ListItemText primary="Video Lectures" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/ca"
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <ArticleIcon />
            </ListItemIcon>
            <ListItemText primary="Current Affairs" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/list"
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText primary="Papers List" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            disabled
            component={Link}
            to="/app/upload"
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <UploadFileIcon />
            </ListItemIcon>
            <ListItemText primary="Upload Paper" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/about"
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <SchoolIcon />
            </ListItemIcon>
            <ListItemText primary="About" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/app/profile"
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/"
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Log Out" />
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
        <Toolbar>
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
            }}
          >
            द्रोणाचार्य करिअर अकॅडमी
          </Typography>
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
      </Box>

      {/* Floating AI Assistant */}
      {!chatOpen && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 2000 }}
          onClick={toggleChat}
        >
          <ChatIcon />
        </Fab>
      )}

      <Drawer
        anchor="bottom"
        open={chatOpen}
        onClose={toggleChat}
        sx={{
          "& .MuiDrawer-paper": {
            height: "80vh",
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
          <IconButton color="primary" onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
      </Drawer>
    </Box>
  );
}
