import { useMemo, useState } from 'react'
import { filterByField, filterBySearch, paginate } from '../utils/table.js'

export default function useTableData(items, { searchKeys = [], filterField = null, pageSize = 6 } = {}) {
  const [search, setSearch] = useState('')
  const [filterValue, setFilterValue] = useState('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = filterBySearch(items, search, searchKeys)
    if (filterField) {
      result = filterByField(result, filterField, filterValue)
    }
    return result
  }, [items, search, filterValue, filterField, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(() => paginate(filtered, currentPage, pageSize), [filtered, currentPage, pageSize])

  const setSearchAndReset = (value) => {
    setSearch(value)
    setPage(1)
  }

  const setFilterAndReset = (value) => {
    setFilterValue(value)
    setPage(1)
  }

  return {
    search,
    setSearch: setSearchAndReset,
    filterValue,
    setFilterValue: setFilterAndReset,
    page: currentPage,
    setPage,
    totalPages,
    filteredCount: filtered.length,
    paginated,
  }
}
