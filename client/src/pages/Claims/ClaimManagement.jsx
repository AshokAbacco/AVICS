// src/pages/Claims/ClaimManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, CheckCircle2, Clock4, BadgeIndianRupee, Plus, Search,
  SlidersHorizontal, Pencil, Trash2, X, Inbox, AlertCircle,
  ChevronLeft, ChevronRight, Loader2,
  Space,
} from 'lucide-react'
import { claimService } from '../../services/claimService.js'
import { caseService } from '../../services/caseService.js'
import api from '../../services/api.js'
import { formatCurrency } from '../../utils/format.js'

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

const NeumorphismButton = ({ onClick, children, disabled, type = "button" }) => (
  <motion.button
    type={type}
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

const PrimaryButton = ({ onClick, children, disabled, type = "button" }) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? {} : { scale: 1.03 }}
    whileTap={disabled ? {} : { scale: 0.97 }}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: "10px 20px", borderRadius: 12, border: "none",
      background: PURPLE[500], color: WHITE, fontWeight: 700, fontSize: 13.5,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
      boxShadow: `0 8px 20px -6px ${PURPLE[500]}80`,
    }}
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
        color: colorMap[tone], display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1,
      }}
    >
      {children}
    </motion.button>
  );
};

/* ============================================================
   STATUS META & PILLS — shades of purple only, darker = further along
   ============================================================ */
const CLAIM_STATUS_META = {
  PENDING: { label: "Pending", color: WHITE[700], bg: PURPLE[100] },
  UNDER_REVIEW: { label: "Under Review", color: WHITE[800], bg: PURPLE[200] },
  APPROVED: { label: "Approved", color: WHITE, bg: PURPLE[500] },
  PARTIALLY_APPROVED: { label: "Partially Approved", color: WHITE[900], bg: PURPLE[300] },
  REJECTED: { label: "Rejected", color: WHITE, bg: PURPLE[900] },
  CLOSED: { label: "Closed", color: WHITE[600], bg: PURPLE[400] },
};
const PAYMENT_STATUS_META = {
  UNPAID: { label: "Unpaid", color: WHITE, bg: PURPLE[900] },
  PROCESSING: { label: "Processing", color: PURPLE[800], bg: PURPLE[200] },
  PAID: { label: "Paid", color: WHITE, bg: PURPLE[500] },
  PARTIALLY_PAID: { label: "Partially Paid", color: PURPLE[900], bg: PURPLE[300] },
  PENDING: { label: "Pending", color: PURPLE[700], bg: PURPLE[100] },
};

const StatusPill = ({ status, metaMap }) => {
  const meta = metaMap[status] || { label: status || '—', color: PURPLE[600], bg: PURPLE[50] };
  return (
    <div style={{ padding: "4px 10px", borderRadius: 999, backgroundColor: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700, display: "inline-block", whiteSpace: "nowrap", border: meta.bg === WHITE ? `1px solid ${PURPLE[200]}` : "none" }}>
      {meta.label}
    </div>
  );
};

/* ============================================================
   TABLE COLUMNS
   ============================================================ */
const columns = [
  { key: 'claimNumber', label: 'Claim No.', render: (row) => <span style={{ fontWeight: 700, color: PURPLE[600] }}>{row.claimNumber}</span> },
  { key: 'case', label: 'Case', render: (row) => row.case?.caseNumber || row.caseId || '—' },
  { key: 'claimantName', label: 'Claimant', render: (row) => row.claimantName || '—' },
  { key: 'claimType', label: 'Type', render: (row) => row.claimType?.replaceAll('_', ' ') || '—' },
  { key: 'claimAmount', label: 'Claim Amount', render: (row) => formatCurrency(Number(row.claimAmount || 0)) },
  { key: 'approvedAmount', label: 'Approved', render: (row) => formatCurrency(Number(row.approvedAmount || 0)) },
  { key: 'compensationAmount', label: 'Compensation', render: (row) => formatCurrency(Number(row.compensationAmount || 0)) },
  { key: 'status', label: 'Status', render: (row) => <StatusPill status={row.status} metaMap={CLAIM_STATUS_META} /> },
  { key: 'paymentStatus', label: 'Payment', render: (row) => <StatusPill status={row.paymentStatus} metaMap={PAYMENT_STATUS_META} /> },
]

/* ============================================================
   HELPERS
   ============================================================ */
function extractArray(res) {
  const body = res?.data
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body)) return body
  return []
}

async function loadVictimsForCase(caseId) {
  const res = await api.get(`/cases/${caseId}/victims`)
  return extractArray(res).map((v) => ({
    value: v.id,
    label: `${v.name}${v.age ? ` (${v.age} yrs${v.gender ? `, ${v.gender}` : ''})` : ''}`,
  }))
}

async function loadVehiclesForCase(caseId) {
  const res = await api.get(`/cases/${caseId}/vehicles`)
  return extractArray(res).map((v) => ({
    value: v.id,
    label: `${v.registrationNumber}${v.ownerName ? ` — ${v.ownerName}` : ''}`,
  }))
}

const CLAIM_TYPE_OPTIONS = [
  { value: 'VEHICLE_DAMAGE', label: 'Vehicle Damage' },
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'DEATH', label: 'Death' },
  { value: 'DISABILITY', label: 'Disability' },
  { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
  { value: 'THIRD_PARTY', label: 'Third Party' },
  { value: 'OTHER', label: 'Other' },
]
const CLAIM_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PARTIALLY_APPROVED', label: 'Partially Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CLOSED', label: 'Closed' },
]
const PAYMENT_STATUS_OPTIONS = [
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'PENDING', label: 'Pending' },
]

const PAGE_SIZE = 10

/* ============================================================
   FRAMER MOTION VARIANTS
   ============================================================ */
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

/* ============================================================
   STAT TILE
   ============================================================ */
const StatTile = ({ label, value, icon: Icon }) => (
  <Card style={{ padding: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: PURPLE[900]}}>{label}</span>
      <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: PURPLE[50], display: "flex", alignItems: "center", justifyContent: "center", color: PURPLE[500], border: `1px solid ${PURPLE[100]}` }}>
        <Icon size={20} />
      </div>
    </div>
    <div style={{ marginTop: 12, fontSize: 26, fontWeight: 800, color: PURPLE[900], letterSpacing: "-0.03em" }}>{value ?? 0}</div>
  </Card>
);

/* ============================================================
   TOOLBAR: search + status filter
   ============================================================ */
const FilterDropdown = ({ icon: Icon, options, value, onChange, allLabel }) => {
  const [open, setOpen] = useState(false);
  const activeLabel = value ? (options.find((o) => o.value === value)?.label || allLabel) : allLabel;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12,
          border: `1px solid ${PURPLE[100]}`, background: WHITE, boxShadow: cardShadow,
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
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: WHITE, borderRadius: 14, boxShadow: `0 12px 30px -8px ${PURPLE[300]}55`, border: `1px solid ${PURPLE[100]}`, padding: 8, minWidth: 200, zIndex: 20, maxHeight: 280, overflowY: "auto" }}
            >
              <div
                onClick={() => { onChange(''); setOpen(false); }}
                style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: !value ? 700 : 500, color: !value ? PURPLE[600] : PURPLE[800], background: !value ? PURPLE[50] : "transparent", cursor: "pointer" }}
              >
                {allLabel}
              </div>
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: opt.value === value ? 700 : 500, color: opt.value === value ? PURPLE[600] : PURPLE[800], background: opt.value === value ? PURPLE[50] : "transparent", cursor: "pointer" }}
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

const Toolbar = ({ search, onSearch, statusFilter, onStatusFilter, onAdd }) => (
  <Card style={{ padding: 14, marginBottom: 20 }}>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: "1 1 320px", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 12, background: WHITE, boxShadow: insetShadow }}>
        <Search size={16} color={PURPLE[300]} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by claim number, claimant, policy number..."
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: PURPLE[900], width: "100%", fontFamily: "inherit" }}
        />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <FilterDropdown icon={SlidersHorizontal} options={CLAIM_STATUS_OPTIONS} value={statusFilter} onChange={onStatusFilter} allLabel="All Statuses" />
        <PrimaryButton onClick={onAdd}><Plus size={16} /> Add Claim</PrimaryButton>
      </div>
    </div>
  </Card>
);

/* ============================================================
   TABLE
   ============================================================ */
const TableSkeletonRow = () => (
  <tr>
    {Array.from({ length: columns.length + 1 }).map((_, i) => (
      <td key={i} style={{ padding: "14px 16px" }}>
        <div style={{ height: 14, borderRadius: 6, background: PURPLE[50], animation: "pulse 1.5s infinite" }} />
      </td>
    ))}
  </tr>
);

const EmptyRow = () => (
  <tr>
    <td colSpan={columns.length + 1} style={{ padding: "56px 16px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 999, background: PURPLE[50], display: "flex", alignItems: "center", justifyContent: "center", color: PURPLE[400] }}>
          <Inbox size={22} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: PURPLE[900] }}>No claims found</div>
        <div style={{ fontSize: 12.5, color: PURPLE[600], maxWidth: 320 }}>Try a different search term or filter, or add a new claim to get started.</div>
      </div>
    </td>
  </tr>
);

const ClaimsTable = ({ rows, loading, onEdit, onDelete }) => (
  <Card style={{ padding: 0, overflow: "hidden" }}>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: "left", padding: "14px 16px", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: PURPLE[900], borderBottom: `1px solid ${PURPLE[100]}`, whiteSpace: "nowrap" }}>
                {c.label}
              </th>
            ))}
            <th style={{ borderBottom: `1px solid ${PURPLE[100]}` }} />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <TableSkeletonRow key={i} />)
          ) : rows.length === 0 ? (
            <EmptyRow />
          ) : (
            rows.map((row) => (
              <motion.tr key={row.id} whileHover={{ backgroundColor: PURPLE[50] }} style={{ borderBottom: `1px solid ${PURPLE[50]}` }}>
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: "14px 16px", fontSize: 13, color: PURPLE[800], whiteSpace: "nowrap" }}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <IconButton title="Edit" tone="default" onClick={() => onEdit(row)}><Pencil size={15} /></IconButton>
                    <IconButton title="Delete" tone="strong" onClick={() => onDelete(row)}><Trash2 size={15} /></IconButton>
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

const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
      <span style={{ fontSize: 12.5, color: PURPLE[600] }}>Page {page} of {totalPages} · {total} claim{total === 1 ? '' : 's'}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <IconButton title="Previous" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}><ChevronLeft size={18} /></IconButton>
        <IconButton title="Next" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}><ChevronRight size={18} /></IconButton>
      </div>
    </div>
  );
};

/* ============================================================
   DYNAMIC FORM FIELD
   ============================================================ */
const fieldBoxStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 12, border: "none",
  background: WHITE, boxShadow: insetShadow, fontSize: 13.5, color: PURPLE[900],
  fontFamily: "inherit", outline: "none",
};

const FormField = ({ field, value, onChange, dynamicOptions, dynamicLoading, disabled }) => {
  const options = field.loadOptions ? (dynamicOptions[field.name] || []) : (field.options || []);
  const isLoadingOptions = field.loadOptions && dynamicLoading[field.name];

  return (
    <div style={{ gridColumn: field.fullWidth ? "1 / -1" : "auto" }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: PURPLE[700], marginBottom: 6 }}>
        {field.label}
      </label>
      {field.type === 'select' ? (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          disabled={disabled || isLoadingOptions}
          style={{ ...fieldBoxStyle, cursor: disabled ? "not-allowed" : "pointer" }}
        >
          <option value="">{isLoadingOptions ? 'Loading...' : (field.placeholder || 'Select...')}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : field.type === 'date' ? (
        <input type="date" value={value ?? ''} onChange={(e) => onChange(field.name, e.target.value)} style={fieldBoxStyle} />
      ) : field.type === 'number' ? (
        <input type="number" value={value ?? ''} onChange={(e) => onChange(field.name, e.target.value)} style={fieldBoxStyle} placeholder={field.placeholder} />
      ) : (
        <input type="text" value={value ?? ''} onChange={(e) => onChange(field.name, e.target.value)} style={fieldBoxStyle} placeholder={field.placeholder} />
      )}
      {field.hint && <p style={{ margin: "6px 0 0", fontSize: 11.5, color: PURPLE[400] }}>{field.hint}</p>}
    </div>
  );
};

/* ============================================================
   CLAIM FORM MODAL
   ============================================================ */
const ClaimFormModal = ({ open, mode, initialValues, formFields, onClose, onSave }) => {
  const [values, setValues] = useState({});
  const [dynamicOptions, setDynamicOptions] = useState({});
  const [dynamicLoading, setDynamicLoading] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setDynamicOptions({});
      setError('');
    }
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    formFields.forEach((field) => {
      if (field.loadOptions && field.dependsOn) {
        const controllingValue = values[field.dependsOn];
        if (controllingValue) {
          setDynamicLoading((prev) => ({ ...prev, [field.name]: true }));
          field.loadOptions(controllingValue)
            .then((opts) => setDynamicOptions((prev) => ({ ...prev, [field.name]: opts })))
            .catch(() => setDynamicOptions((prev) => ({ ...prev, [field.name]: [] })))
            .finally(() => setDynamicLoading((prev) => ({ ...prev, [field.name]: false })));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, values.caseId]);

  const handleChange = (name, val) => {
    setValues((prev) => {
      const next = { ...prev, [name]: val };
      if (name === 'victimId' && val) next.vehicleId = '';
      if (name === 'vehicleId' && val) next.victimId = '';
      return next;
    });
  };

  const sections = useMemo(() => {
    const order = [];
    formFields.forEach((f) => { if (!order.includes(f.section)) order.push(f.section); });
    return order;
  }, [formFields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(values);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save claim.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, background: `${PURPLE[900]}66`, backdropFilter: "blur(2px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: WHITE, borderRadius: 20, boxShadow: `0 30px 60px -12px ${PURPLE[900]}55`, width: "min(880px, 100%)", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${PURPLE[100]}` }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: PURPLE[900] }}>
                {mode === 'edit' ? 'Edit Claim' : 'Add Claim'}
              </h2>
              <IconButton title="Close" onClick={onClose}><X size={18} /></IconButton>
            </div>

            <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: PURPLE[900], color: WHITE, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}
              {sections.map((section) => (
                <div key={section} style={{ marginBottom: 22 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: PURPLE[500] }}>
                    {section}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {formFields
                      .filter((f) => f.section === section)
                      .filter((f) => !f.showIf || f.showIf(values))
                      .map((field) => (
                        <FormField
                          key={field.name}
                          field={field}
                          value={values[field.name]}
                          onChange={handleChange}
                          dynamicOptions={dynamicOptions}
                          dynamicLoading={dynamicLoading}
                          disabled={field.dependsOn && !values[field.dependsOn]}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </form>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: `1px solid ${PURPLE[100]}` }}>
              <NeumorphismButton onClick={onClose} disabled={saving}>Cancel</NeumorphismButton>
              <PrimaryButton onClick={handleSubmit} disabled={saving}>
                {saving ? <Loader2 size={15} className="spin-icon" /> : null}
                {mode === 'edit' ? 'Save Changes' : 'Create Claim'}
              </PrimaryButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ============================================================
   ROOT COMPONENT
   ============================================================ */
export default function ClaimManagement() {
  const [claims, setClaims] = useState([])
  const [caseOptions, setCaseOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingClaim, setEditingClaim] = useState(null)

  const handleFetch = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await claimService.getAll()
      setClaims(data || [])
      return data
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load claims.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCreate = async (data) => {
    const created = await claimService.create(data)
    setClaims((prev) => [created, ...prev])
    return created
  }

  const handleUpdate = async (id, data) => {
    const updated = await claimService.update(id, data)
    setClaims((prev) => prev.map((item) => (item.id === id ? updated : item)))
    return updated
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete claim ${row.claimNumber}? This cannot be undone.`)) return
    try {
      await claimService.remove(row.id)
      setClaims((prev) => prev.filter((item) => item.id !== row.id))
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to delete claim.')
    }
  }

  useEffect(() => { handleFetch() }, [handleFetch])

  useEffect(() => {
    caseService.getAll()
      .then((cases) => setCaseOptions((cases || []).map((c) => ({ value: c.id, label: c.caseNumber || c.id }))))
      .catch(() => setCaseOptions([]))
  }, [])

  const formFields = useMemo(
    () => [
      { name: 'claimNumber', label: 'Claim Number', section: 'Case & Claimant' },
      { name: 'caseId', label: 'Case', type: 'select', options: caseOptions, placeholder: 'Select a case first', section: 'Case & Claimant' },
      {
        name: 'victimId', label: 'Victim (for Medical / Death / Disability claims)', type: 'select',
        dependsOn: 'caseId', loadOptions: loadVictimsForCase, placeholder: 'Select case first, then victim',
        section: 'Case & Claimant', showIf: (values) => !values.vehicleId,
        hint: 'Leave blank if this claim is for a vehicle instead.',
      },
      {
        name: 'vehicleId', label: 'Vehicle (for Vehicle / Property Damage claims)', type: 'select',
        dependsOn: 'caseId', loadOptions: loadVehiclesForCase, placeholder: 'Select case first, then vehicle',
        section: 'Case & Claimant', showIf: (values) => !values.victimId,
        hint: 'Leave blank if this claim is for a victim instead.',
      },
      { name: 'claimantName', label: 'Claimant Name (auto-filled if linked above)', section: 'Case & Claimant', fullWidth: true },

      { name: 'claimType', label: 'Claim Type', type: 'select', section: 'Claim Details', options: CLAIM_TYPE_OPTIONS },
      { name: 'policyNumber', label: 'Policy Number', section: 'Claim Details' },
      { name: 'insuranceCompany', label: 'Insurance Company', section: 'Claim Details' },
      { name: 'surveyorName', label: 'Surveyor Name', section: 'Claim Details' },

      { name: 'claimAmount', label: 'Claim Amount', type: 'number', section: 'Amounts' },
      { name: 'approvedAmount', label: 'Approved Amount', type: 'number', section: 'Amounts' },
      { name: 'compensationAmount', label: 'Compensation Amount', type: 'number', section: 'Amounts' },

      { name: 'submittedDate', label: 'Submitted Date', type: 'date', section: 'Dates' },
      { name: 'decisionDate', label: 'Decision Date', type: 'date', section: 'Dates' },
      { name: 'paymentDate', label: 'Payment Date', type: 'date', section: 'Dates' },

      { name: 'status', label: 'Status', type: 'select', section: 'Status & Payment', options: CLAIM_STATUS_OPTIONS },
      { name: 'paymentStatus', label: 'Payment Status', type: 'select', section: 'Status & Payment', options: PAYMENT_STATUS_OPTIONS },

      { name: 'remarks', label: 'Remarks', fullWidth: true, section: 'Notes' },
      { name: 'rejectionReason', label: 'Rejection Reason', fullWidth: true, section: 'Notes', showIf: (values) => values.status === 'REJECTED' },
    ],
    [caseOptions]
  )

  const stats = [
    { label: 'Total Claims', value: claims.length, icon: Wallet },
    { label: 'Pending', value: claims.filter((c) => c.status === 'PENDING').length, icon: Clock4 },
    { label: 'Approved', value: claims.filter((c) => c.status === 'APPROVED').length, icon: CheckCircle2 },
    { label: 'Paid', value: claims.filter((c) => c.paymentStatus === 'PAID').length, icon: BadgeIndianRupee },
  ]

  const filteredClaims = useMemo(() => {
    const q = search.trim().toLowerCase();
    return claims.filter((c) => {
      const matchesSearch = !q || ['claimNumber', 'claimantName', 'policyNumber'].some((k) => String(c[k] || '').toLowerCase().includes(q));
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [claims, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredClaims.length / PAGE_SIZE));
  const pagedClaims = filteredClaims.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1) }, [search, statusFilter]);

  const openCreate = () => { setModalMode('create'); setEditingClaim({}); setModalOpen(true); };
  const openEdit = (row) => { setModalMode('edit'); setEditingClaim(row); setModalOpen(true); };

  const handleSave = async (values) => {
    if (modalMode === 'edit') {
      await handleUpdate(editingClaim.id, values);
    } else {
      await handleCreate(values);
    }
  };

  return (
    <div style={{ background: "#faf9fe", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", paddingBottom: 20 }}>
      <style>{`
        * { box-sizing: border-box; }
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>

      <main style={{ maxWidth: 1600, margin: "0 auto", padding: "24px 28px" }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* Page header — plain, no gradient banner */}
          <motion.div variants={itemVariants} className="mb-6 relative">
            <h1 className="text-2xl font-extrabold tracking-tight text-purple-950 pb-1">
              <span className="text-[#8433ec]">Claim</span> Compensation Management
            </h1>

            {/* Dotted Track with Moving Glow Dots */}
            <div className="relative h-4 w-full max-w-md flex items-center my-1 overflow-hidden">
              {/* Base dotted border */}
              <div className="w-full border-b-2 border-dashed border-purple-200" />

              {/* Single running glowing dot */}
              <motion.div
                animate={{ x: ["0px", "400px"] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="absolute left-0 w-2 h-2 bg-[#8433ec] rounded-full shadow-[0_0_8px_#8433ec]"
              />
            </div>

            <p className="text-sm text-purple-600/90 max-w-xl leading-relaxed pt-1">
              Manage claim intake, approvals, compensation amounts, and payment status.
            </p>
          </motion.div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 14, marginBottom: 20, background: PURPLE[900], color: WHITE, fontSize: 13.5, fontWeight: 600 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Stat tiles */}
          <motion.div variants={containerVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
            {stats.map((s) => <StatTile key={s.label} {...s} />)}
          </motion.div>

          {/* Toolbar */}
          <Toolbar search={search} onSearch={setSearch} statusFilter={statusFilter} onStatusFilter={setStatusFilter} onAdd={openCreate} />

          {/* Table */}
          <ClaimsTable rows={pagedClaims} loading={loading} onEdit={openEdit} onDelete={handleDelete} />

          {/* Pagination */}
          <Pagination page={page} totalPages={totalPages} total={filteredClaims.length} onPageChange={setPage} />
        </motion.div>
      </main>

      <ClaimFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={editingClaim}
        formFields={formFields}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}