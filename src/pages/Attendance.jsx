// src/pages/AttendancePage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { getUserFromToken } from "../services/authService";
import { useNavigate } from "react-router-dom";

/**
 * AttendancePage (हजेरी)
 *
 * - Row click toggles selection.
 * - Checkbox change toggles selection (stops propagation to avoid double toggle).
 * - Persist draft to localStorage on every toggle + submit.
 * - Submit disabled unless at least one student selected and not loading.
 * - Marathi UI.
 *
 * This version includes small console logs to help diagnose why checkboxes may
 * be unresponsive in your environment.
 */

const STORAGE_KEY_PREFIX = "attendance_draft_";
function storageKeyFor(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${STORAGE_KEY_PREFIX}${y}-${m}-${d}`;
}

const MOCK_STUDENTS_12 = [
  { reg: "STU001", name: "अमोल पाटील" },
  { reg: "STU002", name: "सोनाली देशमुख" },
  { reg: "STU003", name: "रोहन कदम" },
  { reg: "STU004", name: "प्रिया कुलकर्णी" },
  { reg: "STU005", name: "विक्रम देशपाण्डे" },
  { reg: "STU006", name: "नैना शर्मा" },
  { reg: "STU007", name: "संदीप शिंदे" },
  { reg: "STU008", name: "रेनू खरात" },
  { reg: "STU009", name: "शेखर ऊर्फ" },
  { reg: "STU010", name: "मीनाक्षी जोशी" },
  { reg: "STU011", name: "अभिजीत गावंडे" },
  { reg: "STU012", name: "काव्या नाईक" },
];

export default function AttendancePage() {
  const navigate = useNavigate();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const storageKey = storageKeyFor(today);

  const [students] = useState(MOCK_STUDENTS_12);
  const [presentRegs, setPresentRegs] = useState([]);
  const [loading, setLoading] = useState(false);
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
    // if (!user) return true; // dev fallback
    // if (user.role === "ADMIN") return true;
    // if (user.canUploadAttendance) return true;
    // if (user.canManageAttendance) return true;
    // if (user.permissions && Array.isArray(user.permissions)) {
    //   if (
    //     user.permissions.includes("UPLOAD_ATTENDANCE") ||
    //     user.permissions.includes("MANAGE_ATTENDANCE")
    //   )
    //     return true;
    // }
    // return false;
    return true;
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

  // persist draft helper
  const persistDraft = (arr) => {
    try {
      const draft = {
        date: today.toISOString(),
        presentStudents: arr,
        _savedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setLastSavedAt(draft._savedAt);
    } catch (err) {
      console.warn("Persist draft failed:", err);
    }
  };

  // toggle selection (row or checkbox)
  const toggle = (reg) => {
    if (!canEdit) {
      console.warn("toggle prevented: user lacks permission (canEdit=false)");
      return;
    }
    if (loading) {
      console.warn("toggle prevented: loading in progress");
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

  // submit attendance (mock)
  const handleSubmit = async () => {
    if (!canEdit || loading || presentRegs.length === 0) return;
    const payload = {
      date: today.toISOString(),
      presentStudents: presentRegs,
    };

    persistDraft(presentRegs);

    setLoading(true);
    setTimeout(() => {
      setLastSavedAt(new Date().toISOString());
      setLoading(false);
      alert("मॉक: हजेरी यशस्वीपणे जतन केली.");
    }, 800);
  };

  const marathiDate = today.toLocaleDateString("mr-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const selectedCount = presentRegs.length;
  const canSubmit = canEdit && !loading && selectedCount > 0;

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
              {loading ? "जतन चालू आहे..." : "उपस्थिती जतन करा"}
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
                onClick={() => toggle(s.reg)} // row click works
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
                    e.stopPropagation(); // prevent row double-toggle
                    toggle(s.reg); // direct checkbox toggle
                  }}
                  aria-label={`${s.name} (${s.reg})`}
                  disabled={loading} // only disable during submit
                  style={{ width: 18, height: 18, marginRight: 12 }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ color: "#666", fontSize: 13 }}>{s.reg}</div>
                </div>
              </div>
            );
          })}
        </div>
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
