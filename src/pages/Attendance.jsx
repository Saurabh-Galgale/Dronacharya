// src/pages/AttendancePage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { getUserFromToken } from "../services/authService";
import { apiGet, apiPost } from "../services/api"; // uses api.js instance
import { useNavigate } from "react-router-dom";

/**
 * AttendancePage (हजेरी)
 *
 * Integrated with backend:
 *  - Loads students via GET /api/students?page=...
 *  - Submits attendance via POST /api/attendance
 *
 * Preserves all existing UI/UX and localStorage draft behaviour.
 *
 * Fix: send date as local YYYY-MM-DD string to avoid UTC shift (timezone issues).
 */

const STORAGE_KEY_PREFIX = "attendance_draft_";
function storageKeyFor(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${STORAGE_KEY_PREFIX}${y}-${m}-${d}`;
}

// Format a Date to local YYYY-MM-DD (server expects this format reliably)
function formatLocalDateYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Permission helper which accepts the shape you provided (array of {key, allowed})
function hasUploadPermission(user) {
  if (!user) return false;
  if (user.role && String(user.role).toUpperCase() === "ADMIN") return true;
  if (user.canUploadAttendance) return true;

  if (Array.isArray(user.permissions)) {
    // array of strings
    if (
      user.permissions.some(
        (p) =>
          typeof p === "string" && p.toLowerCase() === "canuploadattendance"
      )
    )
      return true;
    // array of objects { key, allowed }
    if (
      user.permissions.some(
        (p) =>
          p &&
          typeof p === "object" &&
          (String(p.key).toLowerCase() === "canuploadattendance" ||
            String(p.key) === "canUploadAttendance") &&
          (typeof p.allowed === "undefined" ? true : Boolean(p.allowed))
      )
    )
      return true;
  }

  return false;
}

export default function AttendancePage() {
  const navigate = useNavigate();

  // today as local day-start Date (kept for UI/draft key only)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const storageKey = storageKeyFor(today);

  // students loaded from backend (array of { reg, name, email })
  const [students, setStudents] = useState([]);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsTotalPages, setStudentsTotalPages] = useState(1);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // attendance UI state
  const [presentRegs, setPresentRegs] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // get user (may return null in dev)
  const user = (() => {
    try {
      return typeof getUserFromToken === "function" ? getUserFromToken() : null;
    } catch {
      return null;
    }
  })();

  // permission eval (check flags and permissions array)
  const canEdit = (() => {
    // allow in dev if no user — you can change this behavior
    if (!user) return true;
    return hasUploadPermission(user);
  })();

  const midnightRef = useRef(null);

  // load draft on mount
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.presentStudents)) {
          setPresentRegs(parsed.presentStudents);
        }
        if (parsed._savedAt) setLastSavedAt(parsed._savedAt);
      } catch (err) {
        console.warn("Invalid attendance draft:", err);
      }
    }

    // schedule midnight reload to clear old drafts
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(now.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    const ms = nextMidnight - now;
    midnightRef.current = setTimeout(() => {
      try {
        localStorage.removeItem(storageKey);
      } catch {}
      window.location.reload();
    }, ms + 1000);

    return () => {
      if (midnightRef.current) clearTimeout(midnightRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // persist draft helper — store date as local YYYY-MM-DD
  const persistDraft = (arr) => {
    try {
      const draft = {
        date: formatLocalDateYMD(today),
        presentStudents: arr,
        _savedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setLastSavedAt(draft._savedAt);
    } catch (err) {
      console.warn("Persist draft failed:", err);
    }
  };

  // Map backend student object to UI student shape
  function normalizeBackendStudent(s) {
    // prefer 'reg' if present, otherwise fall back to _id
    const reg = s.reg || s._id || s.email || s.mobile || s.name;
    return {
      reg,
      name: s.name || (s.email || "").split("@")[0] || String(reg),
      email: s.email || "",
    };
  }

  // fetch students page and append
  const fetchStudentsPage = async (page = 1) => {
    setLoadingStudents(true);
    try {
      const res = await apiGet("/api/students", { page });
      // expected: { page, limit, total, totalPages, data: [ { _id, name, email } ] }
      const { data = [], totalPages = 1 } = res || {};
      const normalized = Array.isArray(data)
        ? data.map(normalizeBackendStudent)
        : [];
      if (page === 1) {
        setStudents(normalized);
      } else {
        setStudents((prev) => [...prev, ...normalized]);
      }
      setStudentsPage(Number(res?.page || page));
      setStudentsTotalPages(Number(totalPages || 1));
    } catch (err) {
      console.error("fetchStudentsPage error:", err);
      alert((err && err.message) || "Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchStudentsPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // toggle selection (row or checkbox)
  const toggle = (reg) => {
    if (!canEdit) {
      console.warn("toggle prevented: user lacks permission (canEdit=false)");
      return;
    }
    if (loadingSubmit) {
      console.warn("toggle prevented: submit in progress");
      return;
    }

    setPresentRegs((prev) => {
      const has = prev.includes(reg);
      const next = has ? prev.filter((r) => r !== reg) : [...prev, reg];
      persistDraft(next);
      return next;
    });
  };

  // checkbox change handler — stop propagation so row onClick doesn't double-toggle,
  // then toggle in the same way
  const handleCheckboxChange = (e, reg) => {
    e.stopPropagation();
    toggle(reg);
  };

  // submit attendance — uses apiPost
  const handleSubmit = async () => {
    if (!canEdit || loadingSubmit) return;
    // If no students loaded and no selected, prevent
    if (!presentRegs || presentRegs.length === 0) {
      alert("किमान एक विद्यार्थी निवडा");
      return;
    }

    // IMPORTANT: send local YYYY-MM-DD string to avoid UTC shift
    const dateYMD = formatLocalDateYMD(today);

    const payload = {
      // send YYYY-MM-DD (server normalizes it to local day-start)
      date: dateYMD,
      presentRegs,
    };

    // persist draft locally first
    persistDraft(presentRegs);

    setLoadingSubmit(true);
    try {
      const res = await apiPost("/api/attendance", payload);
      // success
      setLastSavedAt(new Date().toISOString());
      alert((res && res.message) || "हजेरी जतन झाली");
    } catch (err) {
      console.error("attendance submit error:", err);
      // err shape normalized by api.js -> { message, status, raw }
      if (err && err.status === 403) {
        alert("आपल्याला हजेरी अपलोड करण्याची परवानगी नाही.");
      } else if (err && err.status === 429) {
        alert("खूप विनंत्या. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.");
      } else {
        alert((err && err.message) || "हजेरी जतन करणे अयशस्वी");
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  // load more students (if available)
  const loadMoreStudents = () => {
    if (loadingStudents) return;
    if (studentsPage >= studentsTotalPages) return;
    fetchStudentsPage(studentsPage + 1);
  };

  const marathiDate = today.toLocaleDateString("mr-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const selectedCount = presentRegs.length;
  const canSubmit = canEdit && !loadingSubmit && selectedCount > 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>दैनंदिन उपस्थिती</h2>
          <div style={{ color: "#666", fontSize: 14 }}>
            दिनांक: {marathiDate}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "#666" }}>
            प्रवेशकर्ते:{" "}
            {user ? user.name || user.email || user.role : "डेमो वापरकर्ता"}
          </div>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                ...styles.primaryBtn,
                opacity: !canSubmit ? 0.6 : 1,
                cursor: !canSubmit ? "not-allowed" : "pointer",
              }}
            >
              {loadingSubmit ? "जतन चालू आहे..." : "उपस्थिती जतन करा"}
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            निवड: {selectedCount} | शेवटचे जतन:{" "}
            {lastSavedAt
              ? new Date(lastSavedAt).toLocaleTimeString("mr-IN")
              : "नाही"}
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.instructions}>
          विद्यार्थ्यांना उपस्थित म्हणून चिन्हांकित करण्यासाठी पंक्तीवर क्लिक
          करा. क्लिक केल्याने निवड स्थानिकपणे जतन होईल.
        </div>

        <div style={styles.list}>
          {students.map((s) => {
            const checked = presentRegs.includes(s.reg);
            return (
              <div
                key={s.reg}
                role="button"
                tabIndex={0}
                onClick={() => toggle(s.reg)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(s.reg);
                  }
                }}
                aria-pressed={checked}
                style={{
                  ...styles.listItem,
                  background: checked ? "rgba(11,92,255,0.04)" : "#fff",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(s.reg);
                  }}
                  aria-label={`${s.name} (${s.reg})`}
                  disabled={loadingSubmit} // disable during submit
                  style={{ width: 18, height: 18, marginRight: 12 }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load more */}
        {studentsPage < studentsTotalPages && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              onClick={loadMoreStudents}
              disabled={loadingStudents}
              style={{
                ...styles.primaryBtn,
                background: "#fff",
                color: "#0b5cff",
                border: "1px solid rgba(11,92,255,0.16)",
                padding: "6px 12px",
                fontWeight: 600,
              }}
            >
              {loadingStudents
                ? "लोड करत आहे..."
                : "अधिक विद्यार्थ्यांना लोड करा"}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, color: "#777", fontSize: 13 }}>
        टीप: स्थानिक दिनांक बदलल्यानंतर मागील दिवसाचा मसुदा स्वयंचलितपणे हटवला
        जाईल व नवीन यादी API कडून रेंडर होईल.
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const styles = {
  container: { padding: 20, maxWidth: 920, margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  primaryBtn: {
    background: "#0b5cff",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    fontWeight: 600,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.06)",
    background: "#fff",
    boxShadow: "0 6px 20px rgba(12,12,12,0.04)",
  },
  instructions: {
    marginBottom: 12,
    color: "#444",
    fontSize: 14,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.04)",
    cursor: "pointer",
    userSelect: "none",
  },
};
