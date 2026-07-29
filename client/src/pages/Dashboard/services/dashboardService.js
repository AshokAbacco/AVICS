// client/src/pages/Dashboard/services/dashboardService.js
import api from '../../../services/api.js'

export const getDashboardSummary = () => api.get('/dashboard/summary').then((r) => r.data.data)