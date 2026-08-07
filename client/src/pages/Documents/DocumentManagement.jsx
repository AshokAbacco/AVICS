// client/src/pages/Documents/DocumentManagement.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, FileCheck, FileClock, FileX, User, Car, FolderClosed, Eye,
  AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Search,
  SlidersHorizontal, Inbox, Paperclip,
} from 'lucide-react'
import { formatDate } from '../../utils/format.js'
import { listDocuments } from './services/documentService.js'

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
   UI PRIMITIVES
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

const NeumorphismButton = ({ onClick, children, disabled }) => (
  <motion.button
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      padding: "10px 18px", borderRadius: 12, border: `1px solid ${PURPLE[100]}`,
      background: WHITE, boxShadow: `6px 6px 14px ${PURPLE[200]}55, -6px -6px 14px ${WHITE}`,
      cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13.5,
      color: PURPLE[700], opacity: disabled ? 0.6 : 1, transition: "all 0.3s ease",
    }}
    whileHover={disabled ? {} : { scale: 1.03, boxShadow: cardShadowHover }}
    whileTap={disabled ? {} : { scale: 0.97, boxShadow: insetShadow }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </motion.button>
);

const IconButton = ({ onClick, children, tone = "default", title, disabled }) => {
  const colorMap = { default: PURPLE[600], strong: PURPLE[800] };
  return (
    <motion.button
      title={title}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.08, backgroundColor: PURPLE[50] }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      style={{
        width: 32, height: 32, borderRadius: 10, border: "none", background: "transparent",
        color: colorMap[tone] || PURPLE[600], display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1,
      }}
    >
      {children}
    </motion.button>
  );
};

/* ============================================================
   STATUS META & PILL — verified / pending / rejected (shades of purple)
   ============================================================ */
const DOC_STATUS_META = {
  PENDING: { label: "Pending", color: PURPLE[700], bg: PURPLE[100] },
  VERIFIED: { label: "Verified", color: WHITE, bg: PURPLE[500] },
  REJECTED: { label: "Rejected", color: WHITE, bg: PURPLE[900] },
};
const getDocStatusMeta = (status) => DOC_STATUS_META[status] || { label: status || '—', color: PURPLE[600], bg: PURPLE[50] };

const StatusPill = ({ status }) => {
  const meta = getDocStatusMeta(status);
  return (
    <div
      style={{
        padding: "4px 10px", borderRadius: 999, backgroundColor: meta.bg, color: meta.color,
        fontSize: 11, fontWeight: 700, textTransform: "capitalize", display: "inline-block", whiteSpace: "nowrap",
        border: meta.bg === WHITE ? `1px solid ${PURPLE[200]}` : "none",
      }}
    >
      {meta.label}
    </div>
  );
};

/* ============================================================
   HELPERS
   ============================================================ */
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'CASE', label: 'Case-Level' },
  { value: 'VICTIM', label: 'Victim' },
  { value: 'VEHICLE', label: 'Vehicle' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
]

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
   STAT TILE
   ============================================================ */
const StatTile = ({ label, value, icon: Icon }) => (
  <Card style={{ padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: PURPLE[900] }}>{label}</span>
      <div
        style={{
          width: 40, height: 40, borderRadius: 12, backgroundColor: PURPLE[50],
          display: "flex", alignItems: "center", justifyContent: "center",
          color: PURPLE[500], border: `1px solid ${PURPLE[100]}`,
        }}
      >
        <Icon size={20} />
      </div>
    </div>
    <div style={{ marginTop: 12, fontSize: 26, fontWeight: 800, color: PURPLE[900], letterSpacing: "-0.03em" }}>
      {value ?? 0}
    </div>
  </Card>
);

/* ============================================================
   TOOLBAR: search + category + status dropdowns
   ============================================================ */
const FilterDropdown = ({ label, icon: Icon, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const activeLabel = options.find((o) => o.value === value)?.label || label;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
          borderRadius: 12, border: `1px solid ${PURPLE[100]}`, background: WHITE, boxShadow: cardShadow,
          fontSize: 13, fontWeight: 600, color: PURPLE[700], cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        <Icon size={15} color={PURPLE[500]} />
        {activeLabel}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 15 }} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)", background: WHITE,
                borderRadius: 14, boxShadow: `0 12px 30px -8px ${PURPLE[300]}55`, border: `1px solid ${PURPLE[100]}`,
                padding: 8, minWidth: 200, zIndex: 20,
              }}
            >
              {options.map((opt) => (
                <div
                  key={opt.value || 'all'}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    padding: "8px 12px", borderRadius: 8, fontSize: 13,
                    fontWeight: opt.value === value ? 700 : 500,
                    color: opt.value === value ? PURPLE[600] : PURPLE[800],
                    background: opt.value === value ? PURPLE[50] : "transparent",
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const Toolbar = ({ caseNumber, onCaseNumber, category, onCategory, verified, onVerified }) => (
  <Card style={{ padding: 14, marginBottom: 20 }}>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
      <div
        style={{
          flex: "1 1 320px", display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px", borderRadius: 12, background: WHITE, boxShadow: insetShadow,
        }}
      >
        <Search size={16} color={PURPLE[300]} />
        <input
          value={caseNumber}
          onChange={(e) => onCaseNumber(e.target.value)}
          placeholder="Search by case number..."
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: PURPLE[900], width: "100%", fontFamily: "inherit" }}
        />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <FilterDropdown label="All Categories" icon={FolderClosed} options={CATEGORY_OPTIONS} value={category} onChange={onCategory} />
        <FilterDropdown label="All Statuses" icon={SlidersHorizontal} options={STATUS_OPTIONS} value={verified} onChange={onVerified} />
      </div>
    </div>
  </Card>
);

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
        <div style={{ fontSize: 14, fontWeight: 700, color: PURPLE[900] }}>No documents found</div>
        <div style={{ fontSize: 12.5, color: PURPLE[600], maxWidth: 320 }}>
          No documents match these filters. Try adjusting your search or category.
        </div>
      </div>
    </td>
  </tr>
);

const ErrorState = ({ message, onRetry }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 12, textAlign: "center" }}>
    <div style={{ width: 48, height: 48, borderRadius: 999, background: PURPLE[900], color: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <AlertCircle size={22} />
    </div>
    <p style={{ fontSize: 13.5, color: PURPLE[600], maxWidth: 360, margin: 0 }}>{message}</p>
    <NeumorphismButton onClick={onRetry}>
      <RefreshCw size={14} /> Retry
    </NeumorphismButton>
  </div>
);

const LinkedToCell = ({ doc }) => {
  const isVictim = !!doc.victim;
  const isVehicle = !!doc.vehicle;
  const Icon = isVictim ? User : isVehicle ? Car : FolderClosed;
  const text = isVictim ? doc.victim.name : isVehicle ? doc.vehicle.registrationNumber : 'Case-level';
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: PURPLE[800] }}>
      <Icon size={13} color={PURPLE[300]} />
      {text}
    </div>
  );
};

const DocumentsTable = ({ documents, loading }) => {
  const headers = ['Case', 'Linked To', 'Document Type', 'File', 'Received', 'Status', ''];
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left", padding: "14px 16px", fontSize: 11.5, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.04em", color: PURPLE[900],
                    borderBottom: `1px solid ${PURPLE[100]}`, whiteSpace: "nowrap",
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
            ) : documents.length === 0 ? (
              <EmptyRow />
            ) : (
              documents.map((doc) => (
                <motion.tr key={doc.id} whileHover={{ backgroundColor: PURPLE[50] }} style={{ borderBottom: `1px solid ${PURPLE[50]}` }}>
                  <td style={{ padding: "14px 16px" }}>
                    <Link to={`/cases/${doc.case?.id}`} style={{ fontSize: 13.5, fontWeight: 700, color: PURPLE[600], textDecoration: "none" }}>
                      {doc.case?.caseNumber}
                    </Link>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <LinkedToCell doc={doc} />
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: PURPLE[800] }}>
                    {doc.documentType?.name}
                    {doc.documentType?.isMandatory && (
                      <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: PURPLE[500] }}>
                        required
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13 }}>
                    {doc.fileUpload ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                        <Paperclip size={12} color={PURPLE[300]} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: PURPLE[800], fontWeight: 500 }}>
                            {doc.fileUpload.originalName}
                          </div>
                          <div style={{ fontSize: 11, color: PURPLE[400] }}>{formatBytes(doc.fileUpload.fileSize)}</div>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontStyle: "italic", color: PURPLE[200] }}>Not uploaded</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: PURPLE[600] }}>
                    {doc.receivedDate ? formatDate(doc.receivedDate) : '—'}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusPill status={doc.verified} />
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Link to={`/documents/${doc.id}`} style={{ textDecoration: "none" }}>
                      <IconButton title="View" tone="default">
                        <Eye size={16} />
                      </IconButton>
                    </Link>
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

const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
      <span style={{ fontSize: 12.5, color: PURPLE[600] }}>
        Page {page} of {totalPages} · {total} document{total === 1 ? '' : 's'}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <IconButton title="Previous" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
          <ChevronLeft size={18} />
        </IconButton>
        <IconButton title="Next" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>
          <ChevronRight size={18} />
        </IconButton>
      </div>
    </div>
  );
};

/* ============================================================
   ROOT COMPONENT
   ============================================================ */
export default function DocumentManagement() {
  const [caseNumber, setCaseNumber] = useState('')
  const [category, setCategory] = useState('')
  const [verified, setVerified] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const [result, setResult] = useState({ documents: [], total: 0, stats: { total: 0, PENDING: 0, VERIFIED: 0, REJECTED: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    listDocuments({ caseNumber: caseNumber || undefined, category: category || undefined, verified: verified || undefined, page, limit })
      .then(setResult)
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load documents.'))
      .finally(() => setLoading(false))
  }

  // Debounced refetch whenever a filter or page changes.
  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseNumber, category, verified, page])

  // Any filter change resets to page 1.
  useEffect(() => { setPage(1) }, [caseNumber, category, verified])

  const totalPages = Math.max(1, Math.ceil(result.total / limit))

  return (
    <div style={{ background: "#faf9fe", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", paddingBottom: 20 }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>

      <main style={{ maxWidth: 1600, margin: "0 auto", padding: "24px 28px" }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* Page header — plain, no gradient banner */}
        <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: PURPLE[900] }}>
            <span style={{ color: PURPLE[500] }}>Document</span> Management
          </h1>

          {/* Radar Node + Tracking Line */}
          <div className="relative h-6 w-full max-w-md flex items-center my-1">
            {/* Base Accent Line */}
            <div className="w-full h-[1px] bg-gradient-to-r from-[#8433ec] via-purple-300 to-transparent" />

            {/* Pulsing Radar Ring on Left Endpoint */}
            <div className="absolute left-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                className="absolute w-3 h-3 rounded-full border border-[#8433ec]"
              />
              <div className="w-2 h-2 rounded-full bg-[#8433ec] shadow-[0_0_6px_#8433ec]" />
            </div>
          </div>

          <p style={{ fontSize: 13.5, color: PURPLE[600], marginTop: 2, maxWidth: 620, lineHeight: 1.5 }}>
            Browse, preview, and verify FIRs, medical reports, and case-related documents across every case.
          </p>
        </motion.div>

          {/* Stat tiles */}
          <motion.div
            variants={containerVariants}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}
          >
            <StatTile label="Total Documents" value={result.stats.total} icon={FileText} />
            <StatTile label="Verified" value={result.stats.VERIFIED} icon={FileCheck} />
            <StatTile label="Pending Review" value={result.stats.PENDING} icon={FileClock} />
            <StatTile label="Rejected" value={result.stats.REJECTED} icon={FileX} />
          </motion.div>

          {/* Toolbar */}
          <Toolbar
            caseNumber={caseNumber} onCaseNumber={setCaseNumber}
            category={category} onCategory={setCategory}
            verified={verified} onVerified={setVerified}
          />

          {/* Table / error / empty */}
          {error ? (
            <Card style={{ padding: 0 }}>
              <ErrorState message={error} onRetry={load} />
            </Card>
          ) : (
            <>
              <DocumentsTable documents={result.documents} loading={loading} />
              {!loading && result.documents.length > 0 && (
                <Pagination page={result.page || page} totalPages={totalPages} total={result.total} onPageChange={setPage} />
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}