//client\src\components\ManagementPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { AlertTriangle, Download, Plus, Upload, X } from 'lucide-react'
import PageHeader from './PageHeader.jsx'
import StatCard from './StatCard.jsx'
import SearchBar from './SearchBar.jsx'
import FilterBar from './FilterBar.jsx'
import DataTable from './DataTable.jsx'
import Button from './Button.jsx'
import Modal from './Modal.jsx'
import Input from './Input.jsx'
import useTableData from '../hooks/useTableData.js'
import useDisclosure from '../hooks/useDisclosure.js'
import { exportToCSV } from '../utils/table.js'

/**
 * ManagementPage renders the full, consistent CRUD experience required
 * across every module: header, breadcrumb, stat cards, search, filter,
 * table, pagination, add/edit/view/delete actions, export & import, and a
 * professional empty state (handled inside DataTable).
 *
 * API integration is OPTIONAL. Pass onFetch/onCreate/onUpdate/onDelete to
 * hook this page up to a real backend. If omitted, the page behaves exactly
 * as before -- local-only state seeded from `initialData`. This means every
 * other module (Cases, Vehicles, Hospitals, etc.) that hasn't been wired to
 * a backend yet keeps working unchanged.
 *
 * onDataChange (optional): called with the current `items` array every time
 * it changes (after fetch, create, update, or delete). Lets a parent page
 * compute live stat-card numbers (e.g. "Active users") from real data
 * without needing a second fetch, since ManagementPage owns `items`
 * internally and previously never exposed it upward. Purely additive --
 * existing callers that don't pass it are unaffected.
 *
 * DEPENDENT FIELDS (optional, additive): a `select` field can declare
 *   { name: 'victimId', type: 'select', dependsOn: 'caseId', loadOptions: async (caseId) => [...] }
 * instead of a static `options` array. Whenever the watched `dependsOn`
 * field's value changes, `loadOptions(value)` is called and its resolved
 * options replace this field's option list. If `dependsOn`'s value is
 * cleared, options reset to []. If the user changes `dependsOn` to a
 * *different* value after the field already had options loaded (i.e. a
 * real change, not the initial load when editing an existing row), this
 * field's current selection is cleared, since it likely no longer applies.
 * Fields that don't set `dependsOn`/`loadOptions` behave exactly as before.
 *
 * SECTIONS (optional, additive): a field can declare `section: 'Amounts'`
 * to be grouped under a labeled divider in the Add/Edit modal instead of
 * sitting in one flat grid. Fields sharing the same `section` string are
 * grouped together, in first-appearance order. Fields with no `section`
 * fall into a single unlabeled group. Existing formFields arrays that never
 * set `section` render exactly as before -- one flat grid, no headers.
 *
 * CONDITIONAL FIELDS (optional, additive): a field can declare
 *   { name: 'rejectionReason', showIf: (values) => values.status === 'REJECTED' }
 * where `values` is the live (watched) state of the whole form. The field
 * is only rendered while showIf returns true. Fields without showIf always
 * render, exactly as before.
 *
 * modalSize (optional): passed straight through to the underlying Modal's
 * `size` prop ('sm' | 'md' | 'lg' | 'xl'). Defaults to 'lg', which fits a
 * two-column form comfortably -- pass 'xl' for forms with many fields.
 */
export default function ManagementPage({
  title,
  subtitle,
  breadcrumbLabel,
  initialData = [],
  columns,
  formFields,
  searchKeys,
  filterField,
  filterOptions,
  filterLabel = 'Status',
  stats = [],
  idPrefix = 'REC',
  modalSize = 'lg',
  // Optional async API handlers
  onFetch,   // async () => items[]
  onCreate,  // async (data) => createdItem
  onUpdate,  // async (id, data) => updatedItem
  onDelete,  // async (id) => void
  onDataChange, // optional (items[]) => void
}) {
  const [items, setItems] = useState(initialData)
  const [loading, setLoading] = useState(!!onFetch)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    row: null,
  });

  const { search, setSearch, filterValue, setFilterValue, page, setPage, totalPages, paginated } = useTableData(
    items,
    { searchKeys, filterField, pageSize: 6 }
  )

  const addModal = useDisclosure()
  const viewModal = useDisclosure()
  const [selectedRow, setSelectedRow] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const { register, handleSubmit, reset, watch, setValue } = useForm()

  // Dynamic option lists for fields using dependsOn/loadOptions, keyed by
  // field name. Static-options fields never touch this.
  const [dynamicOptions, setDynamicOptions] = useState({})
  const prevDepValueRef = useRef({})

  const dependentFields = formFields.filter((f) => f.dependsOn && f.loadOptions)
  // Calling watch() here (during render, not inside an effect) is the
  // documented react-hook-form pattern for reacting to a field's value --
  // it subscribes this component to re-render whenever that field changes.
  const dependencyValues = dependentFields.map((f) => watch(f.dependsOn))

  // Live snapshot of the whole form, used to evaluate each field's
  // optional showIf(values). Cheap -- react-hook-form dedupes re-renders.
  const liveValues = watch()

  useEffect(() => {
    let cancelled = false

    dependentFields.forEach((field, idx) => {
      const depValue = dependencyValues[idx]
      const prevValue = prevDepValueRef.current[field.name]
      const isRealChange = prevValue !== undefined && prevValue !== depValue

      prevDepValueRef.current[field.name] = depValue

      if (!depValue) {
        setDynamicOptions((prev) => ({ ...prev, [field.name]: [] }))
        return
      }

      if (isRealChange) {
        // The parent field changed to a different value after this field
        // already had a selection loaded against the old value -- clear it,
        // it no longer applies (e.g. switching Case clears the old Victim).
        setValue(field.name, '')
      }

      field
        .loadOptions(depValue)
        .then((opts) => {
          if (!cancelled) setDynamicOptions((prev) => ({ ...prev, [field.name]: opts || [] }))
        })
        .catch(() => {
          if (!cancelled) setDynamicOptions((prev) => ({ ...prev, [field.name]: [] }))
        })
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyValues)

  // Keep the parent in sync with the current items list, whenever it changes.
  useEffect(() => {
    onDataChange?.(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const loadData = useCallback(async () => {
    if (!onFetch) return
    setLoading(true)
    setErrorMsg('')
    try {
      const data = await onFetch()
      setItems(data || [])
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load records.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openAddModal = () => {
    setEditingRow(null)
    prevDepValueRef.current = {}
    setDynamicOptions({})
    reset({})
    addModal.open()
  }

  const openEditModal = (row) => {
    setEditingRow(row)
    // Reset tracked previous dependency values so the initial load for this
    // row's existing caseId doesn't get treated as a "real change" that
    // wipes the row's own victimId/vehicleId selection.
    prevDepValueRef.current = {}
    setDynamicOptions({})
    reset(row)
    addModal.open()
  }

  const openViewModal = (row) => {
    setSelectedRow(row)
    viewModal.open()
  }

  const handleDelete = (row) => {
    setDeleteModal({
      open: true,
      row,
    });
  };
  const confirmDelete = async () => {
    const row = deleteModal.row;

    if (!row) return;

    try {
      if (onDelete) {
        await onDelete(row.id);
      }

      setItems((prev) => prev.filter((item) => item.id !== row.id));

      setDeleteModal({
        open: false,
        row: null,
      });
    } catch (err) {
      alert(err.message || "Failed to delete record.");
    }
  };

  const cancelDelete = () => {
    setDeleteModal({
      open: false,
      row: null,
    });
  };

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      if (editingRow) {
        if (onUpdate) {
          const updated = await onUpdate(editingRow.id, data)
          setItems((prev) =>
            prev.map((item) => (item.id === editingRow.id ? { ...item, ...(updated || data) } : item))
          )
        } else {
          setItems((prev) => prev.map((item) => (item.id === editingRow.id ? { ...item, ...data } : item)))
        }
      } else {
        if (onCreate) {
          const created = await onCreate(data)
          setItems((prev) => [created || { ...data, id: `${idPrefix}-${Date.now()}` }, ...prev])
        } else {
          const newId = `${idPrefix}-${Math.floor(1000 + Math.random() * 9000)}`
          setItems((prev) => [{ ...data, id: newId }, ...prev])
        }
      }
      addModal.close()
    } catch (err) {
      window.alert(err.message || 'Failed to save record.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleImportClick = () => {
    window.alert('Import: choose a CSV file to bulk-upload records (demo action).')
  }

  // Group formFields by their optional `section`, preserving first-
  // appearance order. Fields without a section land in one unlabeled group
  // -- if no field in the whole array sets `section`, this produces exactly
  // one group with no header, i.e. identical to the old flat-grid behavior.
  const fieldGroups = []
  const groupIndexByKey = {}
  formFields.forEach((field) => {
    const key = field.section || '__ungrouped__'
    if (!(key in groupIndexByKey)) {
      groupIndexByKey[key] = fieldGroups.length
      fieldGroups.push({ label: field.section || null, fields: [] })
    }
    fieldGroups[groupIndexByKey[key]].fields.push(field)
  })

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbItems={[{ label: breadcrumbLabel }]}
        actions={
          <>
            <Button variant="outline" icon={Upload} onClick={handleImportClick}>
              Import
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => exportToCSV(items, `${breadcrumbLabel.toLowerCase().replace(/\s+/g, '-')}.csv`)}
            >
              Export
            </Button>
            <Button icon={Plus} onClick={openAddModal}>
              Add {breadcrumbLabel.replace(/s$/, '')}
            </Button>
          </>
        }
      />

      {errorMsg && (
        <div className="px-4 py-3 mb-4 text-sm border border-red-200 rounded-xl bg-red-50 text-danger">
          {errorMsg}
        </div>
      )}

      {stats.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, idx) => (
            <StatCard key={stat.label} {...stat} delay={idx * 0.05} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${breadcrumbLabel.toLowerCase()}...`} />
        {filterField && (
          <FilterBar value={filterValue} onChange={setFilterValue} options={filterOptions} label={filterLabel} />
        )}
      </div>

      {/* Delete confirmation */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-[380px] overflow-hidden rounded-2xl bg-white shadow-elevated">
            <div className="flex flex-col items-center pt-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-danger">
                <AlertTriangle size={26} strokeWidth={2} />
              </div>
              <h2 className="mt-3 text-base font-semibold text-slate-800">Delete Record?</h2>
            </div>

            <div className="px-6 py-3 text-center">
              <p className="text-sm text-slate-500">Are you sure you want to delete</p>
              <p className="mt-2 break-all text-base font-semibold text-danger">
                {deleteModal.row?.claimNumber ||
                  deleteModal.row?.caseNumber ||
                  deleteModal.row?.name ||
                  deleteModal.row?.id}
              </p>
              <p className="mt-2 text-xs text-slate-400">This action cannot be undone.</p>
            </div>

            <div className="flex gap-2 border-t border-border p-4">
              <button
                onClick={cancelDelete}
                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-danger py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={paginated}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onView={openViewModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
        loading={loading}
        emptyTitle={`No ${breadcrumbLabel.toLowerCase()} found`}
        emptyDescription="Try a different search term or filter, or add a new record to get started."
      />

      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        size={modalSize}
        title={editingRow ? `Edit ${breadcrumbLabel.replace(/s$/, '')}` : `Add ${breadcrumbLabel.replace(/s$/, '')}`}
        footer={
          <>
            <Button variant="outline" onClick={addModal.close} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={submitting}>
              {submitting ? 'Saving...' : editingRow ? 'Save Changes' : 'Add Record'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {fieldGroups.map((group, gi) => {
            const visibleFields = group.fields.filter((f) => (f.showIf ? f.showIf(liveValues) : true))
            if (visibleFields.length === 0) return null

            return (
              <div key={group.label || `group-${gi}`} className={gi === 0 ? '' : 'mt-6'}>
                {group.label && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">{group.label}</h4>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {visibleFields.map((field) => {
                    const isDependent = field.dependsOn && field.loadOptions
                    const effectiveOptions = isDependent ? (dynamicOptions[field.name] || []) : field.options

                    return (
                      <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                        {field.type === 'select' ? (
                          <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-600">{field.label}</span>
                            <select className="input-base" {...register(field.name)}>
                              {(isDependent || field.placeholder) && field.placeholder !== false && (
                                <option value="">{typeof field.placeholder === 'string' ? field.placeholder : '-- Select --'}</option>
                              )}
                              {effectiveOptions.map((opt) => {
                                const optionValue = typeof opt === 'string' ? opt : opt.value
                                const optionLabel = typeof opt === 'string' ? opt : opt.label
                                return (
                                  <option key={optionValue} value={optionValue}>
                                    {optionLabel}
                                  </option>
                                )
                              })}
                            </select>
                            {field.hint && <span className="mt-1 block text-xs text-slate-400">{field.hint}</span>}
                          </label>
                        ) : (
                          <>
                            <Input
                              label={field.label}
                              type={field.type || 'text'}
                              {...register(
                                field.name,
                                field.type === 'number'
                                  ? {
                                    setValueAs: (v) => (v === '' || v === null || v === undefined ? '' : Number(v)),
                                  }
                                  : {}
                              )}
                            />
                            {field.hint && <span className="mt-1 block text-xs text-slate-400">{field.hint}</span>}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </form>
      </Modal>

      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        title={`${breadcrumbLabel.replace(/s$/, '')} Details`}
        footer={<Button variant="outline" onClick={viewModal.close}>Close</Button>}
      >
        {selectedRow && (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(selectedRow).map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs font-medium tracking-wide uppercase text-slate-400">{key}</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-700">{String(value ?? '')}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  )
}