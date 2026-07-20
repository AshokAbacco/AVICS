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
}) {
  const [items, setItems] = useState(initialData)
  const [loading, setLoading] = useState(!!onFetch)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { search, setSearch, filterValue, setFilterValue, page, setPage, totalPages, paginated } = useTableData(
    items,
    { searchKeys, filterField, pageSize: 6 }
  )

  const addModal = useDisclosure()
  const viewModal = useDisclosure()
  const [selectedRow, setSelectedRow] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const { register, handleSubmit, reset } = useForm()

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

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete record ${row.id}? This action cannot be undone.`)) return

    if (onDelete) {
      try {
        await onDelete(row.id)
        setItems((prev) => prev.filter((item) => item.id !== row.id))
      } catch (err) {
        window.alert(err.message || 'Failed to delete record.')
      }
      return
    }

    setItems((prev) => prev.filter((item) => item.id !== row.id))
  }

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
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          {errorMsg}
        </div>
      )}

      {stats.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, idx) => (
            <StatCard key={stat.label} {...stat} delay={idx * 0.05} />
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${breadcrumbLabel.toLowerCase()}...`} />
        {filterField && (
          <FilterBar value={filterValue} onChange={setFilterValue} options={filterOptions} label={filterLabel} />
        )}
      </div>

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
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
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
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{key}</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-700">{String(value ?? '')}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  )
}