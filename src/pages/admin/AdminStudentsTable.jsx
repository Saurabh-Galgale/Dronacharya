// src/pages/StudentsTable.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Checkbox,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Button,
  Stack,
  Chip,
  Snackbar,
  Alert,
  TextField,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  FormControl,
  InputLabel,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isBetween from "dayjs/plugin/isBetween";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);

const MOCK_ACADEMIES = ["Wai", "Panchwad"];

/**
 * NOTE: changed mock structure to include attendanceByYear.
 * attendanceByYear: { "2024": ["2024-01-02", "2024-01-15", ...], "2025": [...] }
 *
 * feesPaid is unchanged: keys are "YYYY-MM"
 */
const MOCK_STUDENTS = [
  {
    id: "stu_1",
    name: "Rahul Sharma",
    academy: "Wai",
    feesPaid: { "2025-01": true, "2025-02": true, "2025-03": false },
    // year-wise attendance (mock)
    attendanceByYear: {
      2024: [
        "2024-01-02",
        "2024-01-03",
        "2024-02-12",
        "2024-03-05",
        "2024-03-06",
        "2024-04-01",
      ],
      2025: ["2025-01-01", "2025-01-02"],
    },
  },
  {
    id: "stu_2",
    name: "Sana Kulkarni",
    academy: "Panchwad",
    feesPaid: { "2025-01": true, "2025-02": false },
    attendanceByYear: {
      2024: ["2024-01-02", "2024-02-10"],
      2025: ["2025-01-01"],
    },
  },
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const clone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Count working days in a year (simple rule: treat Sunday as holiday).
 * Adjust rule if your org uses different working-day rules.
 */
function getWorkingDaysInYear(year) {
  const start = dayjs(`${year}-01-01`);
  const end = dayjs(`${year}-12-31`);
  let count = 0;
  for (let d = start; d.isBefore(end) || d.isSame(end); d = d.add(1, "day")) {
    // treat Sunday (0) as holiday; change if needed
    if (d.day() !== 0) count++;
  }
  return count;
}

/**
 * StudentsTable
 */
export default function StudentsTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // original & working copy
  const [originalStudents] = useState(() => MOCK_STUDENTS.map(clone));
  const [students, setStudents] = useState(() => MOCK_STUDENTS.map(clone));
  const [changedRows, setChangedRows] = useState(new Set());

  // filters
  const [search, setSearch] = useState("");
  const [academyFilter, setAcademyFilter] = useState("");
  const [sortByPresence, setSortByPresence] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  // pagination (desktop)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Attendance dialog state (unchanged UI)
  const [attendanceDialog, setAttendanceDialog] = useState({
    open: false,
    studentId: null,
    monthStart: dayjs().startOf("month"),
    selectedSet: new Set(), // set of ISO dates strings (YYYY-MM-DD)
  });

  // Per-row currently-selected fee / attendance year
  const [selectedYearById, setSelectedYearById] = useState(() => {
    const y = dayjs().year();
    const map = {};
    MOCK_STUDENTS.forEach((s) => {
      map[s.id] = String(y);
    });
    return map;
  });

  const isRowChanged = (id, row) => {
    const orig = originalStudents.find((o) => o.id === id);
    return JSON.stringify(orig) !== JSON.stringify(row);
  };

  const updateStudent = (id, updater) => {
    setStudents((prev) => {
      const next = prev.map((s) => (s.id === id ? updater(clone(s)) : s));
      const changed = next.find((s) => s.id === id);
      setChangedRows((prevSet) => {
        const copy = new Set(prevSet);
        if (isRowChanged(id, changed)) copy.add(id);
        else copy.delete(id);
        return copy;
      });
      return next;
    });
  };

  const handleAcademyChange = (id, newAcademy) =>
    updateStudent(id, (s) => ({ ...s, academy: newAcademy }));

  // toggle YYYY-MM key in feesPaid
  const handleToggleFeeMonth = (id, yMonth) =>
    updateStudent(id, (s) => {
      const nextFees = { ...(s.feesPaid || {}) };
      nextFees[yMonth] = !nextFees[yMonth];
      return { ...s, feesPaid: nextFees };
    });

  /**
   * Open attendance dialog — prepare dialog.selectedSet from
   * student's attendanceByYear for the year derived from monthStart
   *
   * NOTE: We intentionally keep dialog UI the same (calendar grid etc).
   * monthStart is a dayjs: its .year() decides which year we open/edit.
   */
  const openAttendanceDialog = (studentId, monthStart = dayjs()) => {
    const student = students.find((s) => s.id === studentId);
    const ms = dayjs(monthStart).startOf("month");
    const year = String(ms.year());
    // load student's dates for that year (if any)
    const arr =
      (student?.attendanceByYear && student.attendanceByYear[year]) || [];
    const selectedSet = new Set((arr || []).filter(Boolean));
    setAttendanceDialog({
      open: true,
      studentId,
      monthStart: ms,
      selectedSet,
    });
  };

  // toggle date in dialog (YYYY-MM-DD)
  const toggleAttendanceInDialog = (isoDate) => {
    setAttendanceDialog((d) => {
      const next = new Set(d.selectedSet);
      if (next.has(isoDate)) next.delete(isoDate);
      else next.add(isoDate);
      return { ...d, selectedSet: next };
    });
  };

  // Save dialog selections back to student.attendanceByYear[year]
  const saveAttendanceFromDialog = () => {
    const { studentId, selectedSet, monthStart } = attendanceDialog;
    if (!studentId) {
      closeAttendanceDialog();
      return;
    }
    const year = String(dayjs(monthStart).year());
    updateStudent(studentId, (s) => {
      const next = { ...(s.attendanceByYear || {}) };
      next[year] = Array.from(selectedSet).sort();
      return { ...s, attendanceByYear: next };
    });

    // close dialog
    setAttendanceDialog({
      open: false,
      studentId: null,
      monthStart: dayjs(),
      selectedSet: new Set(),
    });
  };

  const closeAttendanceDialog = () =>
    setAttendanceDialog({
      open: false,
      studentId: null,
      monthStart: dayjs(),
      selectedSet: new Set(),
    });

  const handleResetRow = (id) => {
    const orig = originalStudents.find((o) => o.id === id);
    if (!orig) return;
    setStudents((prev) => prev.map((s) => (s.id === id ? clone(orig) : s)));
    setChangedRows((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
  };

  const handleSubmit = async () => {
    const payload = students.filter((s) => changedRows.has(s.id));
    console.log("Submitting:", payload);
    setSnack({ open: true, severity: "success", message: "Changes saved." });
    setChangedRows(new Set());
  };

  // filtering + sorting
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.academy.toLowerCase().includes(search.toLowerCase());
    const matchesAcademy = academyFilter ? s.academy === academyFilter : true;
    return matchesSearch && matchesAcademy;
  });

  const sorted = sortByPresence
    ? [...filtered].sort((a, b) => {
        // sort by attended days for currently selected year
        const ayA = a.attendanceByYear || {};
        const ayB = b.attendanceByYear || {};
        // pick year of each row (use selectedYearById)
        const aYear = selectedYearById[a.id] || String(dayjs().year());
        const bYear = selectedYearById[b.id] || String(dayjs().year());
        const aCount = (ayA[aYear] || []).length;
        const bCount = (ayB[bYear] || []).length;
        return bCount - aCount;
      })
    : filtered;

  const visibleRows = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  // helper: list of years to choose from (current +- 2)
  const yearOptions = (() => {
    const now = dayjs().year();
    return [now - 2, now - 1, now, now + 1].map(String);
  })();

  // RENDER: small calendar month grid for dialog (unchanged UI but uses selectedSet)
  function MonthCalendar({ monthStart, selectedSet, onDayClick }) {
    const start = dayjs(monthStart).startOf("month");
    const end = dayjs(monthStart).endOf("month");
    const startOffset = start.day(); // 0..6 (Sun=0)
    const totalDays = end.date();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      cells.push(start.date(d));
    }
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <Box>
        <Grid container spacing={0.5}>
          {cells.map((c, i) => {
            if (!c) {
              return (
                <Grid item xs={12 / 7} key={"e" + i}>
                  <Box sx={{ height: 36 }} />
                </Grid>
              );
            }
            const iso = c.format("YYYY-MM-DD");
            const isSelected = selectedSet.has(iso);

            return (
              <Grid item xs={12 / 7} key={iso}>
                <Button
                  size="small"
                  onClick={() => onDayClick(iso)}
                  sx={{
                    minWidth: 0,
                    width: "100%",
                    height: 36,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: isSelected ? "success.main" : "grey.400",
                    backgroundColor: isSelected
                      ? "success.main"
                      : "transparent",
                    color: isSelected ? "white" : "text.primary",
                    "&:hover": {
                      backgroundColor: isSelected ? "success.dark" : "grey.100",
                    },
                  }}
                >
                  {c.date()}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2 }}>
        {/* Sticky header with filters */}
        <Paper
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            mb: 2,
            p: 2,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            alignItems: isMobile ? "stretch" : "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Search name or academy"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
            fullWidth={isMobile}
          />
          <FormControl
            size="small"
            sx={{ minWidth: 160, width: isMobile ? "100%" : "auto" }}
          >
            <InputLabel>Academy</InputLabel>
            <Select
              label="Academy"
              value={academyFilter}
              onChange={(e) => setAcademyFilter(e.target.value)}
            >
              <MenuItem value="">All Academies</MenuItem>
              {MOCK_ACADEMIES.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant={sortByPresence ? "contained" : "outlined"}
            onClick={() => setSortByPresence((s) => !s)}
            fullWidth={isMobile}
          >
            Sort by Presence
          </Button>

          {changedRows.size > 0 && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              fullWidth={isMobile}
            >
              Submit ({changedRows.size})
            </Button>
          )}
        </Paper>

        {/* Mobile: cards */}
        {isMobile ? (
          <Stack spacing={2}>
            {sorted.map((s) => {
              const changed = changedRows.has(s.id);
              const selYear = selectedYearById[s.id] || String(dayjs().year());

              // months for fees UI
              const monthsForYear = MONTH_NAMES.map((m, idx) => {
                const key = `${selYear}-${String(idx + 1).padStart(2, "0")}`;
                const paid = !!s.feesPaid?.[key];
                return { m, key, paid };
              });

              // attended & working for selected year
              const attendedForYear = (s.attendanceByYear || {})[selYear]
                ? (s.attendanceByYear[selYear] || []).length
                : 0;
              const workingForYear = getWorkingDaysInYear(selYear);

              return (
                <Paper key={s.id} sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle1">{s.name}</Typography>
                    <Checkbox checked={changed} disabled />
                  </Stack>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption">Academy</Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={s.academy}
                      onChange={(e) =>
                        handleAcademyChange(s.id, e.target.value)
                      }
                      sx={{ mt: 0.5 }}
                    >
                      {MOCK_ACADEMIES.map((a) => (
                        <MenuItem key={a} value={a}>
                          {a}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption">Fees — Year</Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 0.5 }}
                    >
                      <Select
                        size="small"
                        value={selYear}
                        onChange={(e) =>
                          setSelectedYearById((m) => ({
                            ...m,
                            [s.id]: e.target.value,
                          }))
                        }
                      >
                        {yearOptions.map((y) => (
                          <MenuItem key={y} value={y}>
                            {y}
                          </MenuItem>
                        ))}
                      </Select>
                    </Stack>

                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      {monthsForYear.map(({ m, key, paid }) => (
                        <Chip
                          key={key}
                          label={m}
                          size="small"
                          onClick={() => handleToggleFeeMonth(s.id, key)}
                          sx={{
                            bgcolor: paid ? "success.main" : "error.main",
                            color: "white",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption">Attendance</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        mt: 0.5,
                      }}
                    >
                      <Typography variant="body2">
                        {attendedForYear} / {workingForYear} days
                      </Typography>
                      <Button
                        size="small"
                        onClick={() =>
                          // open dialog at Jan of this selected year so dialog's monthStart.year() = selYear
                          openAttendanceDialog(s.id, dayjs(`${selYear}-01-01`))
                        }
                      >
                        Edit Days
                      </Button>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1, textAlign: "right" }}>
                    <IconButton
                      onClick={() => handleResetRow(s.id)}
                      title="Reset row"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        ) : (
          // Desktop: table
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>✔</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Academy</TableCell>
                  <TableCell>Fees (select year → months)</TableCell>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleRows.map((s) => {
                  const changed = changedRows.has(s.id);
                  const selYear =
                    selectedYearById[s.id] || String(dayjs().year());
                  const monthsForYear = MONTH_NAMES.map((m, idx) => {
                    const key = `${selYear}-${String(idx + 1).padStart(
                      2,
                      "0"
                    )}`;
                    const paid = !!s.feesPaid?.[key];
                    return { m, key, paid };
                  });

                  const attendedForYear = (s.attendanceByYear || {})[selYear]
                    ? (s.attendanceByYear[selYear] || []).length
                    : 0;
                  const workingForYear = getWorkingDaysInYear(selYear);

                  return (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Checkbox checked={changed} disabled />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{s.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {s.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Select
                          size="small"
                          value={s.academy}
                          onChange={(e) =>
                            handleAcademyChange(s.id, e.target.value)
                          }
                        >
                          {MOCK_ACADEMIES.map((a) => (
                            <MenuItem key={a} value={a}>
                              {a}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Select
                            size="small"
                            value={selYear}
                            onChange={(e) =>
                              setSelectedYearById((m) => ({
                                ...m,
                                [s.id]: e.target.value,
                              }))
                            }
                          >
                            {yearOptions.map((y) => (
                              <MenuItem key={y} value={y}>
                                {y}
                              </MenuItem>
                            ))}
                          </Select>

                          <Button
                            size="small"
                            onClick={() =>
                              openAttendanceDialog(
                                s.id,
                                dayjs(`${selYear}-01-01`)
                              )
                            }
                          >
                            Open Calendar
                          </Button>
                        </Stack>

                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                          }}
                        >
                          {monthsForYear.map(({ m, key, paid }) => (
                            <Chip
                              key={key}
                              label={m}
                              size="small"
                              onClick={() => handleToggleFeeMonth(s.id, key)}
                              sx={{
                                bgcolor: paid ? "success.main" : "error.main",
                                color: "white",
                                cursor: "pointer",
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {attendedForYear} / {workingForYear} days
                        </Typography>
                        <Button
                          size="small"
                          onClick={() =>
                            openAttendanceDialog(
                              s.id,
                              dayjs(`${selYear}-01-01`)
                            )
                          }
                        >
                          Edit Days
                        </Button>
                      </TableCell>

                      <TableCell>
                        <IconButton
                          onClick={() => handleResetRow(s.id)}
                          title="Reset row"
                        >
                          <RefreshIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={sorted.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) =>
                setRowsPerPage(parseInt(e.target.value, 10))
              }
            />
          </TableContainer>
        )}

        {/* Attendance Dialog (UI unchanged) */}
        <Dialog
          open={attendanceDialog.open}
          onClose={closeAttendanceDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Edit Attendance Days</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
              <Button
                size="small"
                onClick={() =>
                  setAttendanceDialog((d) => ({
                    ...d,
                    monthStart: d.monthStart.subtract(1, "month"),
                  }))
                }
              >
                Prev
              </Button>
              <Typography>
                {attendanceDialog.monthStart.format("MMMM YYYY")}
              </Typography>
              <Button
                size="small"
                onClick={() =>
                  setAttendanceDialog((d) => ({
                    ...d,
                    monthStart: d.monthStart.add(1, "month"),
                  }))
                }
              >
                Next
              </Button>
              <Box sx={{ flex: 1 }} />
              <Typography variant="caption">
                Selected: {attendanceDialog.selectedSet.size} day(s)
              </Typography>
            </Box>

            <MonthCalendar
              monthStart={attendanceDialog.monthStart}
              selectedSet={attendanceDialog.selectedSet}
              onDayClick={(iso) => toggleAttendanceInDialog(iso)}
            />

            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button onClick={closeAttendanceDialog}>Cancel</Button>
              <Button variant="contained" onClick={saveAttendanceFromDialog}>
                Save
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          <Alert severity={snack.severity}>{snack.message}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
