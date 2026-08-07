// client/src/pages/Users/UserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCog, UserCheck, Building, UserX, Plus, Search,
  SlidersHorizontal, Pencil, Trash2, X, Inbox, AlertCircle,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react'
import { formatDate } from '../../utils/format.js'
import { getUsers, createUser, updateUser, deleteUser } from './services/userService.js'

/* ============================================================
   DESIGN TOKENS — purple (#8433EC) + white only, shared with
   Dashboard.jsx / CaseManagement.jsx / ClaimManagement.jsx /
   DocumentManagement.jsx / Reports.jsx
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
        color: colorMap[tone] || PURPLE[600], display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1,
      }}
    >
      {children}
    </motion.button>
  );
};

/* ============================================================
   STATUS META & PILL — shades of purple only
   ============================================================ */
const USER_STATUS_META = {
  ACTIVE: { label: "Active", color: WHITE, bg: PURPLE[500] },
  INACTIVE: { label: "Inactive", color: PURPLE[700], bg: PURPLE[100] },
};

const StatusPill = ({ status }) => {
  const meta = USER_STATUS_META[status] || { label: status || '—', color: PURPLE[600], bg: PURPLE[50] };
  return (
    <div style={{ padding: "4px 10px", borderRadius: 999, backgroundColor: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700, display: "inline-block", whiteSpace: "nowrap" }}>
      {meta.label}
    </div>
  );
};

/* ============================================================
   CONSTANTS
   ============================================================ */
// The User model's `role` is a free-text string (no schema enum) — this is
// the working list of roles this app actually assigns today. Confirm this
// matches your organization's real roles before shipping; edit freely.
const USER_ROLES = ['Administrator', 'Agent', 'Data Entry Operator', 'Case Manager', 'Investigator', 'Legal Officer']
const ROLE_OPTIONS = USER_ROLES.map((r) => ({ value: r, label: r }))

// Matches the UserStatus enum in schema.prisma exactly.
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
]

const columns = [
  { key: 'name', label: 'Name', render: (row) => <span style={{ fontWeight: 700, color: PURPLE[600] }}>{row.name}</span> },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department', render: (row) => row.department || '—' },
  { key: 'lastLogin', label: 'Last Login', render: (row) => (row.lastLogin ? formatDate(row.lastLogin) : 'Never') },
  { key: 'status', label: 'Status', render: (row) => <StatusPill status={row.status} /> },
]

const formFields = [
  { name: 'name', label: 'Full Name', fullWidth: true },
  { name: 'email', label: 'Email Address', type: 'email' },
  { name: 'password', label: 'Password (required for new users, leave blank to keep current on edit)', type: 'password', fullWidth: true },
  { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS },
  { name: 'department', label: 'Department' },
  { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
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
      <span style={{ fontSize: 13, fontWeight: 600, color: PURPLE[900] }}>{label}</span>
      <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: PURPLE[50], display: "flex", alignItems: "center", justifyContent: "center", color: PURPLE[500], border: `1px solid ${PURPLE[100]}` }}>
        <Icon size={20} />
      </div>
    </div>
    <div style={{ marginTop: 12, fontSize: 26, fontWeight: 800, color: PURPLE[900], letterSpacing: "-0.03em" }}>{value ?? 0}</div>
  </Card>
);

/* ============================================================
   TOOLBAR: search + role filter
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

const Toolbar = ({ search, onSearch, roleFilter, onRoleFilter, onAdd }) => (
  <Card style={{ padding: 14, marginBottom: 20 }}>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: "1 1 320px", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 12, background: WHITE, boxShadow: insetShadow }}>
        <Search size={16} color={PURPLE[300]} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: PURPLE[900], width: "100%", fontFamily: "inherit" }}
        />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <FilterDropdown icon={SlidersHorizontal} options={ROLE_OPTIONS} value={roleFilter} onChange={onRoleFilter} allLabel="All Roles" />
        <PrimaryButton onClick={onAdd}><Plus size={16} /> Add User</PrimaryButton>
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
        <div style={{ fontSize: 14, fontWeight: 700, color: PURPLE[900] }}>No users found</div>
        <div style={{ fontSize: 12.5, color: PURPLE[600], maxWidth: 320 }}>Try a different search term or filter, or add a new user to get started.</div>
      </div>
    </td>
  </tr>
);

const UsersTable = ({ rows, loading, onEdit, onDelete }) => (
  <Card style={{ padding: 0, overflow: "hidden" }}>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
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
      <span style={{ fontSize: 12.5, color: PURPLE[600] }}>Page {page} of {totalPages} · {total} user{total === 1 ? '' : 's'}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <IconButton title="Previous" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}><ChevronLeft size={18} /></IconButton>
        <IconButton title="Next" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}><ChevronRight size={18} /></IconButton>
      </div>
    </div>
  );
};

/* ============================================================
   FORM FIELD
   ============================================================ */
const fieldBoxStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 12, border: "none",
  background: WHITE, boxShadow: insetShadow, fontSize: 13.5, color: PURPLE[900],
  fontFamily: "inherit", outline: "none",
};

const FormField = ({ field, value, onChange }) => (
  <div style={{ gridColumn: field.fullWidth ? "1 / -1" : "auto" }}>
    <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: PURPLE[700], marginBottom: 6 }}>
      {field.label}
    </label>
    {field.type === 'select' ? (
      <select
        value={value ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        style={{ ...fieldBoxStyle, cursor: "pointer" }}
      >
        <option value="">Select...</option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : (
      <input
        type={field.type || 'text'}
        value={value ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        style={fieldBoxStyle}
        autoComplete={field.type === 'password' ? 'new-password' : 'off'}
      />
    )}
  </div>
);

/* ============================================================
   USER FORM MODAL
   ============================================================ */
const UserFormModal = ({ open, mode, initialValues, onClose, onSave }) => {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setError('');
    }
  }, [open, initialValues]);

  const handleChange = (name, val) => setValues((prev) => ({ ...prev, [name]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(values);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save user.');
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
            style={{ background: WHITE, borderRadius: 20, boxShadow: `0 30px 60px -12px ${PURPLE[900]}55`, width: "min(640px, 100%)", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${PURPLE[100]}` }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: PURPLE[900] }}>
                {mode === 'edit' ? 'Edit User' : 'Add User'}
              </h2>
              <IconButton title="Close" onClick={onClose}><X size={18} /></IconButton>
            </div>

            <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: PURPLE[900], color: WHITE, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {formFields.map((field) => (
                  <FormField key={field.name} field={field} value={values[field.name]} onChange={handleChange} />
                ))}
              </div>
            </form>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: `1px solid ${PURPLE[100]}` }}>
              <NeumorphismButton onClick={onClose} disabled={saving}>Cancel</NeumorphismButton>
              <PrimaryButton onClick={handleSubmit} disabled={saving}>
                {saving ? <Loader2 size={15} className="spin-icon" /> : null}
                {mode === 'edit' ? 'Save Changes' : 'Create User'}
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
export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingUser, setEditingUser] = useState(null)

  const handleFetch = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getUsers()
      setUsers(data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { handleFetch() }, [handleFetch])

  const handleCreate = async (data) => {
    const created = await createUser(data)
    setUsers((prev) => [created, ...prev])
    return created
  }

  const handleUpdate = async (id, data) => {
    const updated = await updateUser(id, data)
    setUsers((prev) => prev.map((item) => (item.id === id ? updated : item)))
    return updated
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete user ${row.name}? This cannot be undone.`)) return
    try {
      await deleteUser(row.id)
      setUsers((prev) => prev.filter((item) => item.id !== row.id))
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to delete user.')
    }
  }

  const stats = [
    { label: 'Total Users', value: users.length, icon: UserCog },
    { label: 'Active', value: users.filter((u) => u.status === 'ACTIVE').length, icon: UserCheck },
    { label: 'Departments', value: new Set(users.map((u) => u.department).filter(Boolean)).size, icon: Building },
    { label: 'Inactive', value: users.filter((u) => u.status === 'INACTIVE').length, icon: UserX },
  ]

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch = !q || ['name', 'email', 'role'].some((k) => String(u[k] || '').toLowerCase().includes(q));
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1) }, [search, roleFilter]);

  const openCreate = () => { setModalMode('create'); setEditingUser({ status: 'ACTIVE' }); setModalOpen(true); };
  const openEdit = (row) => { setModalMode('edit'); setEditingUser({ ...row, password: '' }); setModalOpen(true); };

  const handleSave = async (values) => {
    if (modalMode === 'edit') {
      await handleUpdate(editingUser.id, values);
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
          <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: PURPLE[900] }}>
              <span style={{ color: PURPLE[500] }}>User</span> Management
            </h1>
            <p style={{ fontSize: 13.5, color: PURPLE[600], marginTop: 4, maxWidth: 620, lineHeight: 1.5 }}>
              Manage system users, roles, and access.
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
          <Toolbar search={search} onSearch={setSearch} roleFilter={roleFilter} onRoleFilter={setRoleFilter} onAdd={openCreate} />

          {/* Table */}
          <UsersTable rows={pagedUsers} loading={loading} onEdit={openEdit} onDelete={handleDelete} />

          {/* Pagination */}
          <Pagination page={page} totalPages={totalPages} total={filteredUsers.length} onPageChange={setPage} />
        </motion.div>
      </main>

      <UserFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={editingUser}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}