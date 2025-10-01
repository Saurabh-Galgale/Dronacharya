// src/pages/Pet.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Typography,
  TextField,
  IconButton,
  Divider,
  Chip,
  Stack,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  DialogTitle,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PrintIcon from "@mui/icons-material/Print";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";

import petTopics from "../mockPet"; // cleaned JSON

// Utility to beautify content
function RenderContent({ text }) {
  if (!text) return null;

  // split by newlines
  const paragraphs = text
    .trim()
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Box>
      {paragraphs.map((p, idx) => {
        // Detect heading-like lines
        if (
          p.endsWith(":") ||
          p.includes("उद्दिष्ट") ||
          p.includes("सारांश") ||
          p.includes("टीप")
        ) {
          return (
            <Typography
              key={idx}
              variant="subtitle1"
              fontWeight="700"
              sx={{ mt: 2, mb: 1, color: "primary.main" }}
            >
              {p}
            </Typography>
          );
        }

        // Normal text/points
        return (
          <Typography
            key={idx}
            variant="body1"
            sx={{ mb: 1.5, lineHeight: 1.8 }}
          >
            {p}
          </Typography>
        );
      })}
    </Box>
  );
}

export default function Pet() {
  const [query, setQuery] = useState("");
  const [openTopic, setOpenTopic] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // search across titles & content
  const filteredTopics = useMemo(() => {
    if (!query.trim()) return petTopics;
    const q = query.trim().toLowerCase();
    return petTopics
      .map((t) => {
        const matched = t.subtopics.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.content.toLowerCase().includes(q) ||
            t.title.toLowerCase().includes(q) ||
            (t.summary || "").toLowerCase().includes(q)
        );
        return { ...t, subtopics: matched };
      })
      .filter((t) => t.subtopics.length > 0);
  }, [query]);

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper sx={{ p: 2, mb: 2, position: "sticky", top: 88 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="शोधा — उदाहरण: उंची, धावणे, शॉट-पुट"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" aria-label="search">
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              विषय (Topics)
            </Typography>

            {/* Topics List */}
            <List dense disablePadding>
              {filteredTopics.map((t, tIndex) => (
                <Box key={t.id}>
                  <ListItemButton
                    onClick={() =>
                      setOpenTopic((prev) => (prev === t.id ? null : t.id))
                    }
                    selected={openTopic === t.id}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      background:
                        tIndex % 2 === 0
                          ? "linear-gradient(135deg, rgba(255,236,210,0.18), rgba(252,182,159,0.18))"
                          : "transparent",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography fontWeight={700} variant="h6">
                          {t.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {t.summary}
                        </Typography>
                      }
                    />
                    {openTopic === t.id ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse
                    in={openTopic === t.id}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box sx={{ pl: 2, pr: 1, pb: 1 }}>
                      {t.subtopics.map((s, sIndex) => (
                        <ListItemButton
                          onClick={() => {
                            setModalData(s);
                            setModalOpen(true);
                          }}
                          key={s.id}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            background:
                              "linear-gradient(135deg,rgba(148, 175, 228, 0.1),rgba(64, 115, 158, 0.1))",
                          }}
                        >
                          <ListItemText primary={s.title} />
                        </ListItemButton>
                      ))}
                    </Box>
                  </Collapse>

                  <Divider />
                </Box>
              ))}
            </List>

            {/* <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip label="PET तयारी" />
              <Chip label="धावणी योजना" />
              <Chip label="शॉट-पुट" />
              <Chip label="आहार" />
              <Chip label="रिकव्हरी" />
            </Box> */}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "700",
            fontSize: "1.2rem",
            pr: 2,
          }}
        >
          {modalData?.title}
          <IconButton onClick={() => setModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            typography: "body1",
            lineHeight: 1.8,
            p: { xs: 2, md: 3 },
            "& p": { mb: 2 },
          }}
        >
          <RenderContent text={modalData?.content} />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ justifyContent: "space-between", px: 2 }}>
          <Box>
            <Tooltip title="कॉपी करा">
              <IconButton
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${modalData?.title}\n\n${modalData?.content || ""}`
                  )
                }
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="प्रिंट करा">
              <IconButton
                onClick={() => {
                  const w = window.open("", "_blank");
                  w.document.write(
                    `<pre style="font-family: sans-serif; white-space: pre-wrap;">${modalData?.title}\n\n${modalData?.content}</pre>`
                  );
                  w.document.close();
                  w.print();
                }}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="अधिकृत संकेतस्थळ">
              <IconButton
                onClick={() =>
                  window.open("https://www.mahapolice.gov.in/", "_blank")
                }
              >
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Button variant="outlined" onClick={() => setModalOpen(false)}>
            बंद करा
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
