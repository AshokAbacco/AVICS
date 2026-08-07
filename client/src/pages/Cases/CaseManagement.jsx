// client/src/pages/Cases/CaseManagement.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderKanban, FolderOpen, CheckCircle2, Clock, Plus, FileStack,
  Search, SlidersHorizontal, Eye, Trash2, ChevronLeft, ChevronRight,
  AlertTriangle, Inbox
} from 'lucide-react'
import { CASE_STATUS_OPTIONS } from '../../constants/caseStatus.js'
import { getCases, deleteCase } from './services/caseWizardService.js'
import DocumentTypesModal from './DocumentTypesModal.jsx'

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

const cardShadow = `8px 8px 20px ${PURPLE[200]}66, -8px -8px 20px ${WHITE}`;
const cardShadowHover = `10px 10px 26px ${PURPLE[300]}66, -10px -10px 26px ${WHITE}`;
const insetShadow = `inset 4px 4px 10px ${PURPLE[200]}80, inset -4px -4px 10px ${WHITE}`;
const neumorphismStyle = { boxShadow: cardShadow, background: WHITE, borderRadius: 16, transition: "all 0.3s ease" };

/* ============================================================
   UI PRIMITIVES — mirrors ClaimManagement.jsx / DocumentManagement.jsx
   ============================================================ */
const Card = ({ children, style = {}, inset = false }) => (
  <motion.div
    style={{ ...neumorphismStyle, boxShadow: inset ? insetShadow : cardShadow, background: WHITE, ...style }}
    whileHover={{ scale: 1.005, boxShadow: inset ? insetShadow : cardShadowHover }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const NeumorphismButton = ({ onClick, children, disabled, variant = "default" }) => {
  const isDanger = variant === "danger";
  const isGhost = variant === "ghost";
  return (
    <motion.button
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 18px",
        borderRadius: 12,
        border: isGhost ? "none" : `1px solid ${PURPLE[100]}`,
        background: isGhost ? "transparent" : WHITE,
        boxShadow: isGhost ? "none" : `6px 6px 14px ${PURPLE[200]}55, -6px -6px 14px ${WHITE}`,
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600,
        fontSize: 13.5,
        color: isDanger ? PURPLE[900] : PURPLE[700],
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.3s ease",
      }}
      whileHover={disabled ? {} : {
        scale: isGhost ? 1.0 : 1.03,
        boxShadow: isGhost ? "none" : cardShadowHover
      }}
      whileTap={disabled ? {} : {
        scale: 0.97,
        boxShadow: isGhost ? "none" : insetShadow
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

const IconButton = ({ onClick, children, tone = "default", title }) => {
  const colorMap = {
    default: PURPLE[600],
    primary: PURPLE[600],
    danger: PURPLE[900],
  };
  return (
    <motion.button
      title={title}
      onClick={onClick}
      whileHover={{ scale: 1.08, backgroundColor: PURPLE[50] }}
      whileTap={{ scale: 0.94 }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        border: "none",
        background: "transparent",
        color: colorMap[tone] || PURPLE[600],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {children}
    </motion.button>
  );
};

/* ============================================================
   STATUS META & PILL — shades of purple only, darker = further along
   ============================================================ */
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
const getStatusMeta = (status) => STATUS_META[status] || { label: status, color: PURPLE[600], bg: PURPLE[50] };

const StatusPill = ({ status }) => {
  const meta = getStatusMeta(status);
  return (
    <div
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        backgroundColor: meta.bg,
        color: meta.color,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "capitalize",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {meta.label}
    </div>
  );
};

/* ============================================================
   HELPERS
   ============================================================ */
function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getViewPath(caseRecord) {
  return caseRecord.status === 'DRAFT'
    ? `/cases/new/${caseRecord.id}/accident`
    : `/cases/${caseRecord.id}`
}

const STATUS_LABELS = ['All', ...CASE_STATUS_OPTIONS.map((o) => o.label)]
const LABEL_TO_VALUE = Object.fromEntries(CASE_STATUS_OPTIONS.map((o) => [o.label, o.value]))

/* ============================================================
   FRAMER MOTION VARIANTS
   ============================================================ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

/* ============================================================
   STAT CARD
   ============================================================ */
const StatTile = ({ label, value, icon: Icon }) => (
  <Card style={{ padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: PURPLE[900] }}>{label}</span>
      <div
        style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: PURPLE[50], display: "flex",
          alignItems: "center", justifyContent: "center",
          color: PURPLE[500], border: `1px solid ${PURPLE[100]}`,
        }}
      >
        <Icon size={20} />
      </div>
    </div>
    <div style={{ marginTop: 12, fontSize: 26, fontWeight: 800, color: PURPLE[900], letterSpacing: "-0.03em" }}>
      {value}
    </div>
  </Card>
);

/* ============================================================
   TOOLBAR: search + status filter
   ============================================================ */
const Toolbar = ({ search, onSearch, filterLabel, onFilter }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <Card style={{ padding: 14, marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            flex: "1 1 320px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            borderRadius: 12,
            background: WHITE,
            boxShadow: insetShadow,
          }}
        >
          <Search size={16} color={PURPLE[300]} />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by case number, victim, vehicle, FIR, MVC..."
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13.5, color: PURPLE[900], width: "100%", fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setFilterOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 16px", borderRadius: 12, border: `1px solid ${PURPLE[100]}`,
              background: WHITE, boxShadow: cardShadow,
              fontSize: 13, fontWeight: 600, color: PURPLE[700], cursor: "pointer",
            }}
          >
            <SlidersHorizontal size={15} color={PURPLE[500]} />
            {filterLabel === 'All' ? 'All Statuses' : filterLabel}
          </button>
          <AnimatePresence>
            {filterOpen && (
              <>
                <div onClick={() => setFilterOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 15 }} />
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    background: WHITE, borderRadius: 14,
                    boxShadow: `0 12px 30px -8px ${PURPLE[300]}55`,
                    border: `1px solid ${PURPLE[100]}`,
                    padding: 8, minWidth: 220, zIndex: 20, maxHeight: 280, overflowY: "auto",
                  }}
                >
                  {STATUS_LABELS.map((label) => (
                    <div
                      key={label}
                      onClick={() => { onFilter(label); setFilterOpen(false); }}
                      style={{
                        padding: "8px 12px", borderRadius: 8, fontSize: 13,
                        fontWeight: label === filterLabel ? 700 : 500,
                        color: label === filterLabel ? PURPLE[600] : PURPLE[800],
                        background: label === filterLabel ? PURPLE[50] : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};

/* ============================================================
   TABLE
   ============================================================ */
const TableSkeletonRow = () => (
  <tr>
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} style={{ padding: "14px 16px" }}>
        <div style={{ height: 14, borderRadius: 6, background: PURPLE[50], animation: "pulse 1.5s infinite" }} />
      </td>
    ))}
  </tr>
);

const EmptyRow = () => (
  <tr>
    <td colSpan={7} style={{ padding: "56px 16px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 999, background: PURPLE[50], display: "flex", alignItems: "center", justifyContent: "center", color: PURPLE[400] }}>
          <Inbox size={22} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: PURPLE[900] }}>No cases found</div>
        <div style={{ fontSize: 12.5, color: PURPLE[600], maxWidth: 320 }}>
          Try a different search term or filter, or add a new case to get started.
        </div>
      </div>
    </td>
  </tr>
);

const ErrorBanner = ({ message }) => (
  <div
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px", borderRadius: 14, marginBottom: 20,
      background: PURPLE[900], color: WHITE, fontSize: 13.5, fontWeight: 600,
    }}
  >
    <AlertTriangle size={16} />
    {message}
  </div>
);

const CasesTable = ({ cases, loading, navigate, onDelete }) => {
  const headers = ['Case No.', 'Victim', 'Vehicle', 'Accident Date', 'District', 'Status', ''];
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left", padding: "14px 16px", fontSize: 11.5,
                    fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                    color: PURPLE[900], borderBottom: `1px solid ${PURPLE[100]}`, whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <TableSkeletonRow key={i} />)
            ) : cases.length === 0 ? (
              <EmptyRow />
            ) : (
              cases.map((row) => (
                <motion.tr
                  key={row.id}
                  whileHover={{ backgroundColor: PURPLE[50] }}
                  style={{ borderBottom: `1px solid ${PURPLE[50]}`, cursor: "pointer" }}
                  onClick={() => navigate(getViewPath(row))}
                >
                  <td style={{ padding: "14px 16px", fontSize: 13.5, fontWeight: 700, color: PURPLE[600] }}>
                    {row.caseNumber}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: PURPLE[800] }}>
                    {row.victims?.[0]?.name || '—'}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: PURPLE[800] }}>
                    {row.vehicles?.[0]?.registrationNumber || '—'}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: PURPLE[800] }}>
                    {formatDate(row.accident?.accidentDate)}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: PURPLE[800] }}>
                    {row.accident?.district || '—'}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusPill status={row.status} />
                  </td>
                  <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <IconButton title="View" tone="primary" onClick={() => navigate(getViewPath(row))}>
                        <Eye size={16} />
                      </IconButton>
                      <IconButton title="Delete" tone="danger" onClick={() => onDelete(row)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 20 }}>
      <IconButton title="Previous" onClick={() => page > 1 && onPageChange(page - 1)}>
        <ChevronLeft size={18} />
      </IconButton>
      <span style={{ fontSize: 13, fontWeight: 600, color: PURPLE[900] }}>
        Page {page} of {totalPages}
      </span>
      <IconButton title="Next" onClick={() => page < totalPages && onPageChange(page + 1)}>
        <ChevronRight size={18} />
      </IconButton>
    </div>
  );
};

/* ============================================================
   ROOT COMPONENT
   ============================================================ */
export default function CaseManagement() {
  const navigate = useNavigate()

  const [cases, setCases] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [filterLabel, setFilterLabel] = useState('All')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [docTypesModalOpen, setDocTypesModalOpen] = useState(false)

  const fetchCases = useCallback((page = 1) => {
    setLoading(true)
    setErrorMsg('')
    const status = filterLabel === 'All' ? undefined : LABEL_TO_VALUE[filterLabel]

    getCases({ search: search || undefined, status, page })
      .then((res) => {
        setCases(res.data)
        setPagination(res.pagination)
      })
      .catch((err) => setErrorMsg(err?.response?.data?.message || 'Failed to load cases.'))
      .finally(() => setLoading(false))
  }, [search, filterLabel])

  useEffect(() => {
    const timer = setTimeout(() => fetchCases(1), 300)
    return () => clearTimeout(timer)
  }, [fetchCases])

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete case ${row.caseNumber}? This cannot be undone.`)) return
    try {
      await deleteCase(row.id)
      fetchCases(pagination.page)
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to delete case.')
    }
  }

  const stats = [
    { label: 'Total Cases', value: pagination.total, icon: FolderKanban },
    { label: 'Under Investigation', value: cases.filter((c) => c.status === 'UNDER_INVESTIGATION').length, icon: FolderOpen },
    { label: 'Compensation Approved', value: cases.filter((c) => c.status === 'COMPENSATION_APPROVED').length, icon: CheckCircle2 },
    { label: 'Pending Verification', value: cases.filter((c) => c.status === 'PENDING_VERIFICATION').length, icon: Clock },
  ]

  return (
    <div style={{ background: "#faf9fe", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", paddingBottom: 20 }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>

      <main style={{ maxWidth: 1600, margin: "0 auto", padding: "24px 28px" }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

        {/* Page header */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: PURPLE[900] }}>
              Case <span style={{ color: PURPLE[500] }}>Management</span>
            </h1>

            {/* Line with 3 Moving Arrows */}
            <div style={{ position: "relative", height: 18, width: "100%", maxWidth: 400, display: "flex", alignItems: "center", margin: "4px 0", overflow: "hidden" }}>
              <div style={{ width: "100%", height: 1.5, backgroundColor: "rgba(132, 51, 236, 0.2)" }} />

              {[
                { tailWidth: 20, delay: 0 },
                { tailWidth: 35, delay: 0.5 },
                { tailWidth: 55, delay: 1.0 },
              ].map((arrow, index) => (
                <motion.div
                  key={index}
                  animate={{ x: ["-70px", "400px"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.4,
                    delay: arrow.delay,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    left: 0,
                    display: "flex",
                    alignItems: "center",
                    color: "#8433ec",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  <div style={{ width: arrow.tailWidth, height: 2, background: "linear-gradient(90deg, transparent, #8433ec)" }} />
                  <span style={{ marginLeft: -1 }}>&#10095;</span>
                </motion.div>
              ))}
            </div>

            <p style={{ fontSize: 13.5, color: PURPLE[600], marginTop: 2, maxWidth: 520, lineHeight: 1.5 }}>
              Track and manage all motor accident claim cases.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NeumorphismButton onClick={() => setDocTypesModalOpen(true)}>
              <FileStack size={15} /> Add Document Types
            </NeumorphismButton>
            <NeumorphismButton onClick={() => navigate('/cases/new')}>
              <Plus size={16} /> Add Case
            </NeumorphismButton>
          </div>
        </motion.div>

          {errorMsg && <ErrorBanner message={errorMsg} />}

          {/* Stat tiles */}
          <motion.div
            variants={containerVariants}
            style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16, marginBottom: 20,
            }}
          >
            {stats.map((s) => <StatTile key={s.label} {...s} />)}
          </motion.div>

          {/* Toolbar */}
          <Toolbar search={search} onSearch={setSearch} filterLabel={filterLabel} onFilter={setFilterLabel} />

          {/* Table */}
          <CasesTable cases={cases} loading={loading} navigate={navigate} onDelete={handleDelete} />

          {/* Pagination */}
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchCases} />
        </motion.div>
      </main>

      <DocumentTypesModal isOpen={docTypesModalOpen} onClose={() => setDocTypesModalOpen(false)} />
    </div>
  )
}