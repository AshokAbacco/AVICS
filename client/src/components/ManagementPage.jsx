//client\src\components\ManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Download, Plus, Upload } from 'lucide-react'
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
  const { register, handleSubmit, reset } = useForm()

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
    reset({})
    addModal.open()
  }

  const openEditModal = (row) => {
    setEditingRow(row)
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
      {/* delete Claim with model */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-[340px] sm:max-w-[380px] rounded-xl bg-white dark:bg-gray-900 shadow-xl overflow-hidden">

            {/* Header */}
            <div className="flex flex-col items-center pt-5">
              <div className="flex items-center justify-center bg-red-100 rounded-full h-14 w-14 dark:bg-red-900/30">
                <svg
                  className="text-red-600 h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                  />
                </svg>
              </div>

              <h2 className="mt-3 text-lg font-bold text-gray-800 dark:text-white">
                Delete Record?
              </h2>
            </div>

            {/* Body */}
            <div className="px-5 py-3 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete
              </p>

              <p className="mt-2 text-base font-semibold text-red-600 break-all">
                {deleteModal.row?.claimNumber ||
                  deleteModal.row?.caseNumber ||
                  deleteModal.row?.name ||
                  deleteModal.row?.id}
              </p>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={cancelDelete}
                className="flex-1 py-2 text-sm font-medium text-gray-700 transition border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-sm font-medium text-white transition bg-red-600 rounded-lg hover:bg-red-700"
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
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          {formFields.map((field) => (
            <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
              {field.type === 'select' ? (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-600">{field.label}</span>
                  <select className="input-base" {...register(field.name)}>
                    {field.options.map((opt) => {
                      const optionValue = typeof opt === 'string' ? opt : opt.value
                      const optionLabel = typeof opt === 'string' ? opt : opt.label
                      return (
                        <option key={optionValue} value={optionValue}>
                          {optionLabel}
                        </option>
                      )
                    })}
                  </select>
                </label>
              ) : (
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
              )}
            </div>
          ))}
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