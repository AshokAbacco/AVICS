// Dashboard.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, FolderOpen, CheckCircle2, HandCoins, ShieldCheck,
  Plus, AlertTriangle, Activity as ActivityIcon, ArrowUpRight,
  TrendingUp, Clock, RefreshCw, ChevronRight, Layers, Sparkles
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

/* ============================================================
   DESIGN TOKENS — purple (#8433EC) + white only
   ============================================================ */
const PURPLE = {
  50: "#F5EEFD",
  100: "#ECE0FB",
  200: "#DAC2F7",
  300: "#BE96F1",
  400: "#A166E9",
  500: "#8433EC", // base
  600: "#6E22C9",
  700: "#571AA0",
  800: "#3F1276",
  900: "#2A0B52",
};
const WHITE = "#FFFFFF";

const BRAND = {
  primary: PURPLE[500],
  primaryHover: PURPLE[600],
  primaryLight: PURPLE[50],
};

/* ============================================================
   API
   ============================================================ */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to load dashboard data");
  return json.data;
}

const StatusPill = ({ status }) => {
  const meta = getStatusMeta(status);
  return (
    <div
      style={{
        padding: "4px 8px",
        borderRadius: 999,
        backgroundColor: meta.bg,
        color: meta.color,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "capitalize",
        display: "inline-block",
      }}
    >
      {meta.label}
    </div>
  );
};

function useDashboardSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchDashboardSummary()
      .then(setData)
      .catch((err) => setError(err.message || "Something went wrong."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}

/* ============================================================
   DESIGN TOKENS — Modern Neumorphism System (purple-tinted)
   ============================================================ */
const neumorphismShadow = `8px 8px 20px ${PURPLE[200]}66, -8px -8px 20px ${WHITE}`; // soft outer shadow
const insetShadow = `inset 4px 4px 10px ${PURPLE[200]}80, inset -4px -4px 10px ${WHITE}`; // inset shadow
const neumorphismStyle = {
  boxShadow: neumorphismShadow,
  background: WHITE,
  borderRadius: 16,
  transition: "all 0.3s ease",
};

const neumorphismHover = {
  boxShadow: `10px 10px 26px ${PURPLE[300]}66, -10px -10px 26px ${WHITE}`,
};

/* ============================================================
   UI PRIMITIVES
   ============================================================ */
const Card = ({ children, style = {}, inset = false }) => (
  <motion.div
    style={{
      ...neumorphismStyle,
      boxShadow: inset ? insetShadow : neumorphismShadow,
      background: WHITE,
      ...style,
    }}
    whileHover={{ scale: 1.02, boxShadow: inset ? insetShadow : neumorphismHover.boxShadow }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const NeumorphismButton = ({ onClick, children, disabled }) => (
  <motion.button
    style={{
      display: "flex",              // ⭐ important
      alignItems: "center",         // vertical center
      justifyContent: "center",
      gap: "8px",                  // space between icon & text
      padding: "10px 20px",
      borderRadius: 12,
      border: `1px solid ${PURPLE[100]}`,
      background: WHITE,
      boxShadow: `6px 6px 14px ${PURPLE[200]}55, -6px -6px 14px ${WHITE}`,
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 14,
      color: PURPLE[700],
      transition: "all 0.3s ease",
    }}
    whileHover={{
      scale: 1.03,
      boxShadow: neumorphismHover.boxShadow
    }}
    whileTap={{
      scale: 0.97,
      boxShadow: insetShadow
    }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </motion.button>
);
/* ============================================================
   STATUS META & UTIL — shades of purple only, darker = further along
   ============================================================ */
const getStatusMeta = (status) => {
  const STATUS_META = {
    DRAFT: { label: "Draft", color: PURPLE[600], bg: PURPLE[50] },
    SUBMITTED: { label: "Submitted", color: PURPLE[700], bg: PURPLE[100] },
    PENDING_DOCUMENTS: { label: "Pending Documents", color: PURPLE[800], bg: PURPLE[200] },
    PENDING_VERIFICATION: { label: "Pending Verification", color: PURPLE[800], bg: PURPLE[200] },
    UNDER_INVESTIGATION: { label: "Under Investigation", color: WHITE, bg: PURPLE[400] },
    UNDER_LEGAL_REVIEW: { label: "Under Legal Review", color: WHITE, bg: PURPLE[500] },
    CLAIM_PROCESSING: { label: "Claim Processing", color: WHITE, bg: PURPLE[500] },
    COMPENSATION_APPROVED: { label: "Approved", color: WHITE, bg: PURPLE[600] },
    COMPENSATION_REJECTED: { label: "Rejected", color: WHITE, bg: PURPLE[900] },
    CLOSED: { label: "Closed", color: PURPLE[700], bg: PURPLE[100] },
  };
  return STATUS_META[status] || { label: status, color: PURPLE[600], bg: PURPLE[50] };
};

/* ============================================================
   HELPERS
   ============================================================ */
function useCountUp(target, durationMs = 1200, active = true) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!active || target == null) return;
    startRef.current = null;
    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, durationMs, active]);

  return Math.round(value).toLocaleString("en-IN");
}

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function timeAgo(value) {
  if (!value) return "—";
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getCasePath(status, id) {
  return status === "DRAFT" ? `/cases/new/${id}/accident` : `/cases/${id}`;
}

/* ============================================================
   FRAMER MOTION VARIANTS
   ============================================================ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

/* ============================================================
   UI PRIMITIVES - Updated for neumorphism
   ============================================================ */

// Example: WelcomeSection with neumorphism background
const WelcomeSection = ({ stats, onReload, loading }) => (
  <motion.div
    variants={itemVariants}
    style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 20,
      padding: "28px 32px",
      background: `linear-gradient(135deg, ${PURPLE[500]} 0%, ${PURPLE[700]} 50%, ${PURPLE[500]} 100%)`,
      color: WHITE,
      marginBottom: 24,
      boxShadow: `8px 8px 16px ${PURPLE[200]}80, -8px -8px 16px ${WHITE}`
    }}
  >
    {/* Decorative Ambient Background Objects */}
    <div
      style={{
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${PURPLE[400]}4D 0%, rgba(0,0,0,0) 70%)`,
        top: -100,
        right: -50,
        pointerEvents: "none"
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 200,
        height: 200,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${PURPLE[300]}26 0%, rgba(113, 11, 230, 0) 70%)`,
        bottom: -60,
        left: "40%",
        pointerEvents: "none"
      }}
    />

    <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      {/* Left Content */}
      <div>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 999,
          background: `${PURPLE[900]}DE`,
          backdropFilter: "blur(8px)",
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 10,
          border: "1px solid rgba(255,255,255,0.15)"
        }}>
          <Sparkles size={13} color={WHITE} />
          <span>Claims Intelligence Platform</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: WHITE }}>
          AVICS Executive Summary
        </h1>
        <p style={{ fontSize: 14, color: PURPLE[100], marginTop: 6, maxWidth: 520, lineHeight: 1.5 }}>
          {stats ? (
            <>
              You currently have <span style={{ color: WHITE, fontWeight: 600 }}>{stats.activeCases} active case{stats.activeCases === 1 ? "" : "s"}</span> in the processing pipeline out of <span style={{ color: WHITE, fontWeight: 600 }}>{stats.totalCases} total</span> filed cases.
            </>
          ) : "Gathering real-time case diagnostics and compensation telemetry..."}
        </p>
      </div>

      {/* Right Button */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <NeumorphismButton onClick={onReload} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
          Sync Data
        </NeumorphismButton>
      </div>
    </div>
  </motion.div>
);

// KPI Card with neumorphism
const KpiCard = ({ label, value, icon: Icon, color, isCurrency }) => {
  const targetValue = isCurrency ? value : Number(value) || 0;
  const raw = useCountUp(targetValue, 1000, value != null);
  const display = isCurrency ? inr(value) : raw;

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: PURPLE[900] }}>{label}</span>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: PURPLE[50],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
            border: `1px solid ${PURPLE[100]}`
          }}
        >
          <Icon size={20} />
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 26, fontWeight: 800, color: PURPLE[900], letterSpacing: "-0.03em" }}>
        {value == null ? "—" : display}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12, color: PURPLE[500], fontWeight: 500 }}>
        <TrendingUp size={13} />
        <span>Live Metrics</span>
      </div>
    </Card>
  );
};

// Example of Chart sections with neumorphism
const CaseFilingTrend = ({ trend }) => (
  <Card style={{ padding: 24, flex: 2, minWidth: 320 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: PURPLE[900] }}>Case Filing & Settlement Velocity</h3>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: PURPLE[600] }}>Monthly intake comparison vs closed claims</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, fontWeight: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: PURPLE[600] }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: PURPLE[600] }} />
          Filed
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: PURPLE[300] }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: PURPLE[300] }} />
          Closed
        </div>
      </div>
    </div>
    <div style={{ width: "100%", height: 260, borderRadius: 16, overflow: "hidden" }}>
      <ResponsiveContainer>
        <AreaChart data={trend} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PURPLE[600]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={PURPLE[600]} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradInfo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PURPLE[300]} stopOpacity={0.35} />
              <stop offset="95%" stopColor={PURPLE[300]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={PURPLE[100]} strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: PURPLE[600] }} axisLine={false} tickLine={false} dy={10} />
          <YAxis tick={{ fontSize: 12, fill: PURPLE[600] }} axisLine={false} tickLine={false} width={35} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: `1px solid ${PURPLE[100]}`, boxShadow: `0 10px 25px -5px ${PURPLE[300]}40`, fontSize: 12.5, fontWeight: 500 }}
          />
          <Area type="monotone" dataKey="cases" stroke={PURPLE[600]} strokeWidth={3} fill="url(#gradPrimary)" name="Cases Filed" />
          <Area type="monotone" dataKey="settled" stroke={PURPLE[300]} strokeWidth={3} fill="url(#gradInfo)" name="Cases Closed" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const CompensationTrend = ({ trend }) => (
  <Card style={{ padding: 24, flex: 1, minWidth: 280 }}>
    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: PURPLE[900] }}>Compensation Value</h3>
    <p style={{ margin: "2px 0 20px", fontSize: 13, color: PURPLE[600] }}>Approved settlements per month</p>
    <div style={{ width: "100%", height: 260, borderRadius: 16, overflow: "hidden" }}>
      <ResponsiveContainer>
        <BarChart data={trend} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={PURPLE[100]} strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: PURPLE[600] }} axisLine={false} tickLine={false} dy={10} />
          <YAxis
            tick={{ fontSize: 11, fill: PURPLE[600] }}
            axisLine={false}
            tickLine={false}
            width={45}
            tickFormatter={(v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v}`)}
          />
          <Tooltip
            formatter={(v) => [inr(v), "Approved"]}
            contentStyle={{ borderRadius: 12, border: `1px solid ${PURPLE[100]}`, boxShadow: `0 10px 25px -5px ${PURPLE[300]}40`, fontSize: 12.5 }}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill={PURPLE[500]} name="Compensation" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

/* ============================================================
   DONUT & LISTS
   ============================================================ */
const CaseStatusDonut = ({ breakdown }) => {
  const total = breakdown.reduce((s, d) => s + d.count, 0);

  return (
    <Card style={{ padding: 24 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: PURPLE[900] }}>Status Distribution</h3>
      <p style={{ margin: "2px 0 12px", fontSize: 13, color: PURPLE[600] }}>Active portfolio across stages</p>
      {total === 0 ? (
        <p style={{ padding: "40px 0", textAlign: "center", fontSize: 13, color: PURPLE[600] }}>No active telemetry recorded.</p>
      ) : (
        <>
          <div style={{ width: "100%", height: 210, position: "relative" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={breakdown} dataKey="count" nameKey="status" innerRadius={64} outerRadius={86} paddingAngle={4}>
                  {breakdown.map((d, i) => (
                    <Cell key={i} fill={getStatusMeta(d.status).bg === WHITE ? PURPLE[300] : getStatusMeta(d.status).bg} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, entry) => [value, getStatusMeta(entry.payload.status).label]}
                  contentStyle={{ borderRadius: 12, border: `1px solid ${PURPLE[100]}`, boxShadow: `0 10px 25px -5px ${PURPLE[300]}40`, fontSize: 12.5 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: PURPLE[900], letterSpacing: "-0.03em" }}>{total}</div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: PURPLE[600] }}>Total Cases</div>
            </div>
          </div>
          {/* Breakdown grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12, maxHeight: 120, overflowY: "auto" }}>
            {breakdown.map((d) => (
              <div key={d.status} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: PURPLE[600], fontWeight: 500 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: getStatusMeta(d.status).bg === WHITE ? PURPLE[300] : getStatusMeta(d.status).bg, flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {getStatusMeta(d.status).label}
                </span>
                <span style={{ fontWeight: 700, color: PURPLE[900], marginLeft: "auto" }}>{d.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

const RecentCases = ({ cases, navigate }) => (
  <Card style={{ padding: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: PURPLE[900] }}>Recent Intake</h3>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: PURPLE[600] }}>Newly opened claim dockets</p>
      </div>
      <button
        onClick={() => navigate("/cases")}
        style={{ border: "none", background: "none", color: PURPLE[500], fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}
      >
        View All <ChevronRight size={14} />
      </button>
    </div>
    {cases.length === 0 ? (
      <p style={{ fontSize: 13, color: PURPLE[600] }}>No cases filed yet.</p>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cases.map((c) => (
          <motion.div
            key={c.id}
            whileHover={{ x: 3, backgroundColor: PURPLE[50] }}
            onClick={() => navigate(getCasePath(c.status, c.id))}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: 12,
              border: `1px solid ${PURPLE[100]}`,
              cursor: "pointer",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: PURPLE[600], display: "flex", alignItems: "center", gap: 6 }}>
                {c.caseNumber}
                <ArrowUpRight size={13} style={{ opacity: 0.6 }} />
              </div>
              <div style={{ fontSize: 12, color: PURPLE[600], marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.victim || "No victim listed"} {c.vehicle ? `· ${c.vehicle}` : ""}
              </div>
            </div>
            <StatusPill status={c.status} />
          </motion.div>
        ))}
      </div>
    )}
  </Card>
);

const CasesNeedingAttention = ({ cases, navigate }) => (
  <Card style={{ padding: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: PURPLE[100], display: "flex", alignItems: "center", justifyContent: "center", color: PURPLE[700] }}>
        <AlertTriangle size={16} />
      </div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: PURPLE[900] }}>Needs Action</h3>
    </div>
    <p style={{ margin: "2px 0 16px", fontSize: 13, color: PURPLE[600] }}>Priority bottlenecks requiring review</p>
    {cases.length === 0 ? (
      <p style={{ fontSize: 13, color: PURPLE[600] }}>No cases require immediate attention.</p>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cases.map((c) => (
          <motion.div
            key={c.id}
            whileHover={{ x: 3, backgroundColor: PURPLE[50] }}
            onClick={() => navigate(getCasePath(c.status, c.id))}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: 12,
              border: `1px solid ${PURPLE[100]}`,
              cursor: "pointer",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: PURPLE[900] }}>{c.caseNumber}</div>
              <div style={{ fontSize: 12, color: PURPLE[600], marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={11} />
                <span>Idle for {timeAgo(c.updatedAt)}</span>
              </div>
            </div>
            <StatusPill status={c.status} />
          </motion.div>
        ))}
      </div>
    )}
  </Card>
);

/* ============================================================
   ACTIVITY TIMELINE
   ============================================================ */
const ActivityTimeline = ({ activity }) => (
  <Card style={{ padding: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: PURPLE[50], display: "flex", alignItems: "center", justifyContent: "center", color: PURPLE[600] }}>
        <ActivityIcon size={18} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: PURPLE[900] }}>System Audit Feed</h3>
        <p style={{ margin: 0, fontSize: 12.5, color: PURPLE[600] }}>Real-time chronological activity</p>
      </div>
    </div>
    {activity.length === 0 ? (
      <p style={{ fontSize: 13, color: PURPLE[600] }}>No recent activity log found.</p>
    ) : (
      <div style={{ position: "relative", paddingLeft: 8 }}>
        <div style={{ position: "absolute", left: 23, top: 12, bottom: 12, width: 2, background: PURPLE[100] }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {activity.map((a) => (
            <div key={a.id} style={{ display: "flex", gap: 14, position: "relative" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: WHITE,
                  border: `2px solid ${PURPLE[500]}`,
                  boxShadow: `0 0 0 4px ${PURPLE[50]}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  zIndex: 1,
                  color: PURPLE[600],
                }}
              >
                <Layers size={14} />
              </div>
              <div style={{ paddingTop: 2 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: PURPLE[900] }}>
                  {a.action.replaceAll("_", " ").toLowerCase()}
                  {a.target && <span style={{ color: PURPLE[500], fontWeight: 700 }}> · {a.target}</span>}
                </div>
                <div style={{ fontSize: 12, color: PURPLE[600], marginTop: 2 }}>
                  <span style={{ fontWeight: 500, color: PURPLE[900] }}>{a.user}</span> · {timeAgo(a.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </Card>
);

/* ============================================================
   LOADING & ERROR STATES
   ============================================================ */
const LoadingState = () => (
  <div style={{ display: "grid", gap: 20 }}>
    <div style={{ height: 120, background: PURPLE[100], borderRadius: 16, animation: "pulse 1.5s infinite" }} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ height: 100, background: PURPLE[50], borderRadius: 16 }} />
      ))}
    </div>
    <style>
      {`@keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }`}
    </style>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 12, textAlign: "center" }}>
    <div style={{ width: 48, height: 48, borderRadius: 999, background: PURPLE[900], color: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <AlertTriangle size={24} />
    </div>
    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: PURPLE[900] }}>Dashboard Telemetry Error</h4>
    <p style={{ fontSize: 13.5, color: PURPLE[600], maxWidth: 380, margin: 0 }}>{message}</p>
    <NeumorphismButton onClick={onRetry}>Retry Fetching</NeumorphismButton>
  </div>
);

/* ============================================================
   ROOT DASHBOARD COMPONENT
   ============================================================ */
export default function AVICSDashboard() {
  const { data, loading, error, reload } = useDashboardSummary();
  const navigate = useNavigate();

  return (
    <div style={{ background: "#faf9fe", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", paddingBottom: 20 }}>
      {/* Global Styles for animations */}
      <style>{`
        * { box-sizing: border-box; }
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Top Header with neumorphism */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          borderBottom: `1px solid ${PURPLE[100]}`,
          background: "#faf9fe",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Logo & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 800, fontSize: 16, color: PURPLE[900] }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: PURPLE[500], display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${PURPLE[500]}4D` }}>
            <ShieldCheck size={20} color={WHITE} />
          </div>
          AVICS<span style={{ color: PURPLE[500], fontWeight: 500, marginLeft: -8 }}>Claims</span>
        </div>
        {/* New Case Button */}
        <NeumorphismButton onClick={() => navigate("/cases/new")}>
          <Plus size={16} /> New Case Docket
        </NeumorphismButton>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1600, margin: "0 auto", padding: "24px 28px" }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Welcome Section */}
          <WelcomeSection stats={data?.stats} onReload={reload} loading={loading} />

          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <LoadingState />
          ) : (
            <>
              {/* KPI Cards */}
              <motion.div
                variants={containerVariants}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <KpiCard label="Total Cases" value={data.stats.totalCases} icon={FileText} color={PURPLE[500]} />
                <KpiCard label="Active Pipeline" value={data.stats.activeCases} icon={FolderOpen} color={PURPLE[400]} />
                <KpiCard label="Closed / Settled" value={data.stats.closedCases} icon={CheckCircle2} color={PURPLE[700]} />
                <KpiCard label="Total Approved" value={data.stats.totalCompensation} icon={HandCoins} color={PURPLE[600]} isCurrency />
              </motion.div>

              {/* Charts Section */}
              <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
                <CaseFilingTrend trend={data.caseFilingTrend} />
                <CompensationTrend trend={data.compensationTrend} />
              </div>

              {/* Breakdown Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 24 }}>
                <CaseStatusDonut breakdown={data.statusBreakdown} />
                <RecentCases cases={data.recentCases} navigate={navigate} />
                <CasesNeedingAttention cases={data.casesNeedingAttention} navigate={navigate} />
              </div>

              {/* Activity Timeline */}
              <ActivityTimeline activity={data.recentActivity} />
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}