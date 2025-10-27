// src/pages/admin/TeachersPaymentPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Stack,
  Divider,
  Menu,
  MenuItem,
  Chip,
  InputAdornment,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PaidIcon from "@mui/icons-material/Paid";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";

// Uncomment / adapt when integrating with your backend (api.js like AttendancePage).
// import { apiGet, apiPost, apiDelete, apiPut } from "../services/api";

/**
 * TeachersPaymentPage
 *
 * Changes included:
 * 1) Menu now has Edit & Delete (Edit opens the same add dialog populated).
 * 2) Delete shows confirmation modal; on confirm it calls delete logic (API commented) and updates local cache.
 * 3) Smart localStorage caching: on load, we prefer local cache (TTL) and only refresh from API if forced.
 *    - Cache key: "teachers_cache_v1"
 *    - TTL default: 5 minutes (configurable)
 *    - Admin create / edit writes to API (commented) and updates cache.
 *    - For performance, lecture/payment actions are queued locally in pendingUpdates and saved via "Save All".
 * 4) Toasters (Snackbars) used for all messages instead of alert().
 * 5) Top UI: a full-width pending bar showing pending amount and below row "+ नवीन शिक्षक" + Save All button with count.
 * 6) Marathi text used for labels/messages (casual).
 *
 * Note: API calls are commented so you can uncomment and adapt endpoints and request shapes.
 */

// localStorage cache key + helper
const CACHE_KEY = "teachers_cache_v1";
// TTL in ms (5 minutes) - adjust depending on your needs
const CACHE_TTL = 5 * 60 * 1000;

const toIntSafe = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.floor(n);
};
const toFloatSafe = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return n;
};

export default function TeachersPaymentPage() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  // ----- data states -----
  const [teachers, setTeachers] = useState([]); // live list
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  // UI states
  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState(null); // if editing, store id
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Controlled inputs while typing
  const [lectureInputs, setLectureInputs] = useState({});
  const [payInputs, setPayInputs] = useState({});

  // pendingUpdates queue: { id: { addLectures: number, payAmount: number } }
  const [pendingUpdates, setPendingUpdates] = useState({});

  // add / edit form
  const [form, setForm] = useState({
    name: "",
    subject: "",
    rate: 100,
    phone: "",
  });
  const [addingTeacher, setAddingTeacher] = useState(false);

  // toaster/snackbar
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  // ----- helper: initials and formatting -----
  const initials = (name = "") =>
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const formatINR = (v) => `₹ ${Number(v || 0).toFixed(2)}`;

  // ---- localCache helpers ----
  const saveCache = (arr) => {
    try {
      const payload = { ts: Date.now(), data: arr };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("saveCache failed:", err);
    }
  };
  const loadCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.ts || !Array.isArray(parsed.data)) return null;
      return parsed;
    } catch (err) {
      return null;
    }
  };

  // ------------------ Fetch teachers (smart cache) ------------------
  const fetchTeachersFromServer = useCallback(async () => {
    setLoadingTeachers(true);
    try {
      // Uncomment your API call here:
      // const res = await apiGet("/api/teachers");
      // const data = Array.isArray(res?.data) ? res.data : [];
      //
      // For now use demo data (remove after integration)
      const data = [
        {
          id: "t1",
          name: "रमेश जोशी",
          subject: "Maths",
          phone: "9876543210",
          rate: 2000,
          balance: 1500,
          advance: 0,
          totalLecturesDone: 12,
        },
        {
          id: "t2",
          name: "सीमा पाटील",
          subject: "Science",
          phone: "9123456780",
          rate: 1800,
          balance: 0,
          advance: 300,
          totalLecturesDone: 20,
        },
      ];

      setTeachers(data);
      // init inputs
      const lecInit = {};
      const payInit = {};
      data.forEach((t) => {
        lecInit[t.id] = "1";
        payInit[t.id] = "";
      });
      setLectureInputs(lecInit);
      setPayInputs(payInit);
      setPendingUpdates({});
      // persist server response in cache
      saveCache(data);
    } catch (err) {
      console.error("fetchTeachersFromServer error:", err);
      setSnack({
        open: true,
        severity: "error",
        message: "शिक्षकांची यादी मिळवण्यात अयशस्वी.",
      });
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  // load: prefer cache; if stale or missing, fetch from server
  useEffect(() => {
    const cached = loadCache();
    const now = Date.now();
    if (cached && now - cached.ts < CACHE_TTL) {
      // use cache
      setTeachers(cached.data);
      // init inputs
      const lecInit = {};
      const payInit = {};
      cached.data.forEach((t) => {
        lecInit[t.id] = "1";
        payInit[t.id] = "";
      });
      setLectureInputs(lecInit);
      setPayInputs(payInit);
      setPendingUpdates({});
      setLoadingTeachers(false);
      // optionally refresh in background (uncomment if desired)
      // fetchTeachersFromServer();
    } else {
      // fetch from server
      fetchTeachersFromServer();
    }
  }, [fetchTeachersFromServer]);

  // ------------------ Menu actions ------------------
  const openMenu = (e, id) => {
    setAnchorEl(e.currentTarget);
    setActiveMenuId(id);
  };
  const closeMenu = () => {
    setAnchorEl(null);
    setActiveMenuId(null);
  };

  // ------------------ Input handlers ------------------
  const setLectureInput = (id, raw) => {
    const filtered = String(raw).replace(/[^\d]/g, "");
    setLectureInputs((s) => ({ ...s, [id]: filtered }));
  };
  const setPayInput = (id, raw) => {
    const filtered = String(raw).replace(/[^\d.]/g, "");
    const parts = filtered.split(".");
    const safe =
      parts.length > 1 ? parts[0] + "." + parts.slice(1).join("") : filtered;
    setPayInputs((s) => ({ ...s, [id]: safe }));
  };

  const incLecture = (id) =>
    setLectureInputs((s) => {
      const cur = toIntSafe(s[id] ?? 0);
      return { ...s, [id]: String(cur + 1) };
    });
  const decLecture = (id) =>
    setLectureInputs((s) => {
      const cur = toIntSafe(s[id] ?? 0);
      return { ...s, [id]: String(Math.max(0, cur - 1)) };
    });

  // ------------------ Local actions (queue + local apply) ------------------
  const applyAddLecturesLocal = (id) => {
    const raw = lectureInputs[id] ?? "";
    const n = toIntSafe(raw);
    if (n <= 0) {
      setSnack({
        open: true,
        severity: "warning",
        message: "किमान 1 व्याख्यान द्या.",
      });
      return;
    }

    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const cost = n * (t.rate || 0);
        let { advance = 0, balance = 0, totalLecturesDone = 0 } = t;
        if (advance >= cost) {
          advance = Number((advance - cost).toFixed(2));
        } else {
          const remaining = cost - advance;
          advance = 0;
          balance = Number((balance + remaining).toFixed(2));
        }
        totalLecturesDone = totalLecturesDone + n;
        return { ...t, advance, balance, totalLecturesDone };
      })
    );

    setPendingUpdates((p) => {
      const prev = p[id] || { addLectures: 0, payAmount: 0 };
      return {
        ...p,
        [id]: {
          addLectures: (prev.addLectures || 0) + n,
          payAmount: prev.payAmount || 0,
        },
      };
    });

    setLectureInputs((s) => ({ ...s, [id]: "1" }));
    setSnack({
      open: true,
      severity: "success",
      message: "व्याख्यान स्थानिकरीत्या नोंदवले.",
    });
    // update cache immediately (fast UI)
    saveCache(teachers.map((x) => (x.id === id ? { ...x } : x)));
  };

  const applyPayLocal = (id) => {
    const raw = payInputs[id] ?? "";
    const a = toFloatSafe(raw);
    if (a <= 0) {
      setSnack({
        open: true,
        severity: "warning",
        message: "रक्कम 0 पेक्षा जास्त असावी.",
      });
      return;
    }

    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        let { balance = 0, advance = 0 } = t;
        const newBalance = Number((balance - a).toFixed(2));
        if (newBalance <= 0) {
          const leftover = Math.abs(newBalance);
          balance = 0;
          advance = Number((advance + leftover).toFixed(2));
        } else {
          balance = newBalance;
        }
        return { ...t, balance, advance };
      })
    );

    setPendingUpdates((p) => {
      const prev = p[id] || { addLectures: 0, payAmount: 0 };
      return {
        ...p,
        [id]: {
          addLectures: prev.addLectures || 0,
          payAmount: (prev.payAmount || 0) + a,
        },
      };
    });

    setPayInputs((s) => ({ ...s, [id]: "" }));
    setSnack({
      open: true,
      severity: "success",
      message: "पेमेंट स्थानिकरीत्या नोंदवले.",
    });
    // update cache immediately
    saveCache(teachers.map((x) => (x.id === id ? { ...x } : x)));
  };

  // ------------------ Save All (batch) ------------------
  const handleSaveAll = async () => {
    if (savingAll) return;
    if (!Object.keys(pendingUpdates).length) {
      setSnack({
        open: true,
        severity: "info",
        message: "जतन करण्यासाठी काही नाही.",
      });
      return;
    }

    const payload = {
      updates: Object.entries(pendingUpdates).map(([id, u]) => ({
        id,
        addLectures: u.addLectures || 0,
        payAmount: u.payAmount || 0,
      })),
    };

    setSavingAll(true);
    try {
      // Uncomment / adapt your API call:
      // const res = await apiPost("/api/teachers/bulk-update", payload);
      // if (!res.success) throw new Error(res.message || "save failed");

      // For demo, simulate network delay
      await new Promise((r) => setTimeout(r, 700));

      // on success clear pending
      setPendingUpdates({});
      setSnack({
        open: true,
        severity: "success",
        message: "सर्व बदल जतन केले.",
      });
      // update cache with current teachers
      saveCache(teachers);
    } catch (err) {
      console.error("handleSaveAll error:", err);
      setSnack({
        open: true,
        severity: "error",
        message: "सर्व बदल जतन करण्यात अयशस्वी.",
      });
    } finally {
      setSavingAll(false);
    }
  };

  // ------------------ Add / Edit teacher (form submit) ------------------
  const handleAddTeacher = async () => {
    if (!form.name.trim() || !form.subject.trim()) {
      setSnack({
        open: true,
        severity: "warning",
        message: "नाव आणि विषय आवश्यक आहेत.",
      });
      return;
    }
    setAddingTeacher(true);
    try {
      if (editId) {
        // EDIT existing teacher
        const updated = { id: editId, ...form, rate: Number(form.rate) || 0 };
        // Uncomment to call your API:
        // await apiPut(`/api/teachers/${editId}`, updated);
        setTeachers((p) =>
          p.map((t) => (t.id === editId ? { ...t, ...updated } : t))
        );
        setSnack({
          open: true,
          severity: "success",
          message: "शिक्षक संपादित केला गेला.",
        });
      } else {
        // CREATE new teacher
        // Uncomment to call your API:
        // const res = await apiPost("/api/teachers", form);
        // const newTeacher = res?.data;
        const newTeacher = {
          id: String(Date.now()),
          ...form,
          rate: Number(form.rate) || 0,
          balance: 0,
          advance: 0,
          totalLecturesDone: 0,
        };
        setTeachers((p) => [newTeacher, ...p]);
        setSnack({
          open: true,
          severity: "success",
          message: "नवीन शिक्षक जोडला.",
        });
      }

      // reset dialog & form
      setForm({ name: "", subject: "", rate: 100, phone: "" });
      setOpenAdd(false);
      setEditId(null);
      // update cache
      saveCache(teachers);
    } catch (err) {
      console.error("handleAddTeacher error:", err);
      setSnack({
        open: true,
        severity: "error",
        message: "शिक्षक जतन करण्यात अयशस्वी.",
      });
    } finally {
      setAddingTeacher(false);
    }
  };

  // ------------------ Edit flow (prefill form) ------------------
  const handleEditClick = (id) => {
    const t = teachers.find((x) => x.id === id);
    if (!t) {
      setSnack({
        open: true,
        severity: "error",
        message: "शिक्षक सापडला नाही.",
      });
      return;
    }
    setForm({
      name: t.name || "",
      subject: t.subject || "",
      rate: t.rate || 100,
      phone: t.phone || "",
    });
    setEditId(id);
    setOpenAdd(true);
    closeMenu();
  };

  // ------------------ Delete flow ------------------
  const handleDeleteConfirm = (id) => {
    setDeleteTarget(id);
    setConfirmDeleteOpen(true);
    closeMenu();
  };

  const handleDelete = async () => {
    const id = deleteTarget;
    if (!id) {
      setConfirmDeleteOpen(false);
      return;
    }
    // optimistic UI
    const prev = teachers;
    setTeachers((p) => p.filter((t) => t.id !== id));
    setLectureInputs((s) => {
      const c = { ...s };
      delete c[id];
      return c;
    });
    setPayInputs((s) => {
      const c = { ...s };
      delete c[id];
      return c;
    });
    setPendingUpdates((s) => {
      const c = { ...s };
      delete c[id];
      return c;
    });

    setConfirmDeleteOpen(false);
    try {
      // call API delete (uncomment)
      // await apiDelete(`/api/teachers/${id}`);
      setSnack({
        open: true,
        severity: "success",
        message: "शिक्षक हटविला गेला.",
      });
      // update cache
      saveCache(teachers.filter((t) => t.id !== id));
    } catch (err) {
      console.error("handleDelete error:", err);
      // rollback
      setTeachers(prev);
      setSnack({
        open: true,
        severity: "error",
        message: "शिक्षक हटवण्यात अयशस्वी.",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  // derived values
  const totalPendingPayouts = teachers.reduce(
    (s, t) => s + (Number(t.balance || 0) || 0),
    0
  );
  const pendingCount = Object.keys(pendingUpdates).length;
  const isBusy = loadingTeachers || savingAll || addingTeacher;

  // small UI helpers
  const inputWidth = { xs: "48%", sm: 120 };

  // ------------------ Render ------------------
  return (
    <Box sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      {/* Top summary section */}
      <Box
        sx={{
          mb: 2,
          bgcolor: "primary.main",
          p: 1,
          boxShadow: 2,
          borderRadius: 1,
        }}
      >
        <Card
          sx={{
            bgcolor: "background.paper",
            borderRadius: 1,
            p: 1,
            boxShadow: 1,
            textAlign: "center",
          }}
        >
          <Typography
            variant="body"
            sx={{ fontWeight: 600, color: "error.main" }}
          >
            एकूण रु {formatINR(totalPendingPayouts)} देणे बाकी
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="body"
            sx={{ fontWeight: 600, color: "success.main" }}
          >
            एकूण रु{" "}
            {formatINR(
              teachers.reduce((s, t) => s + (Number(t.advance || 0) || 0), 0)
            )}{" "}
            ॲडव्हान्स दिले
          </Typography>
        </Card>

        {/* Buttons row below */}
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            gap: 1.5,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setOpenAdd(true)}
            disabled={isBusy}
          >
            नवीन शिक्षक
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSaveAll}
            startIcon={savingAll ? <CircularProgress size={16} /> : null}
            disabled={isBusy || pendingCount === 0}
          >
            {savingAll ? "जतन..." : `सर्व जतन करा (${pendingCount})`}
          </Button>
        </Box>
      </Box>

      {loadingTeachers ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {teachers.map((t) => {
            const lectureVal = lectureInputs[t.id] ?? "1";
            const payVal = payInputs[t.id] ?? "";
            const owe = Number(t.balance || 0);
            const adv = Number(t.advance || 0);
            const balanceLabel =
              owe > 0
                ? { label: formatINR(owe), color: "error" }
                : { label: formatINR(0), color: "default" };

            return (
              <Grid item xs={12} sm={6} md={4} key={t.id}>
                <Card
                  sx={{
                    width: "100%",
                    boxSizing: "border-box",
                    borderRadius: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 180,
                  }}
                  elevation={3}
                >
                  <CardContent sx={{ flex: "1 1 auto", pb: 1 }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {/* LEFT: Avatar + Name + Phone */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              minWidth: 0,
                            }}
                          >
                            <Box sx={{ position: "relative", flexShrink: 0 }}>
                              <Avatar
                                sx={{
                                  bgcolor: "secondary.main",
                                  width: 36,
                                  height: 36,
                                  fontWeight: 600,
                                }}
                              >
                                <PersonIcon sx={{ color: "common.white" }} />
                              </Avatar>
                              <Box
                                sx={{
                                  position: "absolute",
                                  right: -6,
                                  top: -6,
                                  width: 20,
                                  height: 20,
                                  borderRadius: "50%",
                                  border: "2px solid",
                                  borderColor: "background.paper",
                                  bgcolor:
                                    owe > 0 ? "error.main" : "success.main",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "common.white",
                                  fontSize: 11,
                                  fontWeight: 800,
                                }}
                              >
                                {owe > 0 ? "₹" : "✓"}
                              </Box>
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                noWrap
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {t.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "100%",
                                }}
                              >
                                {t.subject} • {t.phone || "—"}
                              </Typography>
                            </Box>
                          </Box>

                          {/* RIGHT: Menu icon (Edit / Delete) */}
                          <IconButton
                            size="small"
                            onClick={(e) => openMenu(e, t.id)}
                            sx={{ ml: 1, flexShrink: 0 }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            label={`देणे बाकी: ${balanceLabel.label}`}
                            color={
                              balanceLabel.color === "default"
                                ? "default"
                                : balanceLabel.color
                            }
                            size="small"
                            sx={{ fontWeight: 700, height: 30 }}
                          />
                          <Chip
                            label={`ॲडव्हान्स: ${formatINR(adv)}`}
                            variant="outlined"
                            size="small"
                            sx={{ height: 30 }}
                          />
                          <Chip
                            label={`दर: ${formatINR(t.rate)}`}
                            variant="outlined"
                            size="small"
                            sx={{ height: 30 }}
                          />
                          <Chip
                            label={`व्याख्या: ${t.totalLecturesDone}`}
                            variant="outlined"
                            size="small"
                            sx={{ height: 30 }}
                          />
                          {pendingUpdates[t.id] &&
                          (pendingUpdates[t.id].addLectures ||
                            pendingUpdates[t.id].payAmount) ? (
                            <Chip
                              label="जतन करा"
                              color="success"
                              size="small"
                              sx={{ height: 30, fontWeight: 700 }}
                            />
                          ) : null}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>

                  <Divider variant="middle" />

                  <CardActions
                    sx={{
                      px: 2,
                      pb: 2,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      justifyContent: "space-between",
                      "& > :not(style) ~ :not(style)": {
                        ml: { xs: 0, sm: 1 },
                        mt: { xs: 1, sm: 0 },
                      },
                    }}
                  >
                    {/* Lecture input row */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        width: { xs: "100%", sm: "auto" },
                        flex: { xs: "1 1 auto", sm: "0 1 auto" },
                        justifyContent: { xs: "flex-start", sm: "flex-end" },
                      }}
                    >
                      <TextField
                        size="small"
                        type="text"
                        value={lectureInputs[t.id] ?? "1"}
                        onChange={(e) => setLectureInput(t.id, e.target.value)}
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "\\d*",
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: inputWidth, maxWidth: 140 }}
                        aria-label="lectures"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ mr: 0 }}>
                              <IconButton
                                size="small"
                                onClick={() => decLecture(t.id)}
                                aria-label="decrement"
                                sx={{ width: 30, height: 30 }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end" sx={{ ml: 0 }}>
                              <IconButton
                                size="small"
                                onClick={() => incLecture(t.id)}
                                aria-label="increment"
                                sx={{ width: 30, height: 30 }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => applyAddLecturesLocal(t.id)}
                        size="small"
                        disabled={
                          isBusy || toIntSafe(lectureInputs[t.id] ?? "0") <= 0
                        }
                        sx={{
                          whiteSpace: "nowrap",
                          ml: { xs: 0, sm: 1 },
                          width: { xs: "50%", sm: "auto" },
                        }}
                      >
                        Add
                      </Button>
                    </Box>

                    {/* Payment input row */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        width: { xs: "100%", sm: "auto" },
                        justifyContent: { xs: "flex-start", sm: "flex-end" },
                      }}
                    >
                      <TextField
                        size="small"
                        type="text"
                        value={payInputs[t.id] ?? ""}
                        onChange={(e) => setPayInput(t.id, e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">₹</InputAdornment>
                          ),
                          inputMode: "decimal",
                        }}
                        inputProps={{
                          inputMode: "decimal",
                          pattern: "[0-9]*",
                          style: { textAlign: "center" },
                        }}
                        sx={{ width: inputWidth, maxWidth: 140 }}
                        aria-label="payment"
                      />
                      <Button
                        variant="outlined"
                        startIcon={<LocalAtmIcon />}
                        onClick={() => applyPayLocal(t.id)}
                        size="small"
                        disabled={
                          isBusy || toFloatSafe(payInputs[t.id] ?? "") <= 0
                        }
                        sx={{
                          whiteSpace: "nowrap",
                          width: { xs: "50%", sm: "auto" },
                        }}
                      >
                        Pay
                      </Button>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}

          {teachers.length === 0 && (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 6,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  अजून शिक्षक नाहीत
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  नवीन शिक्षक जोडा आणि त्यांचे पगार व्यवस्थापित करा
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAdd(true)}
                  disabled={isBusy}
                >
                  शिक्षक जोडा
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Menu (Edit / Delete) */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            handleEditClick(activeMenuId);
          }}
        >
          <EditIcon sx={{ mr: 1 }} /> संपादित करा
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteConfirm(activeMenuId);
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> हटवा
        </MenuItem>
      </Menu>

      {/* Delete confirmation modal */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>खरंच हटवायचे का?</DialogTitle>
        <DialogContent>
          <Typography>
            आपण हा शिक्षक कायमस्वरूपी हटवू इच्छिता का? ही क्रिया परत करू शकत
            नाही.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="inherit">
            रद्द करा
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            startIcon={<DeleteIcon />}
          >
            हटवा
          </Button>
        </DialogActions>
      </Dialog>

      {/* add / edit dialog (Marathi labels) */}
      <Dialog
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          setEditId(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editId ? "शिक्षक संपादित करा" : "नवीन शिक्षक जोडा"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="नाव"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="विषय"
              value={form.subject}
              onChange={(e) =>
                setForm((s) => ({ ...s, subject: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="दर प्रति व्याख्यान (₹)"
              type="number"
              value={form.rate}
              onChange={(e) => setForm((s) => ({ ...s, rate: e.target.value }))}
              fullWidth
            />
            <TextField
              label="फोन (ऐच्छिक)"
              value={form.phone}
              onChange={(e) =>
                setForm((s) => ({ ...s, phone: e.target.value }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAdd(false);
              setEditId(null);
            }}
            disabled={addingTeacher}
          >
            रद्द करा
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTeacher}
            startIcon={
              addingTeacher ? <CircularProgress size={16} /> : <AddIcon />
            }
            disabled={addingTeacher}
          >
            {addingTeacher ? "जतन..." : editId ? "संचित करा" : "जोडा"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SnackBar / Toaster */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
