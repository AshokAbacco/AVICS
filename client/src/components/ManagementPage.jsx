import React, { useState } from 'react'
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
 */
export default function ManagementPage({
  title,
  subtitle,
  breadcrumbLabel,
  initialData,
  columns,
  formFields,
  searchKeys,
  filterField,
  filterOptions,
  filterLabel = 'Status',
  stats = [],
  idPrefix = 'REC',
}) {
  const [items, setItems] = useState(initialData)
  const { search, setSearch, filterValue, setFilterValue, page, setPage, totalPages, paginated } = useTableData(
    items,
    { searchKeys, filterField, pageSize: 6 }
  )

  const addModal = useDisclosure()
  const viewModal = useDisclosure()
  const [selectedRow, setSelectedRow] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const { register, handleSubmit, reset } = useForm()

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
    if (window.confirm(`Delete record ${row.id}? This action cannot be undone.`)) {
      setItems((prev) => prev.filter((item) => item.id !== row.id))
    }
  }

  const onSubmit = (data) => {
    if (editingRow) {
      setItems((prev) => prev.map((item) => (item.id === editingRow.id ? { ...item, ...data } : item)))
    } else {
      const newId = `${idPrefix}-${Math.floor(1000 + Math.random() * 9000)}`
      setItems((prev) => [{ ...data, id: newId }, ...prev])
    }
    addModal.close()
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
        emptyTitle={`No ${breadcrumbLabel.toLowerCase()} found`}
        emptyDescription="Try a different search term or filter, or add a new record to get started."
      />

      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        title={editingRow ? `Edit ${breadcrumbLabel.replace(/s$/, '')}` : `Add ${breadcrumbLabel.replace(/s$/, '')}`}
        footer={
          <>
            <Button variant="outline" onClick={addModal.close}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>{editingRow ? 'Save Changes' : 'Add Record'}</Button>
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
                <Input label={field.label} type={field.type || 'text'} {...register(field.name)} />
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
                <dd className="mt-0.5 text-sm font-medium text-slate-700">{String(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  )
}
